import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  // Сбросить cookie с токеном
  const res = NextResponse.json({ success: true });
  res.cookies.set('token', '', { httpOnly: true, path: '/', maxAge: 0 });
  return res;
}
