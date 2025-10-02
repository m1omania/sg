const express = require('express');
const router = express.Router();
const db = require('../config/database');

// Создать инвестицию
router.post('/create', (req, res) => {
  const { userId, projectId, amount, couponId } = req.body;
  
  try {
    // Получаем информацию о купоне, если он указан
    let coupon = null;
    if (couponId) {
      const couponStmt = db.prepare(`SELECT * FROM coupons WHERE id = ? AND status = 'active'`);
      coupon = couponStmt.get(couponId);
    }
    
    // Рассчитываем финальную сумму с учетом купона
    let finalAmount = parseFloat(amount);
    if (coupon) {
      if (coupon.bonus.includes('%')) {
        // Процентная скидка
        const percent = parseInt(coupon.bonus);
        finalAmount = amount - (amount * percent / 100);
      } else if (coupon.bonus.includes('$')) {
        // Фиксированная скидка в долларах
        const discount = parseFloat(coupon.bonus.replace('$', ''));
        finalAmount = amount - discount;
      }
    }
    
    // Генерируем уникальный ID транзакции
    const transactionId = 'INV-' + Date.now() + '-' + Math.floor(Math.random() * 1000);
    
    // Проверяем баланс кошелька пользователя
    const walletStmt = db.prepare(`SELECT main_balance FROM wallets WHERE user_id = ?`);
    const wallet = walletStmt.get(userId || 1);
    if (!wallet) {
      return res.status(404).json({ error: 'Wallet not found' });
    }

    if (wallet.main_balance < finalAmount) {
      return res.status(400).json({ error: 'Недостаточно средств на счёте' });
    }

    // Сохраняем инвестицию
    const projectName = projectId === 'airships' ? 'Дирижабли' : 
                      projectId === 'sovelmash' ? 'Совэлмаш' : 'Общий';
    
    const insertStmt = db.prepare(`
      INSERT INTO investments 
      (user_id, project, amount, coupon_id, final_amount, transaction_id)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    
    const insertResult = insertStmt.run(
      userId || 1, 
      projectName, 
      parseFloat(amount), 
      couponId || null, 
      finalAmount, 
      transactionId
    );
    
    // Списываем средства с кошелька
    const deductStmt = db.prepare(`
      UPDATE wallets 
      SET main_balance = main_balance - ?, updated_at = CURRENT_TIMESTAMP
      WHERE user_id = ?
    `);
    deductStmt.run(finalAmount, userId || 1);

    // Записываем транзакцию на инвестицию
    const txStmt = db.prepare(`
      INSERT INTO transactions 
      (user_id, type, amount, currency, status, payment_method, transaction_id, description)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    txStmt.run(
      userId || 1,
      'investment',
      -finalAmount,
      'USD',
      'completed',
      null,
      transactionId,
      `Инвестиция в проект "${projectName}"`
    );

    // Если использовали купон, обновляем его статус
    if (coupon) {
      const updateCouponStmt = db.prepare(`UPDATE coupons SET status = 'used' WHERE id = ?`);
      updateCouponStmt.run(couponId);
      
      // Записываем в историю использования купона
      const historyStmt = db.prepare(`
        INSERT INTO coupon_history (coupon_id, user_id, action, transaction_id)
        VALUES (?, ?, 'used', ?)
      `);
      historyStmt.run(couponId, userId || 1, transactionId);
    }
    
    res.json({
      message: 'Investment created successfully',
      investment: {
        id: insertResult.lastInsertRowid,
        userId: userId || 1,
        project: projectName,
        amount: amount,
        couponId: couponId || null,
        finalAmount: finalAmount,
        transactionId: transactionId
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Получить список инвестиций пользователя
router.get('/:userId', (req, res) => {
  const userId = req.params.userId;
  
  try {
    const stmt = db.prepare(`
      SELECT i.*, c.name as coupon_name, c.bonus as coupon_bonus
      FROM investments i
      LEFT JOIN coupons c ON i.coupon_id = c.id
      WHERE i.user_id = ?
      ORDER BY i.created_at DESC
    `);
    
    const rows = stmt.all(userId);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;