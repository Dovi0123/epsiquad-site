import { NextResponse } from 'next/server';

// Определяем товары (в реальном приложении это могли бы храниться в базе данных)
const products = [
  {
    id: 'vpn-germany-1m',
    name: 'VPN Германия (1 месяц)',
    description: 'Надежный VPN с сервером в Германии на 1 месяц.',
    price: 120,
    link: '/setup/vpn-germany',
    location: 'germany',
    duration: 1
  },
  {
    id: 'vpn-germany-3m',
    name: 'VPN Германия (3 месяца)',
    description: 'Надежный VPN с сервером в Германии на 3 месяца.',
    price: 340,
    link: '/setup/vpn-germany',
    location: 'germany',
    duration: 3
  },
  {
    id: 'vpn-germany-6m',
    name: 'VPN Германия (6 месяцев)',
    description: 'Надежный VPN с сервером в Германии на 6 месяцев.',
    price: 650,
    link: '/setup/vpn-germany',
    location: 'germany',
    duration: 6
  },
  {
    id: 'vpn-germany-12m',
    name: 'VPN Германия (12 месяцев)',
    description: 'Надежный VPN с сервером в Германии на 12 месяцев.',
    price: 1200,
    link: '/setup/vpn-germany',
    location: 'germany',
    duration: 12
  },
  {
    id: 'vpn-russia-1m',
    name: 'VPN Россия (1 месяц)',
    description: 'Быстрый VPN с сервером в России на 1 месяц.',
    price: 120,
    link: '/setup/vpn-russia',
    location: 'russia',
    duration: 1
  },
  {
    id: 'vpn-russia-3m',
    name: 'VPN Россия (3 месяца)',
    description: 'Быстрый VPN с сервером в России на 3 месяца.',
    price: 340,
    link: '/setup/vpn-russia',
    location: 'russia',
    duration: 3
  },
  {
    id: 'vpn-russia-6m',
    name: 'VPN Россия (6 месяцев)',
    description: 'Быстрый VPN с сервером в России на 6 месяцев.',
    price: 650,
    link: '/setup/vpn-russia',
    location: 'russia',
    duration: 6
  },
  {
    id: 'vpn-russia-12m',
    name: 'VPN Россия (12 месяцев)',
    description: 'Быстрый VPN с сервером в России на 12 месяцев.',
    price: 1200,
    link: '/setup/vpn-russia',
    location: 'russia',
    duration: 12
  }
];

export async function GET() {
  try {
    // Возвращаем список товаров
    return NextResponse.json(products);
  } catch (error) {
    console.error('Failed to fetch products:', error);
    return NextResponse.json(
      { message: 'Internal Server Error' },
      { status: 500 },
    );
  }
}