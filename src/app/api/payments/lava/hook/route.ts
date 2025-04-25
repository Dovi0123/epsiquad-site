import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { getDb } from '@/lib/db';

// Конфигурация для Lava API - в реальном приложении хранить в переменных окружения
const LAVA_SECRET_KEY = 'YOUR_SECRET_KEY'; // Замените на ваш секретный ключ

// Генерация подписи для запросов к Lava API
function generateSignature(data: Record<string, any>, secretKey: string): string {
  // Сортируем ключи
  const keys = Object.keys(data).sort();
  
  // Формируем строку для подписи
  let signatureString = '';
  keys.forEach(key => {
    if (key !== 'signature' && data[key] !== null && data[key] !== undefined) {
      signatureString += `${key}:${data[key]};`;
    }
  });
  
  // Добавляем секретный ключ
  signatureString += secretKey;
  
  // Возвращаем SHA-256 хеш
  return crypto.createHash('sha256').update(signatureString).digest('hex');
}

// Обработка вебхука от платежной системы
export async function POST(request: Request) {
  try {
    const data = await request.json();
    
    // Логируем данные вебхука
    console.log('Received webhook from Lava:', data);
    
    // Проверяем наличие подписи
    if (!data.signature) {
      console.error('No signature in webhook data');
      return NextResponse.json(
        { error: 'No signature' },
        { status: 403 }
      );
    }
    
    // Проверяем подпись
    const signature = data.signature;
    const payloadWithoutSignature = { ...data };
    delete payloadWithoutSignature.signature;
    
    const calculatedSignature = generateSignature(payloadWithoutSignature, LAVA_SECRET_KEY);
    
    if (signature !== calculatedSignature) {
      console.error('Invalid signature in webhook');
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 403 }
      );
    }
    
    // Проверяем статус платежа
    if (data.status === 'success') {
      // Извлекаем ID заказа из orderId
      const orderId = data.orderId;
      
      if (!orderId) {
        console.error('No order ID in successful payment');
        return NextResponse.json(
          { error: 'No order ID' },
          { status: 400 }
        );
      }
      
      // Обновляем статус заказа в базе данных
      try {
        const db = getDb();
        const orderIdParts = orderId.split('-');
        
        if (orderIdParts.length < 3) {
          console.error('Invalid order ID format:', orderId);
          return NextResponse.json(
            { error: 'Invalid order ID format' },
            { status: 400 }
          );
        }
        
        // Получаем цифровой ID заказа из базы данных
        const numericOrderId = parseInt(orderIdParts[2]);
        
        // Обновляем статус заказа
        const result = db.prepare(
          'UPDATE orders SET status = ? WHERE id = ?'
        ).run('completed', numericOrderId);
        
        if (result.changes === 0) {
          console.error('Order not found:', numericOrderId);
          return NextResponse.json(
            { error: 'Order not found' },
            { status: 404 }
          );
        }
        
        console.log(`Order #${numericOrderId} marked as completed`);
        
        return NextResponse.json({ success: true });
      } catch (dbError) {
        console.error('Database error while updating order:', dbError);
        return NextResponse.json(
          { error: 'Database error' },
          { status: 500 }
        );
      }
    } else if (data.status === 'fail') {
      // Обработка неудачного платежа
      console.log('Payment failed:', data);
      // Дополнительная логика обработки неудачного платежа
      
      return NextResponse.json({ success: true, message: 'Payment failure recorded' });
    }
    
    // Для прочих статусов просто логируем
    console.log(`Payment status ${data.status} recorded`);
    
    return NextResponse.json({
      success: true,
      message: 'Webhook received'
    });
    
  } catch (error) {
    console.error('Webhook processing error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}