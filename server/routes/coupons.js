const express = require('express');
const router = express.Router();
const db = require('../config/database');

// Получить все активные купоны
router.get('/active', (req, res) => {
  try {
    const stmt = db.prepare(`
      SELECT * FROM coupons 
      WHERE status IN ('active', 'expiring')
      ORDER BY expiry_date ASC
    `);
    
    const rows = stmt.all();
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Получить историю купонов
router.get('/history', (req, res) => {
  try {
    const stmt = db.prepare(`
      SELECT ch.*, c.name, c.project, c.bonus, c.status as coupon_status
      FROM coupon_history ch
      JOIN coupons c ON ch.coupon_id = c.id
      ORDER BY ch.created_at DESC
    `);
    
    const rows = stmt.all();
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Использовать купон
router.post('/use', (req, res) => {
  const { couponId, userId } = req.body;
  
  // В реальном приложении здесь должна быть проверка пользователя
  
  try {
    // Обновляем статус купона
    const updateStmt = db.prepare(`UPDATE coupons SET status = 'used' WHERE id = ?`);
    const updateResult = updateStmt.run(couponId);
    
    if (updateResult.changes === 0) {
      res.status(404).json({ error: 'Coupon not found' });
      return;
    }
    
    // Записываем в историю использования
    const transactionId = 'TXN-' + Date.now() + '-' + Math.floor(Math.random() * 1000);
    
    const insertStmt = db.prepare(`
      INSERT INTO coupon_history (coupon_id, user_id, action, transaction_id)
      VALUES (?, ?, 'used', ?)
    `);
    
    insertStmt.run(couponId, userId || 1, transactionId);
    
    res.json({
      message: 'Coupon used successfully',
      transactionId: transactionId
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Активировать промокод
router.post('/activate', (req, res) => {
  const { code, userId } = req.body;
  
  try {
    // Проверяем, существует ли купон с таким кодом
    const selectStmt = db.prepare(`SELECT * FROM coupons WHERE code = ? AND status = 'active'`);
    const row = selectStmt.get(code);
    
    if (!row) {
      res.status(404).json({ error: 'Coupon not found or already used' });
      return;
    }
    
    // В реальном приложении здесь должна быть проверка пользователя
    
    // Записываем в историю активации
    const insertStmt = db.prepare(`
      INSERT INTO coupon_history (coupon_id, user_id, action)
      VALUES (?, ?, 'activated')
    `);
    
    insertStmt.run(row.id, userId || 1);
    
    res.json({
      message: 'Coupon activated successfully',
      coupon: row
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;