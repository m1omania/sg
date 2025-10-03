const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const QueryOptimizer = require('./query-optimizer');

// Создаем базу данных SQLite
const db = new sqlite3.Database(path.join('/tmp', 'database.sqlite'));

// Инициализируем оптимизатор запросов
const queryOptimizer = new QueryOptimizer();

// Промис-обертка для sqlite3
const dbRun = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function(err) {
      if (err) reject(err);
      else resolve({ lastInsertRowid: this.lastInsertRowid, changes: this.changes });
    });
  });
};

const dbGet = (sql, params = []) => {
  return new Promise(async (resolve, reject) => {
    const startTime = Date.now();
    
    try {
      // Проверяем кэш для SELECT запросов
      if (queryOptimizer.isCacheableQuery(sql)) {
        const cached = queryOptimizer.getCachedQuery(sql, params);
        if (cached) {
          const duration = Date.now() - startTime;
          queryOptimizer.logQueryStats(sql, params, duration, true);
          return resolve(cached);
        }
      }

      db.get(sql, params, (err, row) => {
        const duration = Date.now() - startTime;
        
        if (err) {
          reject(err);
        } else {
          // Кэшируем результат для SELECT запросов
          if (queryOptimizer.isCacheableQuery(sql)) {
            queryOptimizer.cacheQuery(sql, params, row);
          }
          
          queryOptimizer.logQueryStats(sql, params, duration, false);
          resolve(row);
        }
      });
    } catch (error) {
      reject(error);
    }
  });
};

const dbAll = (sql, params = []) => {
  return new Promise(async (resolve, reject) => {
    const startTime = Date.now();
    
    try {
      // Проверяем кэш для SELECT запросов
      if (queryOptimizer.isCacheableQuery(sql)) {
        const cached = queryOptimizer.getCachedQuery(sql, params);
        if (cached) {
          const duration = Date.now() - startTime;
          queryOptimizer.logQueryStats(sql, params, duration, true);
          return resolve(cached);
        }
      }

      db.all(sql, params, (err, rows) => {
        const duration = Date.now() - startTime;
        
        if (err) {
          reject(err);
        } else {
          // Кэшируем результат для SELECT запросов
          if (queryOptimizer.isCacheableQuery(sql)) {
            queryOptimizer.cacheQuery(sql, params, rows);
          }
          
          queryOptimizer.logQueryStats(sql, params, duration, false);
          resolve(rows);
        }
      });
    } catch (error) {
      reject(error);
    }
  });
};

const dbExec = (sql) => {
  return new Promise((resolve, reject) => {
    db.exec(sql, (err) => {
      if (err) reject(err);
      else resolve();
    });
  });
};

