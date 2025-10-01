const express = require('express');
const router = express.Router();
const db = require('../config/database');

// Регистрация нового пользователя
router.post('/register', (req, res) => {
  const { username, email, phone, password } = req.body;
  
  // Валидация входных данных
  if (!username || !email || !password) {
    return res.status(400).json({ 
      error: 'Username, email and password are required' 
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
    
    // Создаем нового пользователя
    const insertUser = db.prepare(`
      INSERT INTO users (username, email, phone, password_hash, email_verified, phone_verified)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    
    // В реальном приложении здесь должен быть хэш пароля
    const passwordHash = password; // Для демо целей
    
    const result = insertUser.run(
      username,
      email,
      phone || null,
      passwordHash,
      0, // email_verified (0 = false)
      0  // phone_verified (0 = false)
    );
    
    // Создаем кошелек для нового пользователя
    const insertWallet = db.prepare(`
      INSERT INTO wallets (user_id, main_balance, bonus_balance)
      VALUES (?, ?, ?)
    `);
    
    insertWallet.run(result.lastInsertRowid, 0.00, 0.00);
    
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
    
    // В реальном приложении здесь должна быть отправка email/SMS для подтверждения
    
    res.status(201).json({
      message: 'User registered successfully',
      userId: result.lastInsertRowid,
      needsVerification: true
    });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Подтверждение email
router.post('/verify-email', (req, res) => {
  const { userId, code } = req.body;
  
  try {
    // В реальном приложении здесь должна быть проверка кода
    
    const updateUser = db.prepare(`
      UPDATE users 
      SET email_verified = 1, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);
    
    const result = updateUser.run(userId);
    
    if (result.changes === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({ message: 'Email verified successfully' });
  } catch (err) {
    console.error('Email verification error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Подтверждение телефона
router.post('/verify-phone', (req, res) => {
  const { userId, code } = req.body;
  
  try {
    // В реальном приложении здесь должна быть проверка кода
    
    const updateUser = db.prepare(`
      UPDATE users 
      SET phone_verified = 1, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);
    
    const result = updateUser.run(userId);
    
    if (result.changes === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({ message: 'Phone verified successfully' });
  } catch (err) {
    console.error('Phone verification error:', err);
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