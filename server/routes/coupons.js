const express = require('express');
const router = express.Router();
const { dbGet, dbAll, dbRun } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');
const { validateId, validateSearch, validatePromoActivation, handleValidationErrors } = require('../middleware/validation');
const { validateCouponCreation, sanitizeInput } = require('../middleware/sanitization');
const { body, sanitizeBody } = require('express-validator');
const { logger, auditLog } = require('../config/logger');

// Получить все активные купоны
router.get('/active', 
  validateSearch,
  async (req, res) => {
    try {
      const { q, page = 1, limit = 20 } = req.query;
      const offset = (page - 1) * limit;
      
      let query = `
        SELECT * FROM coupons 
        WHERE status IN ('active', 'expiring')
      `;
      let params = [];
      
      if (q) {
        query += ` AND (name LIKE ? OR project LIKE ? OR description LIKE ?)`;
        const searchTerm = `%${q}%`;
        params = [searchTerm, searchTerm, searchTerm];
      }
      
      query += ` ORDER BY expiry_date ASC LIMIT ? OFFSET ?`;
      params.push(limit, offset);
      
      const rows = await dbAll(query, params);
      
      // Получаем общее количество для пагинации
      let countQuery = `SELECT COUNT(*) as total FROM coupons WHERE status IN ('active', 'expiring')`;
      let countParams = [];
      
      if (q) {
        countQuery += ` AND (name LIKE ? OR project LIKE ? OR description LIKE ?)`;
        const searchTerm = `%${q}%`;
        countParams = [searchTerm, searchTerm, searchTerm];
      }
      
      const countResult = await dbGet(countQuery, countParams);
      
      res.json({
        coupons: rows,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: countResult.total,
          pages: Math.ceil(countResult.total / limit)
        }
      });
    } catch (err) {
      logger.error('Get active coupons error:', {
        error: err.message,
        stack: err.stack,
        query: req.query,
        ip: req.ip
      });
      
      res.status(500).json({ 
        error: 'Internal server error',
        code: 'INTERNAL_ERROR'
      });
    }
  }
);

// Получить историю купонов
router.get('/history', 
  authenticateToken,
  validateSearch,
  async (req, res) => {
    try {
      const { q, page = 1, limit = 20 } = req.query;
      const offset = (page - 1) * limit;
      
      let query = `
        SELECT ch.*, c.name, c.project, c.bonus, c.status as coupon_status
        FROM coupon_history ch
        JOIN coupons c ON ch.coupon_id = c.id
        WHERE ch.user_id = ?
      `;
      let params = [req.user.id];
      
      if (q) {
        query += ` AND (c.name LIKE ? OR c.project LIKE ? OR ch.action LIKE ?)`;
        const searchTerm = `%${q}%`;
        params.push(searchTerm, searchTerm, searchTerm);
      }
      
      query += ` ORDER BY ch.created_at DESC LIMIT ? OFFSET ?`;
      params.push(limit, offset);
      
      const rows = await dbAll(query, params);
      
      // Получаем общее количество для пагинации
      let countQuery = `
        SELECT COUNT(*) as total 
        FROM coupon_history ch
        JOIN coupons c ON ch.coupon_id = c.id
        WHERE ch.user_id = ?
      `;
      let countParams = [req.user.id];
      
      if (q) {
        countQuery += ` AND (c.name LIKE ? OR c.project LIKE ? OR ch.action LIKE ?)`;
        const searchTerm = `%${q}%`;
        countParams.push(searchTerm, searchTerm, searchTerm);
      }
      
      const countResult = await dbGet(countQuery, countParams);
      
      res.json({
        history: rows,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: countResult.total,
          pages: Math.ceil(countResult.total / limit)
        }
      });
    } catch (err) {
      logger.error('Get coupon history error:', {
        error: err.message,
        stack: err.stack,
        userId: req.user.id,
        query: req.query,
        ip: req.ip
      });
      
      res.status(500).json({ 
        error: 'Internal server error',
        code: 'INTERNAL_ERROR'
      });
    }
  }
);

