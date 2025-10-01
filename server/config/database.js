const Database = require('better-sqlite3');
const path = require('path');

// Создаем базу данных SQLite
const db = new Database(path.join(__dirname, '../database.sqlite'));

// Создаем таблицы при первом запуске
try {
  // Таблица пользователей
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Таблица купонов
  db.exec(`
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
  db.exec(`
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
  db.exec(`
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
  db.exec(`
    CREATE TABLE IF NOT EXISTS wallets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER UNIQUE,
      main_balance REAL DEFAULT 0.0,
      partner_balance REAL DEFAULT 0.0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id)
    )
  `);
} catch (err) {
  console.error('Error creating tables:', err.message);
}

// Инициализация базы данных с тестовыми данными
const initializeDatabase = () => {
  try {
    // Проверим, есть ли уже купоны
    const couponCount = db.prepare("SELECT COUNT(*) as count FROM coupons").get();
    
    if (couponCount.count === 0) {
      const defaultCoupons = [
        {
          name: "25$ за регистрацию",
          project: "Общий",
          project_color: "#28a745",
          bonus: "$25",
          expiry_date: "2025-10-15",
          days_left: 14,
          conditions: "Минимальная сумма $250",
          code: "WELCOME25-ABC123",
          description: "Приветственный купон для новых пользователей",
          status: "active",
          min_amount: 250,
          source: "manual"
        },
        {
          name: "10% скидка Дирижабли",
          project: "Дирижабли",
          project_color: "#007bff",
          bonus: "10%",
          expiry_date: "2025-11-15",
          days_left: 45,
          conditions: "Только для проекта Дирижабли",
          code: "AIRSHIP10-XYZ789",
          description: "Специальная скидка на инвестиции в проект Дирижабли",
          status: "active",
          min_amount: 500,
          source: "email"
        },
        {
          name: "Купон инвестора месяца",
          project: "Совэлмаш",
          project_color: "#fd7e14",
          bonus: "+50 долей",
          expiry_date: "2025-10-05",
          days_left: 4,
          conditions: "от $1000",
          code: "MONTH50-DEF456",
          description: "Награда за активные инвестиции",
          status: "expiring",
          min_amount: 1000,
          source: "manual"
        }
      ];

      const insertCoupon = db.prepare(`
        INSERT INTO coupons 
        (name, project, project_color, bonus, expiry_date, days_left, conditions, code, description, status, min_amount, source)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      const insertMany = db.transaction((coupons) => {
        for (const coupon of coupons) {
          insertCoupon.run(
            coupon.name,
            coupon.project,
            coupon.project_color,
            coupon.bonus,
            coupon.expiry_date,
            coupon.days_left,
            coupon.conditions,
            coupon.code,
            coupon.description,
            coupon.status,
            coupon.min_amount,
            coupon.source
          );
        }
      });

      insertMany(defaultCoupons);
      console.log('Default coupons added to database');
    }

    // Проверим наличие тестового пользователя
    const userCount = db.prepare("SELECT COUNT(*) as count FROM users").get();
    
    if (userCount.count === 0) {
      // В целях демонстрации добавим тестового пользователя
      // В реальном приложении никогда не храним пароли в открытом виде!
      const insertUser = db.prepare(`
        INSERT INTO users (username, email, password_hash) 
        VALUES (?, ?, ?)
      `);
      
      const userInfo = insertUser.run(
        'Константин', 
        'konstantin@example.com', 
        'demo_password_hash'
      );
      
      // Создаем кошелек для пользователя
      const insertWallet = db.prepare(`
        INSERT INTO wallets (user_id, main_balance, partner_balance) 
        VALUES (?, ?, ?)
      `);
      
      insertWallet.run(userInfo.lastInsertRowid, 0.00, 0.00);
      console.log('Demo user and wallet created');
    }
  } catch (err) {
    console.error('Error initializing database:', err.message);
  }
};

// Выполняем инициализацию
initializeDatabase();

module.exports = db;