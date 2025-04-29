import { NextResponse } from 'next/server';
import { 
  getUserFromCookies, 
  isAdmin, 
  getAllSupportTickets, 
  getSupportTicketById,
  getSupportTicketResponses, 
  addSupportTicketResponse, 
  updateSupportTicketStatus 
} from '@/lib/db';

type User = {
    id: number;
    email: string;
    password: string;
    name: string;
    notifications: boolean;
    cart: string;
    is_admin: boolean;
  };

// Получение списка всех обращений в поддержку
export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const ticketId = url.searchParams.get('ticketId');
    
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

    // Если указан ID обращения, получаем детальную информацию
    if (ticketId) {
      const ticketDetails = getSupportTicketById(parseInt(ticketId));
      
      if (!ticketDetails) {
        return NextResponse.json({ 
          error: 'Обращение не найдено' 
        }, { status: 404 });
      }
      
      // Получаем все ответы на обращение
      const responses = getSupportTicketResponses(parseInt(ticketId));
      
      return NextResponse.json({ 
        ticket: ticketDetails,
        responses 
      });
    }

    // Иначе получаем список всех обращений
    const tickets = getAllSupportTickets();
    
    return NextResponse.json({ tickets });
    
  } catch (error) {
    console.error('Ошибка при получении обращений в поддержку:', error);
    return NextResponse.json({ 
      error: 'Внутренняя ошибка сервера' 
    }, { status: 500 });
  }
}

// API для ответа на обращение или изменения статуса
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

    const { action, ticketId, message, status } = await request.json();
    
    if (!action || !ticketId) {
      return NextResponse.json({ 
        error: 'Необходимо указать действие и ID обращения' 
      }, { status: 400 });
    }

    let result;
    
    switch(action) {
      case 'respond':
        // Проверяем наличие сообщения
        if (!message || message.trim() === '') {
          return NextResponse.json({ 
            error: 'Сообщение не может быть пустым' 
          }, { status: 400 });
        }
        
        // Добавляем ответ
        result = addSupportTicketResponse(
          parseInt(ticketId), 
          user.id, 
          message
        );
        break;
        
      case 'update_status':
        // Проверяем наличие статуса
        if (!status) {
          return NextResponse.json({ 
            error: 'Необходимо указать новый статус' 
          }, { status: 400 });
        }
        
        try {
          // Обновляем статус
          result = updateSupportTicketStatus(parseInt(ticketId), status);
        } catch (err) {
          return NextResponse.json({ 
            error: err instanceof Error ? err.message : 'Ошибка при обновлении статуса' 
          }, { status: 400 });
        }
        break;
        
      default:
        return NextResponse.json({ 
          error: 'Неизвестное действие' 
        }, { status: 400 });
    }

    return NextResponse.json({ 
      success: true, 
      action,
      ticketId,
      changes: result.changes 
    });
    
  } catch (error) {
    console.error('Ошибка при работе с обращением в поддержку:', error);
    return NextResponse.json({ 
      error: 'Внутренняя ошибка сервера' 
    }, { status: 500 });
  }
}