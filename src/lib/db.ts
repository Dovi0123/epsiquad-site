import Database from 'better-sqlite3';
import path from 'path';
import { cookies } from 'next/headers';
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
    cart TEXT DEFAULT '[]',
    is_admin BOOLEAN DEFAULT 0
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
  
  // Создаем таблицу обращений в поддержку
  db.prepare(`CREATE TABLE IF NOT EXISTS support_tickets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    subject TEXT NOT NULL,
    message TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'new',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id)
  )`).run();
  
  // Создаем таблицу ответов на обращения в поддержку
  db.prepare(`CREATE TABLE IF NOT EXISTS support_responses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ticket_id INTEGER NOT NULL,
    responder_id INTEGER NOT NULL,
    message TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (ticket_id) REFERENCES support_tickets (id),
    FOREIGN KEY (responder_id) REFERENCES users (id)
  )`).run();
  
  // Создаем таблицу сообщений обратной связи от неавторизованных пользователей
  db.prepare(`CREATE TABLE IF NOT EXISTS feedback_messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    subject TEXT NOT NULL,
    message TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'new',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`).run();
  
  // Создаем таблицу ответов на сообщения обратной связи
  db.prepare(`CREATE TABLE IF NOT EXISTS feedback_responses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    feedback_id INTEGER NOT NULL,
    responder_id INTEGER NOT NULL,
    message TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (feedback_id) REFERENCES feedback_messages (id),
    FOREIGN KEY (responder_id) REFERENCES users (id)
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
  const user = getUserById(userId) as User | null;
  if (!user) return [];
  try {
    return JSON.parse(user.cart || '[]');
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (e) {
    return [];
  }
}

export function updateUserCart(userId: number, cart: unknown[]) {
  return updateUser(userId, { cart: JSON.stringify(cart) });
}

// Функции для работы с заказами
export function createOrder(userId: number, orderData: unknown) {
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

// Функции для работы с администраторами
export function isAdmin(userId: number) {
  const user = getUserById(userId) as User | null;
  return user ? Boolean(user.is_admin) : false;
}

export function createAdminUser(email: string, password: string, name: string) {
  const stmt = db.prepare('INSERT INTO users (email, password, name, is_admin) VALUES (?, ?, ?, 1)');
  return stmt.run(email, password, name);
}

export function makeUserAdmin(userId: number) {
  return updateUser(userId, { is_admin: 1 });
}

export function removeAdminRights(userId: number) {
  return updateUser(userId, { is_admin: 0 });
}

// Функции для администраторов для работы с заказами и пользователями
export function getAllUsers() {
  const stmt = db.prepare('SELECT id, email, name, notifications, language, theme, is_admin FROM users');
  return stmt.all();
}

export function getAllOrders() {
  const stmt = db.prepare(`
    SELECT o.id, o.user_id, u.email as user_email, u.name as user_name, 
           o.order_data, o.status, o.created_at
    FROM orders o
    JOIN users u ON o.user_id = u.id
    ORDER BY o.created_at DESC
  `);
  return stmt.all();
}

export function updateOrderStatus(orderId: number, status: string) {
  const stmt = db.prepare('UPDATE orders SET status = ? WHERE id = ?');
  return stmt.run(status, orderId);
}

export function deleteUser(userId: number) {
  const stmt = db.prepare('DELETE FROM users WHERE id = ?');
  return stmt.run(userId);
}

// Функции для работы с обращениями в поддержку
export function createSupportTicket(userId: number, subject: string, message: string) {
  const stmt = db.prepare('INSERT INTO support_tickets (user_id, subject, message) VALUES (?, ?, ?)');
  return stmt.run(userId, subject, message);
}

export function getUserSupportTickets(userId: number) {
  const stmt = db.prepare(`
    SELECT t.id, t.subject, t.message, t.status, t.created_at, t.updated_at,
           (SELECT COUNT(*) FROM support_responses WHERE ticket_id = t.id) as response_count
    FROM support_tickets t
    WHERE t.user_id = ?
    ORDER BY t.updated_at DESC
  `);
  return stmt.all(userId);
}

export function getAllSupportTickets() {
  const stmt = db.prepare(`
    SELECT t.id, t.user_id, u.name as user_name, u.email as user_email,
           t.subject, t.message, t.status, t.created_at, t.updated_at,
           (SELECT COUNT(*) FROM support_responses WHERE ticket_id = t.id) as response_count
    FROM support_tickets t
    JOIN users u ON t.user_id = u.id
    ORDER BY 
      CASE 
        WHEN t.status = 'new' THEN 1
        WHEN t.status = 'in_progress' THEN 2
        WHEN t.status = 'waiting_user' THEN 3
        WHEN t.status = 'resolved' THEN 4
        ELSE 5
      END,
      t.updated_at DESC
  `);
  return stmt.all();
}

export function getSupportTicketById(ticketId: number) {
  const stmt = db.prepare(`
    SELECT t.id, t.user_id, u.name as user_name, u.email as user_email,
           t.subject, t.message, t.status, t.created_at, t.updated_at
    FROM support_tickets t
    JOIN users u ON t.user_id = u.id
    WHERE t.id = ?
  `);
  return stmt.get(ticketId);
}

export function getSupportTicketResponses(ticketId: number) {
  const stmt = db.prepare(`
    SELECT r.id, r.ticket_id, r.responder_id, 
           u.name as responder_name, u.is_admin as is_staff,
           r.message, r.created_at
    FROM support_responses r
    JOIN users u ON r.responder_id = u.id
    WHERE r.ticket_id = ?
    ORDER BY r.created_at ASC
  `);
  return stmt.all(ticketId);
}

export function addSupportTicketResponse(ticketId: number, responderId: number, message: string) {
  // Добавляем ответ
  const responseStmt = db.prepare('INSERT INTO support_responses (ticket_id, responder_id, message) VALUES (?, ?, ?)');
  const responseResult = responseStmt.run(ticketId, responderId, message);
  
  // Получаем информацию о пользователе
  const user = getUserById(responderId) as User | null;
  
  // Если отвечает администратор, меняем статус тикета на "ожидает ответа пользователя"
  // Если отвечает пользователь, меняем статус на "в обработке"
  const newStatus = user && user.is_admin ? 'waiting_user' : 'in_progress';
  
  // Обновляем статус и дату обновления тикета
  const updateStmt = db.prepare('UPDATE support_tickets SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?');
  updateStmt.run(newStatus, ticketId);
  
  return responseResult;
}

export function updateSupportTicketStatus(ticketId: number, status: string) {
  const validStatuses = ['new', 'in_progress', 'waiting_user', 'resolved', 'closed'];
  if (!validStatuses.includes(status)) {
    throw new Error('Недопустимый статус обращения');
  }
  
  const stmt = db.prepare('UPDATE support_tickets SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?');
  return stmt.run(status, ticketId);
}

// Функции для работы с сообщениями обратной связи от неавторизованных пользователей
export function createFeedbackMessage(name: string, email: string, subject: string, message: string) {
  const stmt = db.prepare('INSERT INTO feedback_messages (name, email, subject, message) VALUES (?, ?, ?, ?)');
  return stmt.run(name, email, subject, message);
}

export function getAllFeedbackMessages() {
  const stmt = db.prepare(`
    SELECT id, name, email, subject, message, status, created_at, updated_at,
           (SELECT COUNT(*) FROM feedback_responses WHERE feedback_id = feedback_messages.id) as response_count
    FROM feedback_messages
    ORDER BY 
      CASE 
        WHEN status = 'new' THEN 1
        WHEN status = 'in_progress' THEN 2
        WHEN status = 'resolved' THEN 3
        ELSE 4
      END,
      updated_at DESC
  `);
  return stmt.all();
}

export function getFeedbackMessageById(feedbackId: number) {
  const stmt = db.prepare('SELECT * FROM feedback_messages WHERE id = ?');
  return stmt.get(feedbackId);
}

export function getFeedbackResponses(feedbackId: number) {
  const stmt = db.prepare(`
    SELECT r.id, r.feedback_id, r.responder_id, 
           u.name as responder_name, u.is_admin as is_staff,
           r.message, r.created_at
    FROM feedback_responses r
    JOIN users u ON r.responder_id = u.id
    WHERE r.feedback_id = ?
    ORDER BY r.created_at ASC
  `);
  return stmt.all(feedbackId);
}

export function addFeedbackResponse(feedbackId: number, responderId: number, message: string) {
  // Добавляем ответ
  const responseStmt = db.prepare('INSERT INTO feedback_responses (feedback_id, responder_id, message) VALUES (?, ?, ?)');
  const responseResult = responseStmt.run(feedbackId, responderId, message);
  
  // Обновляем статус и дату обновления обращения
  const updateStmt = db.prepare('UPDATE feedback_messages SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?');
  updateStmt.run('in_progress', feedbackId);
  
  return responseResult;
}

export function updateFeedbackStatus(feedbackId: number, status: string) {
  const validStatuses = ['new', 'in_progress', 'resolved', 'closed'];
  if (!validStatuses.includes(status)) {
    throw new Error('Недопустимый статус обращения');
  }
  
  const stmt = db.prepare('UPDATE feedback_messages SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?');
  return stmt.run(status, feedbackId);
}
