import { NextResponse } from 'next/server';
import { getUserIdFromSession, getUserCart, updateUserCart } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const userId = await getUserIdFromSession(request);
    if (!userId) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 },
      );
    }

    const { productId } = await request.json();
    if (!productId) {
      return NextResponse.json(
        { message: 'Product ID is required' },
        { status: 400 },
      );
    }

    // Получаем текущую корзину
    const cart = getUserCart(userId);
    
    // Проверяем, есть ли уже такой товар в корзине
    if (!cart.includes(productId)) {
      cart.push(productId);
      updateUserCart(userId, cart);
    }

    return NextResponse.json({ success: true, items: cart });
  } catch (error) {
    console.error('Failed to add to cart:', error);
    return NextResponse.json(
      { message: 'Internal Server Error' },
      { status: 500 },
    );
  }
}