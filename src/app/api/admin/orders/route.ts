import { NextResponse } from 'next/server';
import { getUserFromCookies, isAdmin, getAllOrders, updateOrderStatus } from '@/lib/db';

type User = {
    id: number;
    email: string;
    password: string;
    name: string;
    notifications: boolean;
    cart: string;
    is_admin: boolean;
  };
// Получение списка всех заказов (только для админов)
export async function GET() {
  try {
    const user = await getUserFromCookies() as User | null;
    
    if (!user) {
      return NextResponse.json({ 
        error: 'Пользователь не авторизован' 
      }, { status: 401 });
    }

    // Проверяем права администратора
    if (!isAdmin(user.id)) {
      return NextResponse.json({ 
        error: 'Недостаточно прав для выполнения этой операции' 
      }, { status: 403 });
    }

    // Получаем список всех заказов
    const orders = getAllOrders();
    
    return NextResponse.json({ orders });
    
  } catch (error) {
    console.error('Ошибка при получении списка заказов:', error);
    return NextResponse.json({ 
      error: 'Внутренняя ошибка сервера' 
    }, { status: 500 });
  }
}

// API для обновления статуса заказов
export async function POST(request: Request) {
  try {
    const user = await getUserFromCookies() as User | null;
    
    if (!user) {
      return NextResponse.json({ 
        error: 'Пользователь не авторизован' 
      }, { status: 401 });
    }

    // Проверяем права администратора
    if (!isAdmin(user.id)) {
      return NextResponse.json({ 
        error: 'Недостаточно прав для выполнения этой операции' 
      }, { status: 403 });
    }

    const { orderId, status } = await request.json();
    
    if (!orderId || !status) {
      return NextResponse.json({ 
        error: 'Необходимо указать ID заказа и новый статус' 
      }, { status: 400 });
    }

    // Проверяем, что статус имеет допустимое значение
    const validStatuses = ['pending', 'completed', 'cancelled', 'simulated'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ 
        error: 'Недопустимый статус заказа' 
      }, { status: 400 });
    }

    // Обновляем статус заказа
    const result = updateOrderStatus(parseInt(orderId), status);

    return NextResponse.json({ 
      success: true, 
      orderId, 
      status,
      changes: result.changes 
    });
    
  } catch (error) {
    console.error('Ошибка при обновлении статуса заказа:', error);
    return NextResponse.json({ 
      error: 'Внутренняя ошибка сервера' 
    }, { status: 500 });
  }
}