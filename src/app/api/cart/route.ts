import { NextResponse } from 'next/server';
import { getUserIdFromSession, getUserCart } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const userId = await getUserIdFromSession(request);
    if (!userId) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 },
      );
    }

    const cart = getUserCart(userId);

    return NextResponse.json({ items: cart });
  } catch (error) {
    console.error('Failed to get cart:', error);
    return NextResponse.json(
      { message: 'Internal Server Error' },
      { status: 500 },
    );
  }
}