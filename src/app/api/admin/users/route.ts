import { NextResponse } from 'next/server';
import { getUserFromCookies, isAdmin, getAllUsers, makeUserAdmin, removeAdminRights, deleteUser } from '@/lib/db';

type User = {
    id: number;
    email: string;
    password: string;
    name: string;
    notifications: boolean;
    cart: string;
    is_admin: boolean;
  };

// Получение списка всех пользователей (только для админов)
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

    // Получаем список всех пользователей
    const users = getAllUsers();
    
    return NextResponse.json({ users });
    
  } catch (error) {
    console.error('Ошибка при получении списка пользователей:', error);
    return NextResponse.json({ 
      error: 'Внутренняя ошибка сервера' 
    }, { status: 500 });
  }
}

// API для обновления статуса админа и удаления пользователей
export async function POST(request: Request) {
  try {
    const currentUser = await getUserFromCookies() as User | null;
    
    if (!currentUser) {
      return NextResponse.json({ 
        error: 'Пользователь не авторизован' 
      }, { status: 401 });
    }

    // Проверяем права администратора
    if (!isAdmin(currentUser.id)) {
      return NextResponse.json({ 
        error: 'Недостаточно прав для выполнения этой операции' 
      }, { status: 403 });
    }

    const { action, userId } = await request.json();
    
    if (!action || !userId) {
      return NextResponse.json({ 
        error: 'Необходимо указать действие и ID пользователя' 
      }, { status: 400 });
    }

    // Предотвращаем изменение прав самого себя
    if (parseInt(userId) === currentUser.id) {
      return NextResponse.json({ 
        error: 'Невозможно изменить свои собственные права' 
      }, { status: 400 });
    }

    let result;
    
    switch(action) {
      case 'make_admin':
        result = makeUserAdmin(parseInt(userId));
        break;
      case 'remove_admin':
        result = removeAdminRights(parseInt(userId));
        break;
      case 'delete':
        result = deleteUser(parseInt(userId));
        break;
      default:
        return NextResponse.json({ 
          error: 'Неизвестное действие' 
        }, { status: 400 });
    }

    return NextResponse.json({ 
      success: true, 
      action, 
      userId,
      changes: result.changes 
    });
    
  } catch (error) {
    console.error('Ошибка при управлении пользователями:', error);
    return NextResponse.json({ 
      error: 'Внутренняя ошибка сервера' 
    }, { status: 500 });
  }
}