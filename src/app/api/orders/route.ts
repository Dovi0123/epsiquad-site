import { NextResponse } from 'next/server';
import { getUserIdFromSession, getUserOrders } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const userId = await getUserIdFromSession(request);
    if (!userId) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 },
      );
    }

    // Получаем заказы пользователя из базы данных
    const rawOrders = getUserOrders(userId) as Array<{ id: string; order_data: string; created_at: string }>;
    
    // Преобразуем данные заказов в нужный формат
    const orders = rawOrders.map((order) => {
      // Распарсим JSON строку из order_data
      let orderData;
      try {
        orderData = JSON.parse(order.order_data);
      } catch (e) {
        orderData = [];
        console.error('Failed to parse order data:', e);
      }
      
      // Создаем объект заказа в нужном формате
      return {
        id: order.id,
        date: order.created_at,
        status: 'completed', // Статус по умолчанию, можно изменить если есть поле в БД
        items: Array.isArray(orderData) ? orderData : [], // Массив ID товаров
        total: 0 // Временно ставим 0, в клиенте пересчитаем на основе items
      };
    });
    
    return NextResponse.json({ success: true, orders });
  } catch (error) {
    console.error('Failed to get orders:', error);
    return NextResponse.json(
      { message: 'Internal Server Error' },
      { status: 500 },
    );
  }
}