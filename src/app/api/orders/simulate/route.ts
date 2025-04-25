import { NextResponse } from 'next/server';
import { getUserIdFromSession, getUserCart, createOrder } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const userId = await getUserIdFromSession(request);
    if (!userId) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 },
      );
    }

    // Получаем корзину пользователя
    const cart = getUserCart(userId);
    
    if (cart.length === 0) {
      return NextResponse.json(
        { message: 'Cart is empty' },
        { status: 400 },
      );
    }

    // Создаем симулированный заказ и очищаем корзину
    const result = createOrder(userId, cart);

    return NextResponse.json({
      success: true,
      message: 'Симуляция заказа успешно создана',
      orderId: result.lastInsertRowid,
    });
  } catch (error) {
    console.error('Failed to simulate order:', error);
    return NextResponse.json(
      { message: 'Internal Server Error' },
      { status: 500 },
    );
  }
}