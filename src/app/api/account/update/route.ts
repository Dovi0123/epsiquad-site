import { NextResponse } from 'next/server';
import { getUserFromCookies, updateUser, getUserByEmail } from '@/lib/db';
import bcrypt from 'bcryptjs';

type User = {
  id: number;
  email: string;
  password: string;
  name: string;
  notifications: boolean;
  cart: string;
};

export async function POST(request: Request) {
  try {
    // Получаем текущего пользователя из cookie (больше не передаем cookieStore)
    const user = await getUserFromCookies() as User | null;
    
    if (!user) {
      return NextResponse.json({ error: 'Пользователь не авторизован' }, { status: 401 });
    }

    const data = await request.json();
    // Обработка смены пароля
    if (data.currentPassword && data.newPassword) {
      // Проверяем текущий парольч
      const isPasswordValid = await bcrypt.compare(data.currentPassword, user.password);
      if (!isPasswordValid) {
        return NextResponse.json({ error: 'Текущий пароль введен неверно' }, { status: 400 });
      }
      
      // Хешируем новый пароль
      const hashedPassword = await bcrypt.hash(data.newPassword, 10);
      data.password = hashedPassword;
      
      // Удаляем лишние поля
      delete data.currentPassword;
      delete data.newPassword;
    }
    
    // Проверка на уникальность email при его изменении
    if (data.email && data.email !== user.email) {
      const existingUser = getUserByEmail(data.email);
      if (existingUser) {
        return NextResponse.json({ error: 'Пользователь с таким email уже существует' }, { status: 400 });
      }
    }
    
    // Обновляем только разрешенные поля
    const allowedFields = ['name', 'email', 'password', 'notifications', 'language', 'theme'];
    const updateData = Object.fromEntries(
      Object.entries(data).filter(([key]) => allowedFields.includes(key))
    );
    
    // Если данные пусты или содержат только неразрешенные поля
    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: 'Нет данных для обновления' }, { status: 400 });
    }
    
    await updateUser(user.id, updateData);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Ошибка обновления профиля:', error);
    return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 });
  }
}