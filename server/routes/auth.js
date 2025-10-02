const express = require('express');
const router = express.Router();
const db = require('../config/database');

// Шаг 1: Отправка кода подтверждения
router.post('/send-verification', (req, res) => {
  const { email } = req.body;
  
  // Валидация email
  if (!email) {
    return res.status(400).json({ 
      error: 'Email is required' 
    });
  }
  
  try {
    // Проверяем, существует ли пользователь с таким email
    const existingUser = db.prepare(`
      SELECT * FROM users WHERE email = ?
    `).get(email);
    
    if (existingUser) {
      return res.status(409).json({ 
        error: 'User with this email already exists' 
      });
    }
    
    // В реальном приложении здесь должна быть отправка кода на email
    // Для демонстрации просто возвращаем успех
    
    res.json({
      message: 'Verification code sent successfully',
      email: email
    });
  } catch (err) {
    console.error('Send verification error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Шаг 2: Подтверждение email и регистрация
router.post('/register', (req, res) => {
  const { email, code } = req.body;
  
  // Валидация входных данных
  if (!email || !code) {
    return res.status(400).json({ 
      error: 'Email and verification code are required' 
    });
  }
  
  // В реальном приложении здесь должна быть проверка кода
  // Для демонстрации принимаем любой код, но в реальном приложении
  // нужно проверять его в базе данных
  
  try {
    // Создаем нового пользователя
    const insertUser = db.prepare(`
      INSERT INTO users (username, email, phone, password_hash, email_verified, phone_verified)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    
    // Генерируем имя пользователя из email
    const username = email.split('@')[0] + '_' + Date.now();
    
    // В реальном приложении здесь должен быть хэш пароля
    const passwordHash = 'demo_password_hash'; // Для демо целей
    
    const result = insertUser.run(
      username,
      email,
      null, // phone
      passwordHash,
      1, // email_verified (1 = true)
      0  // phone_verified (0 = false)
    );
    
    // Создаем кошелек для нового пользователя
    const insertWallet = db.prepare(`
      INSERT INTO wallets (user_id, main_balance, bonus_balance)
      VALUES (?, ?, ?)
    `);
    
    insertWallet.run(result.lastInsertRowid, 0.00, 25.00); // 25$ бонус при регистрации
    
    // Создаем приветственный купон для нового пользователя
    const welcomeCoupon = db.prepare(`
      INSERT INTO coupon_history (coupon_id, user_id, action)
      VALUES (?, ?, ?)
    `);
    
    // Найдем приветственный купон
    const welcomeCouponData = db.prepare(`
      SELECT id FROM coupons WHERE code = ?
    `).get('WELCOME25-ABC123');
    
    if (welcomeCouponData) {
      welcomeCoupon.run(welcomeCouponData.id, result.lastInsertRowid, 'created');
    }
    
    res.status(201).json({
      message: 'User registered successfully',
      userId: result.lastInsertRowid,
      emailVerified: true
    });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Вход пользователя
router.post('/login', (req, res) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({ 
      error: 'Email and password are required' 
    });
  }
  
  try {
    // Находим пользователя
    const user = db.prepare(`
      SELECT id, username, email, phone, email_verified, phone_verified
      FROM users 
      WHERE email = ? AND password_hash = ?
    `).get(email, password); // В реальном приложении здесь должен быть хэш пароля
    
    if (!user) {
      return res.status(401).json({ 
        error: 'Invalid email or password' 
      });
    }
    
    res.json({
      message: 'Login successful',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        phone: user.phone,
        emailVerified: user.email_verified === 1,
        phoneVerified: user.phone_verified === 1
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;