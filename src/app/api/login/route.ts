import { NextRequest, NextResponse } from 'next/server';
import { getUserByEmail } from '@/lib/db';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret';

export async function POST(req: NextRequest) {
  const { email, password } = await req.json();
  if (!email || !password) {
    return NextResponse.json({ error: 'Email и пароль обязательны' }, { status: 400 });
  }
  const user = getUserByEmail(email);
  if (!user) {
    return NextResponse.json({ error: 'Пользователь не найден' }, { status: 401 });
  }
  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    return NextResponse.json({ error: 'Неверный пароль' }, { status: 401 });
  }
  const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
  const res = NextResponse.json({ success: true });
  res.cookies.set('token', token, { httpOnly: true, path: '/', maxAge: 60 * 60 * 24 * 7 });
  return res;
}
