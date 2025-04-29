import { NextResponse } from 'next/server';
import { getUserFromCookies, isAdmin } from '@/lib/db';

type User = {
    id: number;
    email: string;
    password: string;
    name: string;
    notifications: boolean;
    cart: string;
    is_admin: boolean;
  };

export async function GET() {
  try {
    const user = await getUserFromCookies() as User | null;
    
    if (!user) {
      return NextResponse.json({ 
        isAdmin: false, 
        error: 'Пользователь не авторизован' 
      }, { status: 401 });
    }

    const adminStatus = isAdmin(user.id);
    
    return NextResponse.json({ 
      isAdmin: adminStatus
    });
    
  } catch (error) {
    console.error('Ошибка при проверке статуса администратора:', error);
    return NextResponse.json({ 
      isAdmin: false, 
      error: 'Внутренняя ошибка сервера' 
    }, { status: 500 });
  }
}