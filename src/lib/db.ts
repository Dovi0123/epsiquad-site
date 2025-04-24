import Database from 'better-sqlite3';
import path from 'path';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret';

// Путь к базе данных (создаётся в корне проекта)
const db = new Database(path.resolve(process.cwd(), 'users.db'));

// Создание таблицы пользователей, если не существует
// email уникален, password - хеш, name - имя пользователя
// id - автоинкремент
const init = () => {
  db.prepare(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    name TEXT NOT NULL,
    notifications BOOLEAN DEFAULT 1,
    language TEXT DEFAULT 'ru',
    theme TEXT DEFAULT 'system',
    cart TEXT DEFAULT '[]'
  )`).run();
  
  // Создаем таблицу заказов
  db.prepare(`CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    order_data TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'simulated',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id)
  )`).run();
  
  // Создаем таблицу конфигураций VPN
  db.prepare(`CREATE TABLE IF NOT EXISTS configs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id INTEGER NOT NULL,
    config_data TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders (id)
  )`).run();
};

init();

export function createUser(email: string, password: string, name: string) {
  const stmt = db.prepare('INSERT INTO users (email, password, name) VALUES (?, ?, ?)');
  return stmt.run(email, password, name);
}

export function getUserByEmail(email: string) {
  const stmt = db.prepare('SELECT * FROM users WHERE email = ?');
  return stmt.get(email);
}

export function getUserById(id: number) {
  const stmt = db.prepare('SELECT * FROM users WHERE id = ?');
  return stmt.get(id);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function updateUser(id: number, data: Record<string, any>) {
  // Создаем SQL запрос для обновления
  const columns = Object.keys(data);
  const placeholders = columns.map(col => `${col} = ?`).join(', ');
  const values = Object.values(data);
  
  const stmt = db.prepare(`UPDATE users SET ${placeholders} WHERE id = ?`);
  values.push(id);
  return stmt.run(...values);
}

export async function getUserFromCookies() {
  // cookies() должен использоваться с await
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  
  if (!token) return null;
  
  try {
    // Верифицируем JWT токен
    const payload = jwt.verify(token, JWT_SECRET) as { id: number; email: string };
    return getUserById(payload.id);
  } catch {
    // Если токен неверный или истек, возвращаем null
    return null;
  }
}

// Получить ID пользователя из запроса (на основе cookie)
export async function getUserIdFromSession(request: Request) {
  const cookieHeader = request.headers.get('cookie');
  if (!cookieHeader) return null;

  const tokenCookie = cookieHeader
    .split(';')
    .map(cookie => cookie.trim())
    .find(cookie => cookie.startsWith('token='));

  if (!tokenCookie) return null;
  
  const token = tokenCookie.split('=')[1];
  
  try {
    const payload = jwt.verify(token, JWT_SECRET) as { id: number; email: string };
    return payload.id;
  } catch {
    return null;
  }
}

// Функция для подключения к базе данных
export function getDb() {
  return db;
}

// Функции для работы с корзиной
export function getUserCart(userId: number) {
  const user = getUserById(userId);
  if (!user) return [];
  try {
    return JSON.parse(user.cart || '[]');
  } catch (e) {
    return [];
  }
}

export function updateUserCart(userId: number, cart: any[]) {
  return updateUser(userId, { cart: JSON.stringify(cart) });
}

// Функции для работы с заказами
export function createOrder(userId: number, orderData: any) {
  const stmt = db.prepare('INSERT INTO orders (user_id, order_data) VALUES (?, ?)');
  const result = stmt.run(userId, JSON.stringify(orderData));
  // Очищаем корзину пользователя
  updateUserCart(userId, []);
  return result;
}

export function getUserOrders(userId: number) {
  const stmt = db.prepare('SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC');
  return stmt.all(userId);
}
