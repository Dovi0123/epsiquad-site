import { NextResponse } from 'next/server';
import { getUserFromCookies, addSupportTicketResponse, getSupportTicketById } from '@/lib/db';

type User = {
    id: number;
    email: string;
    password: string;
    name: string;
    notifications: boolean;
    cart: string;
    is_admin: boolean;
  };


export async function POST(request: Request) {
  try {
    // Получаем текущего пользователя
    const user = await getUserFromCookies() as User | null;
    
    if (!user) {
      return NextResponse.json({ 
        error: 'Пользователь не авторизован' 
      }, { status: 401 });
    }

    const { ticketId, message } = await request.json();
    
    if (!ticketId || !message || message.trim() === '') {
      return NextResponse.json({ 
        error: 'ID обращения и сообщение обязательны' 
      }, { status: 400 });
    }

    // Проверяем, принадлежит ли тикет текущему пользователю
    const ticket = getSupportTicketById(parseInt(ticketId));
    if (!ticket || ticket.user_id !== user.id) {
      return NextResponse.json({ 
        error: 'Обращение не найдено или доступ запрещен' 
      }, { status: 404 });
    }

    // Добавляем ответ
    const result = addSupportTicketResponse(parseInt(ticketId), user.id, message);
    
    return NextResponse.json({ 
      success: true, 
      responseId: result.lastInsertRowid 
    });
    
  } catch (error) {
    console.error('Ошибка при отправке ответа на обращение:', error);
    return NextResponse.json({ 
      error: 'Внутренняя ошибка сервера' 
    }, { status: 500 });
  }
}