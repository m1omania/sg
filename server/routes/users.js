const express = require('express');
const router = express.Router();
const db = require('../config/database');

// Получить информацию о пользователе
router.get('/:userId', (req, res) => {
  const userId = req.params.userId;
  
  try {
    const stmt = db.prepare(`
      SELECT id, username, email, created_at 
      FROM users 
      WHERE id = ?
    `);
    
    const row = stmt.get(userId);
    
    if (!row) {
      res.status(404).json({ error: 'User not found' });
      return;
    }
    
    res.json(row);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Получить статистику пользователя
router.get('/:userId/stats', (req, res) => {
  const userId = req.params.userId;
  
  try {
    // Подсчитываем количество активных купонов
    const couponsStmt = db.prepare(`
      SELECT COUNT(*) as active_coupons 
      FROM coupons c
      LEFT JOIN coupon_history ch ON c.id = ch.coupon_id
      WHERE ch.user_id = ? AND c.status IN ('active', 'expiring')
    `);
    
    const couponsRow = couponsStmt.get(userId);
    
    // Подсчитываем количество инвестиций
    const investmentsStmt = db.prepare(`
      SELECT COUNT(*) as total_investments, 
             COALESCE(SUM(final_amount), 0) as total_invested
      FROM investments 
      WHERE user_id = ?
    `);
    
    const investmentsRow = investmentsStmt.get(userId);
    
    res.json({
      activeCoupons: couponsRow.active_coupons,
      totalInvestments: investmentsRow.total_investments,
      totalInvested: investmentsRow.total_invested
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;