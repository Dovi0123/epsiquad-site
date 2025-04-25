/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextResponse } from 'next/server';
import { getUserIdFromSession, getUserOrders, getDb } from '@/lib/db';
import crypto from 'crypto';
import { XuiApi, ClientVlessOptions} from "3x-ui";

const port = 8245
const GRhost = "thunder-vpn.ru"
const GRpath = "9zNh09xohvMZ8vn"
const MSKhost = "msk."+GRhost
const MSKpath = "FxwX0WPtzXQUdPW"

const GRapi = new XuiApi(`https://${GRhost}:${port}/${GRpath}/`)
GRapi.stdTTL = 60; // Cache time in seconds - default is 10s

const MSKapi = new XuiApi(`https://${MSKhost}:${port}/${MSKpath}/`)
GRapi.stdTTL = 60; // Cache time in seconds - default is 10s

// Генерация случайной строки
function generateRandomString(length: number): string {
  return crypto.randomBytes(Math.ceil(length / 2))
    .toString('hex')
    .slice(0, length);
}

// Генерация случайной ссылки на подписку
function generateSubscriptionLink(orderId: number, productId: string): string {
  const randomId = generateRandomString(8);
  const serverLocation = productId.includes('germany') ? '' : 'msk';
  const subPatch = productId.includes('germany') ? 'sdjHIBNiugIUHDgnjkfpdZjb' : 'FxwX0WPtzXQUdPW';
  const SubApi = productId.includes('germany') ? GRapi : MSKapi
  const Time = productId.split("-")[2].replace("m", "") as unknown as number
  
  const Client = {
    id: generateRandomString(16),
    sub: randomId,
    email: generateRandomString(16),
    expiryTime: Time * 2592000000,
    enable: true,
    totalGB: 0,
    limitIp: 0
  } as ClientVlessOptions
  
  SubApi.addClient(29,Client)
  // Создаем случайную ссылку подписки
  const subscriptionLink = `https://${serverLocation}.thunder-vpn.ru/${subPatch}/${randomId}`;
  
  return subscriptionLink;
}

// Получить существующую ссылку или создать новую
async function getOrCreateSubscription(orderId: number, productId: string) {
  const db = getDb();
  
  // Проверяем, есть ли уже конфигурация для этого заказа
  const existingConfig = db.prepare(
    'SELECT * FROM configs WHERE order_id = ?'
  ).get(orderId) as { config_data: string } | undefined;
  
  if (existingConfig) {
    return existingConfig.config_data;
  }
  
  // Если нет, создаем новую ссылку
  const subscriptionLink = generateSubscriptionLink(orderId, productId);
  
  // Сохраняем в базе
  db.prepare(
    'INSERT INTO configs (order_id, config_data) VALUES (?, ?)'
  ).run(orderId, subscriptionLink);
  
  return subscriptionLink;
}

// API для получения ссылки на подписку
export async function GET(request: Request) {
  try {
    // Проверяем авторизацию
    const userId = await getUserIdFromSession(request);
    if (!userId) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 },
      );
    }
    
    // Получаем ID заказа из query параметров
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get('orderId');
    
    // Если указан конкретный заказ
    if (orderId) {
      // Проверяем, принадлежит ли заказ этому пользователю
      const orders = getUserOrders(userId) as Array<{ id: number | string; order_data: string }>;
      const order = orders.find(o => o.id.toString() === orderId);
      
      if (!order) {
        return NextResponse.json(
          { message: 'Order not found' },
          { status: 404 },
        );
      }
      
      // Парсим данные заказа
      let orderData;
      try {
        orderData = JSON.parse(order.order_data);
      } catch (e) {
        orderData = [];
      }
      
      if (!orderData.length) {
        return NextResponse.json(
          { message: 'Invalid order data' },
          { status: 400 },
        );
      }
      
      // Берем первый продукт из заказа для генерации ссылки
      const productId = orderData[0];
      
      // Получаем или создаем ссылку на подписку
      const subscriptionLink = await getOrCreateSubscription(parseInt(orderId), productId);
      
      return NextResponse.json({ 
        success: true, 
        subscriptionLink: subscriptionLink,
        productId: productId
      });
    }
    
    // Если orderId не указан, возвращаем информацию, что нужно указать ID заказа
    return NextResponse.json(
      { message: 'Order ID is required' },
      { status: 400 },
    );
  } catch (error) {
    console.error('Failed to get subscription link:', error);
    return NextResponse.json(
      { message: 'Internal Server Error' },
      { status: 500 },
    );
  }
}