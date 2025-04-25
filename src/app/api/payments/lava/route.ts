import { NextResponse } from 'next/server';
import { getUserIdFromSession, createOrder, getUserById } from '@/lib/db';
import { PAYMENT_CONFIG } from '@/lib/config';
import crypto from 'crypto';

// Получаем конфигурацию Lava из единого файла конфигурации
const LAVA_API_URL = PAYMENT_CONFIG.lava.apiUrl;
const LAVA_MERCHANT_ID = PAYMENT_CONFIG.lava.merchantId;
const LAVA_SECRET_KEY = PAYMENT_CONFIG.lava.secretKey;

// Проверяем наличие обязательных переменных окружения
if (!PAYMENT_CONFIG.lava.isConfigured()) {
  console.error('LAVA API configuration missing. Please set LAVA_MERCHANT_ID and LAVA_SECRET_KEY environment variables.');
}

// Генерация подписи для запросов к Lava API
function generateSignature(data: Record<string, unknown>, secretKey: string): string {
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

// API для создания платежа
export async function POST(request: Request) {
  try {
    // Проверяем авторизацию
    const userId = await getUserIdFromSession(request);
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Получаем данные платежа из запроса
    const { items, amount, customerId, email, description } = await request.json();
    
    if (!items || !items.length || !amount) {
      return NextResponse.json(
        { error: 'Invalid payment data' },
        { status: 400 }
      );
    }
    
    // Получаем информацию о пользователе
    const user = getUserById(userId);
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    
    // Генерируем уникальный идентификатор для заказа
    const orderId = `EPS-${Date.now()}-${userId}`;
    
    // Формируем данные для запроса к Lava API
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const paymentData: Record<string, any> = {
      merchantId: LAVA_MERCHANT_ID,
      orderId: orderId,
      amount: amount.toString(),
      currency: 'RUB',
      description: description || 'Оплата услуг VPN',
      email: email || user.email,
      returnUrl: `${request.headers.get('origin') || 'https://yourdomain.com'}/payment/success`,
      hookUrl: `${request.headers.get('origin') || 'https://yourdomain.com'}/api/payments/lava/hook`,
      failUrl: `${request.headers.get('origin') || 'https://yourdomain.com'}/payment/fail`,
      expire: 3600, // Время жизни ссылки в секундах (1 час)
      customerId: customerId || userId.toString()
    };
    
    // Генерируем подпись
    const signature = generateSignature(paymentData, LAVA_SECRET_KEY);
    paymentData.signature = signature;

    // Отправляем запрос к Lava API
    try {
      const response = await fetch(`${LAVA_API_URL}/invoice/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(paymentData)
      });

      const lavaResponse = await response.json();

      if (!response.ok || !lavaResponse.success) {
        console.error('Lava API error:', lavaResponse);
        return NextResponse.json(
          { error: lavaResponse.message || 'Payment processing error' },
          { status: 500 }
        );
      }

      // Создаем запись о заказе в базе данных
      createOrder(userId, items);
      
      // Возвращаем URL для оплаты
      return NextResponse.json({
        success: true,
        redirectUrl: lavaResponse.data.url,
        orderId: orderId
      });
      
    } catch (error) {
      console.error('Error connecting to Lava API:', error);
      return NextResponse.json(
        { error: 'Payment service unavailable' },
        { status: 503 }
      );
    }
    
  } catch (error) {
    console.error('Payment processing error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Обработка вебхука от платежной системы
export async function PUT(request: Request) {
  try {
    const data = await request.json();
    
    // Проверяем подпись
    const signature = data.signature;
    delete data.signature;
    
    const calculatedSignature = generateSignature(data, LAVA_SECRET_KEY);
    
    if (signature !== calculatedSignature) {
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 403 }
      );
    }
    
    // Проверяем статус платежа
    if (data.status === 'success') {
      // Здесь логика обновления статуса заказа в базе данных
      // Например, можно обновить статус заказа на 'completed'
      console.log('Payment successful:', data);
      
      // TODO: Обновить статус заказа в базе данных
      
      return NextResponse.json({ success: true });
    }
    
    return NextResponse.json({
      success: false,
      message: 'Payment not completed'
    });
    
  } catch (error) {
    console.error('Webhook processing error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}