const express = require('express');
const router = express.Router();
const db = require('../config/database');

// Получить информацию о кошельке пользователя
router.get('/:userId', (req, res) => {
  const userId = req.params.userId;
  
  const sql = `
    SELECT * FROM wallets 
    WHERE user_id = ?
  `;
  
  db.get(sql, [userId], (err, row) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    
    if (!row) {
      res.status(404).json({ error: 'Wallet not found' });
      return;
    }
    
    res.json(row);
  });
});

// Получить активные купоны пользователя (для виджета кошелька)
router.get('/:userId/coupons', (req, res) => {
  const userId = req.params.userId;
  
  const sql = `
    SELECT c.* 
    FROM coupons c
    LEFT JOIN coupon_history ch ON c.id = ch.coupon_id
    WHERE ch.user_id = ? AND c.status IN ('active', 'expiring')
    ORDER BY c.expiry_date ASC
    LIMIT 3
  `;
  
  db.all(sql, [userId], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// Пополнить баланс кошелька
router.post('/:userId/deposit', (req, res) => {
  const userId = req.params.userId;
  const { amount, type } = req.body; // type: 'main' или 'partner'
  
  // Валидация суммы
  const depositAmount = parseFloat(amount);
  if (isNaN(depositAmount) || depositAmount <= 0) {
    res.status(400).json({ error: 'Invalid amount' });
    return;
  }
  
  // Определяем поле для обновления
  const field = type === 'partner' ? 'partner_balance' : 'main_balance';
  
  // Обновляем баланс
  const sql = `
    UPDATE wallets 
    SET ${field} = ${field} + ?
    WHERE user_id = ?
  `;
  
  db.run(sql, [depositAmount, userId], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    
    // Получаем обновленную информацию о кошельке
    const selectSql = `SELECT * FROM wallets WHERE user_id = ?`;
    db.get(selectSql, [userId], (err, row) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      
      res.json({
        message: 'Deposit successful',
        wallet: row
      });
    });
  });
});

module.exports = router;