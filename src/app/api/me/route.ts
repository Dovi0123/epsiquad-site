import { NextRequest, NextResponse } from 'next/server';
import { getUserById } from '@/lib/db';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret';

type User = {
  id: number;
  email: string;
  password: string;
  name: string;
  notifications: boolean;
  cart: string;
  is_admin: boolean;
};

export async function GET(req: NextRequest) {
  const token = req.cookies.get('token')?.value;
  if (!token) {
    return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
  }
  try {
    const payload = jwt.verify(token, JWT_SECRET) as { id: number; email: string };
    const user = getUserById(payload.id) as User | null;
    if (!user) {
      return NextResponse.json({ error: 'Пользователь не найден' }, { status: 404 });
    }
    return NextResponse.json({ id: user.id, email: user.email, name: user.name });
  } catch {
    return NextResponse.json({ error: 'Неверный токен' }, { status: 401 });
  }
}
