import { NextRequest, NextResponse } from 'next/server';
import { createUser, getUserByEmail, createAdminUser, getUserFromCookies, isAdmin } from '@/lib/db';
import bcrypt from 'bcryptjs';

type User = {
  id: number;
  email: string;
  password: string;
  name: string;
  notifications: boolean;
  cart: string;
  is_admin: boolean;
};


export async function POST(req: NextRequest) {
  const { email, password, name, isAdmin: createAsAdmin } = await req.json();
  
  if (!email || !password || !name) {
    return NextResponse.json({ error: 'Все поля обязательны' }, { status: 400 });
  }
  
  if (getUserByEmail(email)) {
    return NextResponse.json({ error: 'Пользователь уже существует' }, { status: 409 });
  }
  
  const hash = await bcrypt.hash(password, 10);
  
  // Если запрос на создание администратора, то проверяем права текущего пользователя
  if (createAsAdmin) {
    const currentUser = await getUserFromCookies() as User | null;
    
    // Только администратор может создать другого администратора
    if (!currentUser || !isAdmin(currentUser.id)) {
      return NextResponse.json({ error: 'Недостаточно прав для создания администратора' }, { status: 403 });
    }
    
    const result = createAdminUser(email, hash, name);
    return NextResponse.json({ success: true, userId: result.lastInsertRowid });
  } else {
    // Обычная регистрация пользователя
    const result = createUser(email, hash, name);
    return NextResponse.json({ success: true, userId: result.lastInsertRowid });
  }
}
