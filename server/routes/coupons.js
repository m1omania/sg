const express = require('express');
const router = express.Router();
const db = require('../config/database');

// Получить все активные купоны
router.get('/active', (req, res) => {
  const sql = `
    SELECT * FROM coupons 
    WHERE status IN ('active', 'expiring')
    ORDER BY expiry_date ASC
  `;
  
  db.all(sql, [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// Получить историю купонов
router.get('/history', (req, res) => {
  const sql = `
    SELECT ch.*, c.name, c.project, c.bonus, c.status as coupon_status
    FROM coupon_history ch
    JOIN coupons c ON ch.coupon_id = c.id
    ORDER BY ch.created_at DESC
  `;
  
  db.all(sql, [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// Использовать купон
router.post('/use', (req, res) => {
  const { couponId, userId } = req.body;
  
  // В реальном приложении здесь должна быть проверка пользователя
  
  // Обновляем статус купона
  const sql = `UPDATE coupons SET status = 'used' WHERE id = ?`;
  
  db.run(sql, [couponId], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    
    // Записываем в историю использования
    const historySql = `
      INSERT INTO coupon_history (coupon_id, user_id, action, transaction_id)
      VALUES (?, ?, 'used', ?)
    `;
    
    // Генерируем уникальный ID транзакции
    const transactionId = 'TXN-' + Date.now() + '-' + Math.floor(Math.random() * 1000);
    
    db.run(historySql, [couponId, userId || 1, transactionId], function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      
      res.json({
        message: 'Coupon used successfully',
        transactionId: transactionId
      });
    });
  });
});

// Активировать промокод
router.post('/activate', (req, res) => {
  const { code, userId } = req.body;
  
  // Проверяем, существует ли купон с таким кодом
  const selectSql = `SELECT * FROM coupons WHERE code = ? AND status = 'active'`;
  
  db.get(selectSql, [code], (err, row) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    
    if (!row) {
      res.status(404).json({ error: 'Coupon not found or already used' });
      return;
    }
    
    // В реальном приложении здесь должна быть проверка пользователя
    
    // Записываем в историю активации
    const historySql = `
      INSERT INTO coupon_history (coupon_id, user_id, action)
      VALUES (?, ?, 'activated')
    `;
    
    db.run(historySql, [row.id, userId || 1], function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      
      res.json({
        message: 'Coupon activated successfully',
        coupon: row
      });
    });
  });
});

module.exports = router;