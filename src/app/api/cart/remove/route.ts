import { NextResponse } from 'next/server';
import { getUserIdFromSession, getUserCart, updateUserCart } from '@/lib/db';

export async function DELETE(request: Request) {
  try {
    const userId = await getUserIdFromSession(request);
    if (!userId) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 },
      );
    }

    // Получаем productId из query params
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId');

    if (!productId) {
      return NextResponse.json(
        { message: 'Product ID is required' },
        { status: 400 },
      );
    }

    // Получаем текущую корзину
    const cart = getUserCart(userId);
    
    // Удаляем товар из корзины
    const updatedCart = cart.filter((id: string) => id !== productId);
    
    // Обновляем корзину в БД
    updateUserCart(userId, updatedCart);

    return NextResponse.json({ success: true, items: updatedCart });
  } catch (error) {
    console.error('Failed to remove from cart:', error);
    return NextResponse.json(
      { message: 'Internal Server Error' },
      { status: 500 },
    );
  }
}