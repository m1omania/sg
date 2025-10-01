const express = require('express');
const router = express.Router();
const db = require('../config/database');

// Получить информацию о пользователе
router.get('/:userId', (req, res) => {
  const userId = req.params.userId;
  
  const sql = `
    SELECT id, username, email, created_at 
    FROM users 
    WHERE id = ?
  `;
  
  db.get(sql, [userId], (err, row) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    
    if (!row) {
      res.status(404).json({ error: 'User not found' });
      return;
    }
    
    res.json(row);
  });
});

// Получить статистику пользователя
router.get('/:userId/stats', (req, res) => {
  const userId = req.params.userId;
  
  // Подсчитываем количество активных купонов
  const couponsSql = `
    SELECT COUNT(*) as active_coupons 
    FROM coupons c
    LEFT JOIN coupon_history ch ON c.id = ch.coupon_id
    WHERE ch.user_id = ? AND c.status IN ('active', 'expiring')
  `;
  
  // Подсчитываем количество инвестиций
  const investmentsSql = `
    SELECT COUNT(*) as total_investments, 
           COALESCE(SUM(final_amount), 0) as total_invested
    FROM investments 
    WHERE user_id = ?
  `;
  
  db.get(couponsSql, [userId], (err, couponsRow) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    
    db.get(investmentsSql, [userId], (err, investmentsRow) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      
      res.json({
        activeCoupons: couponsRow.active_coupons,
        totalInvestments: investmentsRow.total_investments,
        totalInvested: investmentsRow.total_invested
      });
    });
  });
});

module.exports = router;