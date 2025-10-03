const express = require('express');
const router = express.Router();
const { dbGet, dbRun } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');
const { validateDeposit, validateUserId } = require('../middleware/validation');
const { logger, auditLog } = require('../config/logger');

// Получить информацию о кошельке пользователя
router.get('/:userId', 
  authenticateToken,
  validateUserId,
  async (req, res) => {
    const userId = req.params.userId;
    
    // Проверяем, что пользователь запрашивает свой кошелек
    if (req.user.id !== parseInt(userId)) {
      auditLog.securityEvent('unauthorized_wallet_access', {
        requestedUserId: userId,
        actualUserId: req.user.id,
        ip: req.ip,
        userAgent: req.get('User-Agent')
      });
      
      return res.status(403).json({ 
        error: 'Access denied',
        code: 'ACCESS_DENIED'
      });
    }
    
    try {
      let row = await dbGet(`
        SELECT * FROM wallets 
        WHERE user_id = ?
      `, [userId]);
      
      // Автосоздание кошелька, если отсутствует
      if (!row) {
        await dbRun(`
          INSERT INTO wallets (user_id, main_balance, bonus_balance)
          VALUES (?, 0, 0)
        `, [userId]);
        row = await dbGet(`
          SELECT * FROM wallets 
          WHERE user_id = ?
        `, [userId]);
      }
      
      // Совместимость полей
      const response = {
        ...row,
        partner_balance: row.partner_balance !== undefined ? row.partner_balance : (row.bonus_balance || 0)
      };
      
      res.json(response);
    } catch (err) {
      logger.error('Wallet fetch error:', {
        error: err.message,
        stack: err.stack,
        userId,
        ip: req.ip
      });
      
      res.status(500).json({ 
        error: 'Internal server error',
        code: 'INTERNAL_ERROR'
      });
    }
  }
);

// Получить активные купоны пользователя (для виджета кошелька)
router.get('/:userId/coupons', 
  authenticateToken,
  validateUserId,
  async (req, res) => {
    const userId = req.params.userId;
    
    // Проверяем, что пользователь запрашивает свои купоны
    if (req.user.id !== parseInt(userId)) {
      auditLog.securityEvent('unauthorized_coupons_access', {
        requestedUserId: userId,
        actualUserId: req.user.id,
        ip: req.ip,
        userAgent: req.get('User-Agent')
      });
      
      return res.status(403).json({ 
        error: 'Access denied',
        code: 'ACCESS_DENIED'
      });
    }
    
    try {
      const rows = await dbAll(`
        SELECT c.* 
        FROM coupons c
        LEFT JOIN coupon_history ch ON c.id = ch.coupon_id
        WHERE ch.user_id = ? AND c.status IN ('active', 'expiring')
        ORDER BY c.expiry_date ASC
        LIMIT 3
      `, [userId]);
      res.json(rows);
    } catch (err) {
      logger.error('Coupons fetch error:', {
        error: err.message,
        stack: err.stack,
        userId,
        ip: req.ip
      });
      
      res.status(500).json({ 
        error: 'Internal server error',
        code: 'INTERNAL_ERROR'
      });
    }
  }
);

// Пополнить баланс кошелька
router.post('/:userId/deposit', 
  authenticateToken,
  validateUserId,
  validateDeposit,
  async (req, res) => {
    const userId = req.params.userId;
    const { amount, type } = req.body; // type: 'main' или 'partner'
    
    // Проверяем, что пользователь пополняет свой кошелек
    if (req.user.id !== parseInt(userId)) {
      auditLog.securityEvent('unauthorized_deposit_attempt', {
        requestedUserId: userId,
        actualUserId: req.user.id,
        amount,
        type,
        ip: req.ip,
        userAgent: req.get('User-Agent')
      });
      
      return res.status(403).json({ 
        error: 'Access denied',
        code: 'ACCESS_DENIED'
      });
    }
    
    try {
      // Определяем поле для обновления
      const field = type === 'partner' ? 'partner_balance' : 'main_balance';
      
      // Обновляем баланс
      const updateResult = await dbRun(`
        UPDATE wallets 
        SET ${field} = ${field} + ?
        WHERE user_id = ?
      `, [amount, userId]);
      
      if (updateResult.changes === 0) {
        res.status(404).json({ 
          error: 'Wallet not found',
          code: 'WALLET_NOT_FOUND'
        });
        return;
      }
      
      // Получаем обновленную информацию о кошельке
      const row = await dbGet(`SELECT * FROM wallets WHERE user_id = ?`, [userId]);
      
      // Аудит успешного пополнения
      auditLog.userAction(userId, 'wallet_deposit', {
        amount,
        type,
        newBalance: row[field],
        ip: req.ip,
        userAgent: req.get('User-Agent')
      });
      
      res.json({
        message: 'Deposit successful',
        wallet: row
      });
    } catch (err) {
      logger.error('Deposit error:', {
        error: err.message,
        stack: err.stack,
        userId,
        amount,
        type,
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