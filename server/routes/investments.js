const express = require('express');
const router = express.Router();
const db = require('../config/database');

// Создать инвестицию
router.post('/create', (req, res) => {
  const { userId, projectId, amount, couponId } = req.body;
  
  // Получаем информацию о купоне, если он указан
  let getCouponSql = `SELECT * FROM coupons WHERE id = ? AND status = 'active'`;
  
  db.get(getCouponSql, [couponId], (err, coupon) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    
    // Рассчитываем финальную сумму с учетом купона
    let finalAmount = amount;
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
    
    // Сохраняем инвестицию
    const insertSql = `
      INSERT INTO investments 
      (user_id, project, amount, coupon_id, final_amount, transaction_id)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    
    const projectName = projectId === 'airships' ? 'Дирижабли' : 
                      projectId === 'sovelmash' ? 'Совэлмаш' : 'Общий';
    
    db.run(insertSql, [userId || 1, projectName, amount, couponId || null, finalAmount, transactionId], function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      
      // Если использовали купон, обновляем его статус
      if (coupon) {
        const updateCouponSql = `UPDATE coupons SET status = 'used' WHERE id = ?`;
        db.run(updateCouponSql, [couponId]);
        
        // Записываем в историю использования купона
        const historySql = `
          INSERT INTO coupon_history (coupon_id, user_id, action, transaction_id)
          VALUES (?, ?, 'used', ?)
        `;
        db.run(historySql, [couponId, userId || 1, transactionId]);
      }
      
      res.json({
        message: 'Investment created successfully',
        investment: {
          id: this.lastID,
          userId: userId || 1,
          project: projectName,
          amount: amount,
          couponId: couponId || null,
          finalAmount: finalAmount,
          transactionId: transactionId
        }
      });
    });
  });
});

// Получить список инвестиций пользователя
router.get('/:userId', (req, res) => {
  const userId = req.params.userId;
  
  const sql = `
    SELECT i.*, c.name as coupon_name, c.bonus as coupon_bonus
    FROM investments i
    LEFT JOIN coupons c ON i.coupon_id = c.id
    WHERE i.user_id = ?
    ORDER BY i.created_at DESC
  `;
  
  db.all(sql, [userId], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

module.exports = router;