/* eslint-disable @typescript-eslint/no-require-imports */
// Скрипт для создания первого администратора
const Database = require('better-sqlite3');
const path = require('path');
const bcrypt = require('bcryptjs');
const readline = require('readline');

// Интерфейс для ввода данных
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Подключение к базе данных
const db = new Database(path.resolve(process.cwd(), 'users.db'));

// Проверка и создание таблицы пользователей если она не существует
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

// Функция создания администратора
function createAdminUser(email, password, name) {
  const stmt = db.prepare('INSERT INTO users (email, password, name, is_admin) VALUES (?, ?, ?, 1)');
  return stmt.run(email, password, name);
}

console.log('\n=========================================');
console.log('📝 Создание аккаунта администратора');
console.log('=========================================\n');

// Получаем данные от пользователя
rl.question('👤 Введите имя администратора: ', (name) => {
  rl.question('📧 Введите email администратора: ', (email) => {
    rl.question('🔑 Введите пароль: ', async (password) => {
      try {
        // Хешируем пароль
        const hashedPassword = await bcrypt.hash(password, 10);
        
        // Проверяем, существует ли уже пользователь с таким email
        const existingUser = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
        
        if (existingUser) {
          console.log('\n⚠️  Пользователь с таким email уже существует!');
          
          // Обновляем права существующему пользователю
          rl.question('Сделать этого пользователя администратором? (y/n): ', (answer) => {
            if (answer.toLowerCase() === 'y') {
              db.prepare('UPDATE users SET is_admin = 1 WHERE email = ?').run(email);
              console.log('\n✅ Пользователь успешно стал администратором!');
            } else {
              console.log('\n❌ Операция отменена.');
            }
            rl.close();
          });
        } else {
          // Создаем нового администратора
          const result = createAdminUser(email, hashedPassword, name);
          
          if (result.changes > 0) {
            console.log('\n✅ Администратор успешно создан!');
            console.log(`📝 ID: ${result.lastInsertRowid}`);
            console.log(`👤 Имя: ${name}`);
            console.log(`📧 Email: ${email}`);
          } else {
            console.log('\n❌ Ошибка при создании администратора');
          }
          
          rl.close();
        }
      } catch (error) {
        console.error('\n❌ Произошла ошибка:', error.message);
        rl.close();
      }
    });
  });
});

rl.on('close', () => {
  db.close();
  console.log('\n👋 До свидания!');
  process.exit(0);
});