// Создаем таблицы при первом запуске
const initializeTables = async () => {
  try {
    // Таблица пользователей
    await dbExec(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        email TEXT UNIQUE NOT NULL,
        phone TEXT,
        password_hash TEXT NOT NULL,
        email_verified BOOLEAN DEFAULT FALSE,
        phone_verified BOOLEAN DEFAULT FALSE,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Таблица купонов
    await dbExec(`
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
    await dbExec(`
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
    await dbExec(`
      CREATE TABLE IF NOT EXISTS investments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        project_id INTEGER,
        project_name TEXT NOT NULL,
        amount REAL NOT NULL,
        coupon_id INTEGER,
        final_amount REAL NOT NULL,
        transaction_id TEXT UNIQUE,
        status TEXT DEFAULT 'active', -- active, completed, cancelled
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id),
        FOREIGN KEY (coupon_id) REFERENCES coupons (id)
      )
    `);

    // Таблица кошельков
    await dbExec(`
      CREATE TABLE IF NOT EXISTS wallets (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER UNIQUE,
        main_balance REAL DEFAULT 0.0,
        bonus_balance REAL DEFAULT 0.0,
        partner_balance REAL DEFAULT 0.0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id)
      )
    `);

    // Таблица транзакций
    await dbExec(`
      CREATE TABLE IF NOT EXISTS transactions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        type TEXT NOT NULL, -- deposit, withdrawal, investment, coupon
        amount REAL NOT NULL,
        currency TEXT DEFAULT 'USD',
        status TEXT DEFAULT 'completed', -- pending, completed, failed, cancelled
        payment_method TEXT, -- card, crypto, etc.
        transaction_id TEXT UNIQUE,
        description TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id)
      )
    `);

    // Таблица проектов
    await dbExec(`
      CREATE TABLE IF NOT EXISTS projects (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT,
        image_url TEXT,
        min_investment REAL DEFAULT 0,
        interest_rate REAL NOT NULL, -- процентная ставка
        duration INTEGER, -- срок в месяцах
        status TEXT DEFAULT 'active', -- active, completed, upcoming
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Таблица уведомлений
    await dbExec(`
      CREATE TABLE IF NOT EXISTS notifications (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        title TEXT NOT NULL,
        message TEXT NOT NULL,
        type TEXT DEFAULT 'info', -- info, success, warning, error
        is_read BOOLEAN DEFAULT FALSE,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id)
      )
    `);

    console.log('Database tables created successfully');
  } catch (err) {
    console.error('Error creating tables:', err.message);
  }
};

// Инициализация базы данных с тестовыми данными
const initializeDatabase = async () => {
  try {
    await initializeTables();
    
    // Проверим, есть ли уже купоны
    const couponCount = await dbGet("SELECT COUNT(*) as count FROM coupons");
    
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

      for (const coupon of defaultCoupons) {
        await dbRun(`
          INSERT INTO coupons 
          (name, project, project_color, bonus, expiry_date, days_left, conditions, code, description, status, min_amount, source)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
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
        ]);
      }
      console.log('Default coupons added to database');
    }

    // Проверим наличие тестовых проектов
    const projectCount = await dbGet("SELECT COUNT(*) as count FROM projects");
    
    if (projectCount.count === 0) {
      const defaultProjects = [
        {
          name: "Дирижабли",
          description: "Инвестируйте в инновационные проекты воздушных дирижаблей. Современные технологии и экологичный транспорт будущего.",
          image_url: "/images/airships.jpg",
          min_investment: 500,
          interest_rate: 12,
          duration: 36,
          status: "active"
        },
        {
          name: "Совэлмаш",
          description: "Инвестируйте в развитие современного машиностроительного завода. Перспективный проект с высокой отдачей.",
          image_url: "/images/sovelmash.jpg",
          min_investment: 1000,
          interest_rate: 15,
          duration: 60,
          status: "active"
        },
        {
          name: "Солнечные панели",
          description: "Инвестируйте в развитие солнечной энергетики. Проект по установке солнечных панелей в жилых комплексах.",
          image_url: "/images/solar.jpg",
          min_investment: 250,
          interest_rate: 10,
          duration: 24,
          status: "active"
        }
      ];

      for (const project of defaultProjects) {
        await dbRun(`
          INSERT INTO projects 
          (name, description, image_url, min_investment, interest_rate, duration, status)
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `, [
          project.name,
          project.description,
          project.image_url,
          project.min_investment,
          project.interest_rate,
          project.duration,
          project.status
        ]);
      }
      console.log('Default projects added to database');
    }

    // Проверим наличие тестового пользователя
    const userCount = await dbGet("SELECT COUNT(*) as count FROM users");
    
    if (userCount.count === 0) {
      // В целях демонстрации добавим тестового пользователя
      const userInfo = await dbRun(`
        INSERT INTO users (username, email, phone, password_hash, email_verified, phone_verified) 
        VALUES (?, ?, ?, ?, ?, ?)
      `, [
        'Константин', 
        'konstantin@example.com', 
        '+79991234567',
        'demo_password_hash',
        1,
        1
      ]);
      
      // Создаем кошелек для пользователя
      await dbRun(`
        INSERT INTO wallets (user_id, main_balance, bonus_balance) 
        VALUES (?, ?, ?)
      `, [userInfo.lastInsertRowid, 1000.00, 25.00]);
      console.log('Demo user and wallet created');
      
      // Добавляем приветственный купон пользователю
      await dbRun(`
        INSERT INTO coupon_history (coupon_id, user_id, action)
        VALUES (?, ?, 'created')
      `, [1, userInfo.lastInsertRowid]); // Купон с ID 1 - приветственный
      console.log('Welcome coupon added to user');
    }
  } catch (err) {
    console.error('Error initializing database:', err.message);
  }
};

// Импортируем MigrationManager
const MigrationManager = require('./migrations');

// Выполняем инициализацию
const initializeWithMigrations = async () => {
  try {
    // Сначала инициализируем базовые таблицы
    await initializeDatabase();
    
    // Затем запускаем миграции, передавая функции базы данных
    const migrationManager = new MigrationManager(dbExec, dbGet, dbAll, dbRun);
    await migrationManager.runMigrations();
    
    console.log('Database initialization and migrations completed');
  } catch (err) {
    console.error('Database initialization failed:', err);
    throw err;
  }
};

// Выполняем инициализацию с миграциями
initializeWithMigrations();

module.exports = {
  db,
  dbRun,
  dbGet,
  dbAll,
  dbExec,
  queryOptimizer
};