// Использовать купон
router.post('/use', 
  authenticateToken,
  [
    body('couponId')
      .isInt({ min: 1 })
      .withMessage('Coupon ID must be a positive integer'),
    body('couponId').toInt(),
    handleValidationErrors
  ],
  async (req, res) => {
    const { couponId } = req.body;
    const userId = req.user.id;
    
    try {
      // Проверяем, существует ли купон и доступен ли он
      const coupon = await dbGet(`
        SELECT * FROM coupons 
        WHERE id = ? AND status = 'active'
      `, [couponId]);
      
      if (!coupon) {
        return res.status(404).json({ 
          error: 'Coupon not found or not available',
          code: 'COUPON_NOT_FOUND'
        });
      }
      
      // Проверяем, не использовал ли пользователь уже этот купон
      const existingUsage = await dbGet(`
        SELECT * FROM coupon_history 
        WHERE coupon_id = ? AND user_id = ? AND action = 'used'
      `, [couponId, userId]);
      
      if (existingUsage) {
        return res.status(409).json({ 
          error: 'Coupon already used by this user',
          code: 'COUPON_ALREADY_USED'
        });
      }
      
      // Обновляем статус купона
      const updateResult = await dbRun(`
        UPDATE coupons SET status = 'used' WHERE id = ?
      `, [couponId]);
      
      if (updateResult.changes === 0) {
        return res.status(404).json({ 
          error: 'Coupon not found',
          code: 'COUPON_NOT_FOUND'
        });
      }
      
      // Записываем в историю использования
      const transactionId = 'TXN-' + Date.now() + '-' + Math.floor(Math.random() * 1000);
      
      await dbRun(`
        INSERT INTO coupon_history (coupon_id, user_id, action, transaction_id)
        VALUES (?, ?, 'used', ?)
      `, [couponId, userId, transactionId]);
      
      // Аудит использования купона
      auditLog.userAction(userId, 'coupon_used', {
        couponId,
        couponName: coupon.name,
        transactionId,
        ip: req.ip,
        userAgent: req.get('User-Agent')
      });
      
      res.json({
        message: 'Coupon used successfully',
        transactionId: transactionId,
        coupon: {
          id: coupon.id,
          name: coupon.name,
          bonus: coupon.bonus
        }
      });
    } catch (err) {
      logger.error('Use coupon error:', {
        error: err.message,
        stack: err.stack,
        couponId,
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

// Активировать промокод
router.post('/activate', 
  authenticateToken,
  validatePromoActivation,
  async (req, res) => {
    const { code } = req.body;
    const userId = req.user.id;
    
    try {
      // Проверяем, существует ли купон с таким кодом
      const coupon = await dbGet(`
        SELECT * FROM coupons 
        WHERE code = ? AND status = 'active'
      `, [code]);
      
      if (!coupon) {
        return res.status(404).json({ 
          error: 'Coupon not found or not available',
          code: 'COUPON_NOT_FOUND'
        });
      }
      
      // Проверяем, не активировал ли пользователь уже этот купон
      const existingActivation = await dbGet(`
        SELECT * FROM coupon_history 
        WHERE coupon_id = ? AND user_id = ? AND action = 'activated'
      `, [coupon.id, userId]);
      
      if (existingActivation) {
        return res.status(409).json({ 
          error: 'Coupon already activated by this user',
          code: 'COUPON_ALREADY_ACTIVATED'
        });
      }
      
      // Записываем в историю активации
      await dbRun(`
        INSERT INTO coupon_history (coupon_id, user_id, action)
        VALUES (?, ?, 'activated')
      `, [coupon.id, userId]);
      
      // Аудит активации купона
      auditLog.userAction(userId, 'coupon_activated', {
        couponId: coupon.id,
        couponName: coupon.name,
        couponCode: code,
        ip: req.ip,
        userAgent: req.get('User-Agent')
      });
      
      res.json({
        message: 'Coupon activated successfully',
        coupon: {
          id: coupon.id,
          name: coupon.name,
          project: coupon.project,
          bonus: coupon.bonus,
          conditions: coupon.conditions,
          expiry_date: coupon.expiry_date
        }
      });
    } catch (err) {
      logger.error('Activate coupon error:', {
        error: err.message,
        stack: err.stack,
        code,
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

module.exports = router;