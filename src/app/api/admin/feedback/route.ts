import { NextResponse } from 'next/server';
import { 
  getUserFromCookies, 
  isAdmin, 
  getAllFeedbackMessages, 
  getFeedbackMessageById,
  getFeedbackResponses, 
  addFeedbackResponse, 
  updateFeedbackStatus 
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

// Получение списка всех сообщений обратной связи
export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const feedbackId = url.searchParams.get('feedbackId');
    
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
    if (feedbackId) {
      const messageDetails = getFeedbackMessageById(parseInt(feedbackId));
      
      if (!messageDetails) {
        return NextResponse.json({ 
          error: 'Сообщение не найдено' 
        }, { status: 404 });
      }
      
      // Получаем все ответы на сообщение
      const responses = getFeedbackResponses(parseInt(feedbackId));
      
      return NextResponse.json({ 
        message: messageDetails,
        responses 
      });
    }

    // Иначе получаем список всех сообщений
    const messages = getAllFeedbackMessages();
    
    return NextResponse.json({ messages });
    
  } catch (error) {
    console.error('Ошибка при получении сообщений обратной связи:', error);
    return NextResponse.json({ 
      error: 'Внутренняя ошибка сервера' 
    }, { status: 500 });
  }
}

// API для ответа на сообщение или изменения статуса
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

    const { action, feedbackId, message, status } = await request.json();
    
    if (!action || !feedbackId) {
      return NextResponse.json({ 
        error: 'Необходимо указать действие и ID сообщения' 
      }, { status: 400 });
    }

    let result;
    
    switch(action) {
      case 'respond':
        // Проверяем наличие сообщения
        if (!message || message.trim() === '') {
          return NextResponse.json({ 
            error: 'Текст ответа не может быть пустым' 
          }, { status: 400 });
        }
        
        // Добавляем ответ
        result = addFeedbackResponse(
          parseInt(feedbackId), 
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
          result = updateFeedbackStatus(parseInt(feedbackId), status);
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
      feedbackId,
      changes: result.changes 
    });
    
  } catch (error) {
    console.error('Ошибка при работе с сообщением обратной связи:', error);
    return NextResponse.json({ 
      error: 'Внутренняя ошибка сервера' 
    }, { status: 500 });
  }
}