const express = require('express');
const router = express.Router();
const db = require('../config/database');

// Пополнение счета
router.post('/deposit', (req, res) => {
  const { userId, amount, paymentMethod } = req.body;
  
  // Валидация данных
  const depositAmount = parseFloat(amount);
  if (isNaN(depositAmount) || depositAmount <= 0) {
    return res.status(400).json({ error: 'Invalid amount' });
  }
  
  if (!paymentMethod || !['card', 'crypto'].includes(paymentMethod)) {
    return res.status(400).json({ error: 'Invalid payment method' });
  }
  
  try {
    // Убедимся, что кошелек существует
    const ensureWallet = db.prepare(`
      INSERT INTO wallets (user_id, main_balance, bonus_balance)
      SELECT ?, 0, 0
      WHERE NOT EXISTS (SELECT 1 FROM wallets WHERE user_id = ?)
    `);
    ensureWallet.run(userId, userId);

    // Генерируем уникальный ID транзакции
    const transactionId = 'DEP-' + Date.now() + '-' + Math.floor(Math.random() * 1000);
    
    // Обновляем баланс кошелька
    const updateWallet = db.prepare(`
      UPDATE wallets 
      SET main_balance = main_balance + ?, updated_at = CURRENT_TIMESTAMP
      WHERE user_id = ?
    `);
    
    const walletResult = updateWallet.run(depositAmount, userId);
    
    if (walletResult.changes === 0) {
      return res.status(404).json({ error: 'Wallet not found' });
    }
    
    // Записываем транзакцию
    const insertTransaction = db.prepare(`
      INSERT INTO transactions 
      (user_id, type, amount, currency, status, payment_method, transaction_id, description)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    insertTransaction.run(
      userId,
      'deposit',
      depositAmount,
      'USD',
      'completed',
      paymentMethod,
      transactionId,
      `Пополнение счета через ${paymentMethod === 'card' ? 'банковскую карту' : 'криптовалюту'}`
    );
    
    // Получаем обновленный баланс
    const wallet = db.prepare(`
      SELECT main_balance, bonus_balance FROM wallets WHERE user_id = ?
    `).get(userId);
    
    res.json({
      message: 'Deposit successful',
      transactionId,
      balance: wallet
    });
  } catch (err) {
    console.error('Deposit error:', err);
    res.status(500).json({ error: 'Internal server error', details: err.message });
  }
});

// Получить историю транзакций пользователя
router.get('/:userId', (req, res) => {
  const { userId } = req.params;
  
  try {
    const stmt = db.prepare(`
      SELECT * FROM transactions 
      WHERE user_id = ?
      ORDER BY created_at DESC
      LIMIT 20
    `);
    
    const transactions = stmt.all(userId);
    res.json(transactions);
  } catch (err) {
    console.error('Error fetching transactions:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;