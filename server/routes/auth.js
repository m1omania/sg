const express = require('express');
const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Authentication
 *   description: User authentication and registration
 */
const bcrypt = require('bcryptjs');
const { dbGet, dbRun } = require('../config/database');
const config = require('../config/environment');
const { generateToken } = require('../middleware/auth');
const { validateRegistration, validateLogin } = require('../middleware/validation');
const { authLimiter, registrationLimiter } = require('../middleware/security');
const { logger, auditLog } = require('../config/logger');

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
        auditLog.securityEvent('registration_attempt_existing_email', {
          email,
          ip: req.ip,
          userAgent: req.get('User-Agent')
        });
        
        return res.status(409).json({ 
          error: 'User with this email already exists',
          code: 'USER_EXISTS'
        });
      }
      
      // В реальном приложении здесь должна быть отправка кода на email
      // Для демонстрации просто возвращаем успех
      
      auditLog.systemEvent('verification_code_sent', {
        email,
        ip: req.ip
      });
      
      res.json({
        message: 'Verification code sent successfully',
        email: email
      });
    } catch (err) {
      logger.error('Send verification error:', {
        error: err.message,
        stack: err.stack,
        email,
        ip: req.ip
      });
      
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
      
      // Аудит успешной регистрации
      auditLog.userAction(user.id, 'user_registered', {
        email: user.email,
        username: user.username,
        ip: req.ip,
        userAgent: req.get('User-Agent')
      });
      
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
      logger.error('Registration error:', {
        error: err.message,
        stack: err.stack,
        email,
        ip: req.ip
      });
      
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
        auditLog.securityEvent('login_attempt_invalid_email', {
          email,
          ip: req.ip,
          userAgent: req.get('User-Agent')
        });
        
        return res.status(401).json({ 
          error: 'Invalid email or password',
          code: 'INVALID_CREDENTIALS'
        });
      }
      
      // Проверяем пароль с помощью bcrypt
      const isValidPassword = await bcrypt.compare(password, user.password_hash);
      
      if (!isValidPassword) {
        auditLog.securityEvent('login_attempt_invalid_password', {
          email,
          userId: user.id,
          ip: req.ip,
          userAgent: req.get('User-Agent')
        });
        
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
      
      // Аудит успешного входа
      auditLog.userAction(user.id, 'user_logged_in', {
        email: user.email,
        ip: req.ip,
        userAgent: req.get('User-Agent')
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
      logger.error('Login error:', {
        error: err.message,
        stack: err.stack,
        email,
        ip: req.ip
      });
      
      res.status(500).json({ 
        error: 'Internal server error',
        code: 'INTERNAL_ERROR'
      });
    }
  }
);

module.exports = router;