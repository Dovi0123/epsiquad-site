import { NextResponse } from 'next/server';
import { getUserIdFromSession, getUserById, createSupportTicket, createFeedbackMessage } from '@/lib/db';

export async function POST(request: Request) {
  try {
    // Получаем данные из запроса
    const { name, email, subject, message, isAnonymous } = await request.json();
    
    // Проверка обязательных полей
    if (!subject || !message) {
      return NextResponse.json({ 
        error: 'Тема и сообщение обязательны' 
      }, { status: 400 });
    }

    // Если это анонимное сообщение (от неавторизованного пользователя)
    if (isAnonymous) {
      // Проверяем дополнительные поля для неавторизованных пользователей
      if (!name || !email) {
        return NextResponse.json({ 
          error: 'Имя и email обязательны для неавторизованных пользователей'
        }, { status: 400 });
      }
      
      // Создаем сообщение обратной связи
      const result = createFeedbackMessage(name, email, subject, message);
      
      return NextResponse.json({
        success: true,
        feedbackId: result.lastInsertRowid
      });
    } else {
      // Для авторизованных пользователей - создаем обращение в поддержку
      const userId = await getUserIdFromSession(request);
      
      if (!userId) {
        return NextResponse.json({ 
          error: 'Пользователь не авторизован'
        }, { status: 401 });
      }
      
      // Проверяем существование пользователя
      const user = getUserById(userId);
      if (!user) {
        return NextResponse.json({ 
          error: 'Пользователь не найден' 
        }, { status: 404 });
      }
      
      // Создаем обращение в поддержку
      const result = createSupportTicket(userId, subject, message);
      
      return NextResponse.json({
        success: true,
        ticketId: result.lastInsertRowid
      });
    }
  } catch (error) {
    console.error('Ошибка при обработке обращения:', error);
    return NextResponse.json({ 
      error: 'Внутренняя ошибка сервера' 
    }, { status: 500 });
  }
}