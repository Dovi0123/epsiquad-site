import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Получаем текущий хост из заголовка
  const hostname = request.headers.get('host');
  
  // Разрешенный домен (замените на ваш домен)
  const allowedDomain = 'shop.epsiquad.ru';
  
  // Если домен не соответствует разрешенному
  if (hostname !== allowedDomain) {
    // Перенаправление на правильный домен
    return NextResponse.redirect(`https://${allowedDomain}${request.nextUrl.pathname}`);
  }
  
  return NextResponse.next();
}

// Конфигурация для применения ко всем путям
export const config = {
  matcher: ['/(.*)', '/'] // Применять ко всем путям
};