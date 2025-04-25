import { NextResponse } from 'next/server';
// Import the User type
import { getUserFromCookies, updateUser, getUserByEmail, User } from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  try {
    // getUserFromCookies now returns Promise<User | null>
    const user: User | null = await getUserFromCookies();
    
    // Check if user exists and has a password property
    // The password check is crucial here
    if (!user || !user.password) { 
      return NextResponse.json({ error: 'Пользователь не авторизован или данные неполны' }, { status: 401 });
    }

    const data = await request.json();
    
    // Define updatePayload with the correct type Partial<User>
    const updatePayload: Partial<User> = {};

    // Обработка смены пароля
    if (data.currentPassword && data.newPassword) {
      // user.password is now correctly typed as string | undefined, but the check above ensures it's string
      const isPasswordValid = await bcrypt.compare(data.currentPassword, user.password);
      if (!isPasswordValid) {
        return NextResponse.json({ error: 'Текущий пароль введен неверно' }, { status: 400 });
      }
      
      // Хешируем новый пароль
      const hashedPassword = await bcrypt.hash(data.newPassword, 10);
      updatePayload.password = hashedPassword;
    }
    
    // Обработка других полей
    const allowedFields: (keyof User)[] = ['name', 'email', 'notifications', 'language', 'theme'];
    for (const key of allowedFields) {
      if (data[key] !== undefined && data[key] !== user[key]) { // Update only if value is provided and different
        // Type assertion needed because key is a dynamic index
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (updatePayload as Record<keyof User, any>)[key] = data[key]; 
      }
    }

    // Проверка на уникальность email при его изменении
    if (updatePayload.email) { // Check if email is part of the update
      // No need to check against user.email, already handled in the loop above
      const existingUser = getUserByEmail(updatePayload.email);
      // Ensure the found user is not the current user
      if (existingUser && existingUser.id !== user.id) { 
        return NextResponse.json({ error: 'Пользователь с таким email уже существует' }, { status: 400 });
      }
    }
    
    // Если данные для обновления пусты
    if (Object.keys(updatePayload).length === 0) {
      return NextResponse.json({ message: 'Нет данных для обновления' }, { status: 200 }); // Or status 400 if no change is an error
    }
    
    // updateUser expects Partial<User>
    await updateUser(user.id, updatePayload);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Ошибка обновления профиля:', error);
    return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 });
  }
}