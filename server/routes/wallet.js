const express = require('express');
const router = express.Router();
const db = require('../config/database');

// Получить информацию о кошельке пользователя
router.get('/:userId', (req, res) => {
  const userId = req.params.userId;
  
  try {
    const stmt = db.prepare(`
      SELECT * FROM wallets 
      WHERE user_id = ?
    `);
    
    let row = stmt.get(userId);
    
    // Автосоздание кошелька, если отсутствует
    if (!row) {
      const createStmt = db.prepare(`
        INSERT INTO wallets (user_id, main_balance, bonus_balance)
        VALUES (?, 0, 0)
      `);
      createStmt.run(userId);
      row = stmt.get(userId);
    }
    
    // Совместимость полей
    const response = {
      ...row,
      partner_balance: row.partner_balance !== undefined ? row.partner_balance : (row.bonus_balance || 0)
    };
    
    res.json(response);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Получить активные купоны пользователя (для виджета кошелька)
router.get('/:userId/coupons', (req, res) => {
  const userId = req.params.userId;
  
  try {
    const stmt = db.prepare(`
      SELECT c.* 
      FROM coupons c
      LEFT JOIN coupon_history ch ON c.id = ch.coupon_id
      WHERE ch.user_id = ? AND c.status IN ('active', 'expiring')
      ORDER BY c.expiry_date ASC
      LIMIT 3
    `);
    
    const rows = stmt.all(userId);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
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
  
  try {
    // Определяем поле для обновления
    const field = type === 'partner' ? 'partner_balance' : 'main_balance';
    
    // Обновляем баланс
    const updateStmt = db.prepare(`
      UPDATE wallets 
      SET ${field} = ${field} + ?
      WHERE user_id = ?
    `);
    
    const updateResult = updateStmt.run(depositAmount, userId);
    
    if (updateResult.changes === 0) {
      res.status(404).json({ error: 'Wallet not found' });
      return;
    }
    
    // Получаем обновленную информацию о кошельке
    const selectStmt = db.prepare(`SELECT * FROM wallets WHERE user_id = ?`);
    const row = selectStmt.get(userId);
    
    res.json({
      message: 'Deposit successful',
      wallet: row
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;