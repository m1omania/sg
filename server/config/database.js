const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Создаем базу данных SQLite
const db = new sqlite3.Database(path.join(__dirname, '../database.sqlite'), (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to the SQLite database.');
  }
});

// Создаем таблицы при первом запуске
db.serialize(() => {
  // Таблица пользователей
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Таблица купонов
  db.run(`
    CREATE TABLE IF NOT EXISTS coupons (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      project TEXT NOT NULL,
      project_color TEXT NOT NULL,
      bonus TEXT NOT NULL,
      expiry_date DATE NOT NULL,
      days_left INTEGER NOT NULL,
      conditions TEXT,
      code TEXT UNIQUE NOT NULL,
      description TEXT,
      status TEXT DEFAULT 'active',
      min_amount REAL DEFAULT 0,
      source TEXT DEFAULT 'manual',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Таблица истории использования купонов
  db.run(`
    CREATE TABLE IF NOT EXISTS coupon_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      coupon_id INTEGER,
      user_id INTEGER,
      action TEXT NOT NULL, -- 'used', 'expired', 'created'
      transaction_id TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (coupon_id) REFERENCES coupons (id),
      FOREIGN KEY (user_id) REFERENCES users (id)
    )
  `);

  // Таблица инвестиций
  db.run(`
    CREATE TABLE IF NOT EXISTS investments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      project TEXT NOT NULL,
      amount REAL NOT NULL,
      coupon_id INTEGER,
      final_amount REAL NOT NULL,
      transaction_id TEXT UNIQUE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id),
      FOREIGN KEY (coupon_id) REFERENCES coupons (id)
    )
  `);

  // Таблица кошельков
  db.run(`
    CREATE TABLE IF NOT EXISTS wallets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER UNIQUE,
      main_balance REAL DEFAULT 0.0,
      partner_balance REAL DEFAULT 0.0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id)
    )
  `);
});

module.exports = db;