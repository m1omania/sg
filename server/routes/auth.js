const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const { dbGet, dbRun } = require('../config/database');
const config = require('../config/environment');
const { generateToken } = require('../middleware/auth');
const { validateRegistration, validateLogin } = require('../middleware/validation');
const { authLimiter, registrationLimiter } = require('../middleware/security');

// Шаг 1: Отправка кода подтверждения
router.post('/send-verification', 
  registrationLimiter,
  async (req, res) => {
    const { email } = req.body;
    
    // Валидация email
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ 
        error: 'Valid email is required',
        code: 'INVALID_EMAIL'
      });
    }
    
    try {
      // Проверяем, существует ли пользователь с таким email
      const existingUser = await dbGet(`
        SELECT * FROM users WHERE email = ?
      `, [email]);
      
      if (existingUser) {
        return res.status(409).json({ 
          error: 'User with this email already exists',
          code: 'USER_EXISTS'
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
      res.status(500).json({ 
        error: 'Internal server error',
        code: 'INTERNAL_ERROR'
      });
    }
  }
);

// Шаг 2: Подтверждение email и регистрация
router.post('/register', 
  registrationLimiter,
  validateRegistration,
  async (req, res) => {
    const { email, code } = req.body;
    
    try {
      // В реальном приложении здесь должна быть проверка кода
      // Для демонстрации принимаем любой код, но в реальном приложении
      // нужно проверять его в базе данных
      
      // Генерируем случайный пароль для демо
      const tempPassword = Math.random().toString(36).slice(-8);
      const passwordHash = await bcrypt.hash(tempPassword, config.BCRYPT_ROUNDS);
      
      // Генерируем имя пользователя из email
      const username = email.split('@')[0] + '_' + Date.now();
      
      // Создаем нового пользователя
      const result = await dbRun(`
        INSERT INTO users (username, email, phone, password_hash, email_verified, phone_verified)
        VALUES (?, ?, ?, ?, ?, ?)
      `, [
        username,
        email,
        null, // phone
        passwordHash,
        1, // email_verified (1 = true)
        0  // phone_verified (0 = false)
      ]);
      
      // Создаем кошелек для нового пользователя
      await dbRun(`
        INSERT INTO wallets (user_id, main_balance, bonus_balance)
        VALUES (?, ?, ?)
      `, [result.lastInsertRowid, 0.00, 25.00]); // 25$ бонус при регистрации
      
      // Найдем приветственный купон
      const welcomeCouponData = await dbGet(`
        SELECT id FROM coupons WHERE code = ?
      `, ['WELCOME25-ABC123']);
      
      if (welcomeCouponData) {
        await dbRun(`
          INSERT INTO coupon_history (coupon_id, user_id, action)
          VALUES (?, ?, ?)
        `, [welcomeCouponData.id, result.lastInsertRowid, 'created']);
      }
      
      // Генерируем JWT токен
      const user = {
        id: result.lastInsertRowid,
        username,
        email
      };
      const token = generateToken(user);
      
      res.status(201).json({
        message: 'User registered successfully',
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          emailVerified: true
        },
        token,
        tempPassword // В реальном приложении не отправляем пароль!
      });
    } catch (err) {
      console.error('Registration error:', err);
      res.status(500).json({ 
        error: 'Internal server error',
        code: 'INTERNAL_ERROR'
      });
    }
  }
);

// Вход пользователя
router.post('/login', 
  authLimiter,
  validateLogin,
  async (req, res) => {
    const { email, password } = req.body;
    
    try {
      // Находим пользователя
      const user = await dbGet(`
        SELECT id, username, email, phone, password_hash, email_verified, phone_verified
        FROM users 
        WHERE email = ?
      `, [email]);
      
      if (!user) {
        return res.status(401).json({ 
          error: 'Invalid email or password',
          code: 'INVALID_CREDENTIALS'
        });
      }
      
      // Проверяем пароль с помощью bcrypt
      const isValidPassword = await bcrypt.compare(password, user.password_hash);
      
      if (!isValidPassword) {
        return res.status(401).json({ 
          error: 'Invalid email or password',
          code: 'INVALID_CREDENTIALS'
        });
      }
      
      // Генерируем JWT токен
      const token = generateToken({
        id: user.id,
        username: user.username,
        email: user.email
      });
      
      res.json({
        message: 'Login successful',
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          phone: user.phone,
          emailVerified: user.email_verified === 1,
          phoneVerified: user.phone_verified === 1
        },
        token
      });
    } catch (err) {
      console.error('Login error:', err);
      res.status(500).json({ 
        error: 'Internal server error',
        code: 'INTERNAL_ERROR'
      });
    }
  }
);

module.exports = router;