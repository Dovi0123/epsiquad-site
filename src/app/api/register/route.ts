import { NextRequest, NextResponse } from 'next/server';
import { createUser, getUserByEmail } from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function POST(req: NextRequest) {
  const { email, password, name } = await req.json();
  if (!email || !password || !name) {
    return NextResponse.json({ error: 'Все поля обязательны' }, { status: 400 });
  }
  if (getUserByEmail(email)) {
    return NextResponse.json({ error: 'Пользователь уже существует' }, { status: 409 });
  }
  const hash = await bcrypt.hash(password, 10);
  createUser(email, hash, name);
  return NextResponse.json({ success: true });
}
