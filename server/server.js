const express = require('express');
const path = require('path');
const cors = require('cors');
const db = require('./config/database');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../')));

// API routes
app.use('/api/users', require('./routes/users'));
app.use('/api/coupons', require('./routes/coupons'));
app.use('/api/investments', require('./routes/investments'));
app.use('/api/wallet', require('./routes/wallet'));

// Serve frontend
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../index.html'));
});

app.get('/wallet', (req, res) => {
  res.sendFile(path.join(__dirname, '../wallet.html'));
});

app.get('/invest', (req, res) => {
  res.sendFile(path.join(__dirname, '../invest.html'));
});

// Инициализация базы данных с тестовыми данными
const initializeDatabase = () => {
  // Добавим тестовые купоны, если их еще нет
  db.get("SELECT COUNT(*) as count FROM coupons", [], (err, row) => {
    if (err) {
      console.error(err.message);
    } else if (row.count === 0) {
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

      const stmt = db.prepare(`INSERT INTO coupons 
        (name, project, project_color, bonus, expiry_date, days_left, conditions, code, description, status, min_amount, source)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);

      defaultCoupons.forEach(coupon => {
        stmt.run([
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
      });

      stmt.finalize();
      console.log('Default coupons added to database');
    }
  });

  // Проверим наличие тестового пользователя
  db.get("SELECT COUNT(*) as count FROM users", [], (err, row) => {
    if (err) {
      console.error(err.message);
    } else if (row.count === 0) {
      // В целях демонстрации добавим тестового пользователя
      // В реальном приложении никогда не храним пароли в открытом виде!
      db.run(`INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)`, 
        ['Константин', 'konstantin@example.com', 'demo_password_hash'], 
        function(err) {
          if (err) {
            console.error(err.message);
          } else {
            // Создаем кошелек для пользователя
            db.run(`INSERT INTO wallets (user_id, main_balance, partner_balance) VALUES (?, ?, ?)`,
              [this.lastID, 0.00, 0.00],
              (err) => {
                if (err) {
                  console.error(err.message);
                } else {
                  console.log('Demo user and wallet created');
                }
              });
          }
        });
    }
  });
};

// Инициализируем базу данных
initializeDatabase();

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});