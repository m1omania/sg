const request = require('supertest');
const express = require('express');
const bcrypt = require('bcrypt');
const server = require('../../server');
const { dbRun, dbGet, dbAll } = require('../../config/database');

describe('API Integration Tests', () => {
  let app;
  let testUser;
  let authToken;

  beforeAll(async () => {
    app = server;
  });

  beforeEach(async () => {
    // Clean up test data
    await dbRun('DELETE FROM users WHERE email LIKE "test%@example.com"');
    await dbRun('DELETE FROM wallets WHERE user_id NOT IN (SELECT id FROM users)');
    await dbRun('DELETE FROM coupons WHERE name LIKE "Test Coupon%"');
    await dbRun('DELETE FROM coupon_history WHERE user_id NOT IN (SELECT id FROM users)');
    await dbRun('DELETE FROM transactions WHERE user_id NOT IN (SELECT id FROM users)');

    // Create test user
    const hashedPassword = await bcrypt.hash('TestPassword123!', 12);
    const result = await dbRun(
      'INSERT INTO users (username, email, password, email_verified, phone_verified) VALUES (?, ?, ?, ?, ?)',
      ['testuser', 'test@example.com', hashedPassword, 1, 1]
    );
    
    testUser = {
      id: result.lastInsertRowid,
      username: 'testuser',
      email: 'test@example.com'
    };

    // Create wallet for test user
    await dbRun(
      'INSERT INTO wallets (user_id, main_balance, bonus_balance, partner_balance) VALUES (?, ?, ?, ?)',
      [testUser.id, 1000, 100, 50]
    );

    // Generate auth token
    const jwt = require('jsonwebtoken');
    authToken = jwt.sign(
      { id: testUser.id, username: testUser.username, email: testUser.email },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
  });

  describe('Complete User Journey', () => {
    it('should complete full user registration and investment flow', async () => {
      // Step 1: Register new user
      const userData = testUtils.generateTestUser({
        email: 'newuser@example.com',
        code: '123456'
      });

      const registerResponse = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      expect(registerResponse.body).toHaveProperty('token');
      expect(registerResponse.body).toHaveProperty('user');
      
      const newUserId = registerResponse.body.user.id;
      const newUserToken = registerResponse.body.token;

      // Step 2: Check wallet balance
      const walletResponse = await request(app)
        .get(`/api/wallet/${newUserId}`)
        .set('Authorization', `Bearer ${newUserToken}`)
        .expect(200);

      expect(walletResponse.body).toHaveProperty('main_balance', 0);
      expect(walletResponse.body).toHaveProperty('bonus_balance', 0);
      expect(walletResponse.body).toHaveProperty('partner_balance', 0);

      // Step 3: Make a deposit
      const depositData = {
        amount: 1000,
        currency: 'USD',
        method: 'card'
      };

      const depositResponse = await request(app)
        .post(`/api/wallet/${newUserId}/deposit`)
        .set('Authorization', `Bearer ${newUserToken}`)
        .send(depositData)
        .expect(200);

      expect(depositResponse.body).toHaveProperty('transaction_id');

      // Step 4: Check updated wallet balance
      const updatedWalletResponse = await request(app)
        .get(`/api/wallet/${newUserId}`)
        .set('Authorization', `Bearer ${newUserToken}`)
        .expect(200);

      expect(updatedWalletResponse.body.main_balance).toBe(1000);

      // Step 5: Create and activate coupon
      const couponResult = await dbRun(
        'INSERT INTO coupons (name, project, project_color, bonus, expiry_date, days_left, conditions, code, description, min_amount, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        ['Welcome Bonus', 'Solar Project', '#2563eb', '10%', new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), 30, 'Min investment $100', 'WELCOME10', 'Welcome bonus coupon', 100, 'active']
      );

      const couponId = couponResult.lastInsertRowid;

      // Step 6: Activate coupon
      const activateResponse = await request(app)
        .post('/api/coupons/activate')
        .set('Authorization', `Bearer ${newUserToken}`)
        .send({ code: 'WELCOME10' })
        .expect(200);

      expect(activateResponse.body).toHaveProperty('coupon');

      // Step 7: Use coupon for investment
      const useCouponResponse = await request(app)
        .post('/api/coupons/use')
        .set('Authorization', `Bearer ${newUserToken}`)
        .send({ couponId: couponId })
        .expect(200);

      expect(useCouponResponse.body).toHaveProperty('coupon');

      // Step 8: Check coupon history
      const historyResponse = await request(app)
        .get(`/api/coupons/history`)
        .set('Authorization', `Bearer ${newUserToken}`)
        .expect(200);

      expect(historyResponse.body.history.length).toBe(2); // activated and used
    });
  });

  describe('Error Handling Integration', () => {
    it('should handle authentication errors consistently', async () => {
      const invalidToken = 'invalid-token';

      // Test wallet endpoint with invalid token
      const walletResponse = await request(app)
        .get(`/api/wallet/${testUser.id}`)
        .set('Authorization', `Bearer ${invalidToken}`)
        .expect(403);

      expect(walletResponse.body).toHaveProperty('error');
      expect(walletResponse.body).toHaveProperty('code', 'INVALID_TOKEN');

      // Test coupon endpoint with invalid token
      const couponResponse = await request(app)
        .get('/api/coupons/history')
        .set('Authorization', `Bearer ${invalidToken}`)
        .expect(403);

      expect(couponResponse.body).toHaveProperty('error');
      expect(couponResponse.body).toHaveProperty('code', 'INVALID_TOKEN');
    });

    it('should handle validation errors consistently', async () => {
      // Test invalid email format
      const invalidEmailResponse = await request(app)
        .post('/api/auth/send-verification')
        .send({ email: 'invalid-email' })
        .expect(400);

      expect(invalidEmailResponse.body).toHaveProperty('error');
      expect(invalidEmailResponse.body).toHaveProperty('code', 'VALIDATION_ERROR');

      // Test invalid deposit amount
      const invalidDepositResponse = await request(app)
        .post(`/api/wallet/${testUser.id}/deposit`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ amount: -100, currency: 'USD', method: 'card' })
        .expect(400);

      expect(invalidDepositResponse.body).toHaveProperty('error');
    });
  });

  describe('Database Consistency', () => {
    it('should maintain data consistency across operations', async () => {
      // Create test coupon
      const couponResult = await dbRun(
        'INSERT INTO coupons (name, project, project_color, bonus, expiry_date, days_left, conditions, code, description, min_amount, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        ['Test Coupon', 'Test Project', '#2563eb', '10%', new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), 30, 'Min investment $100', 'TEST123', 'Test description', 100, 'active']
      );

      const couponId = couponResult.lastInsertRowid;

      // Use coupon
      await request(app)
        .post('/api/coupons/use')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ couponId: couponId })
        .expect(200);

      // Check that coupon status was updated
      const coupon = await dbGet('SELECT status FROM coupons WHERE id = ?', [couponId]);
      expect(coupon.status).toBe('used');

      // Check that history was created
      const history = await dbAll(
        'SELECT * FROM coupon_history WHERE user_id = ? AND coupon_id = ?',
        [testUser.id, couponId]
      );
      expect(history.length).toBe(1);
      expect(history[0].action).toBe('used');
    });

    it('should handle concurrent operations safely', async () => {
      // Create test coupon
      const couponResult = await dbRun(
        'INSERT INTO coupons (name, project, project_color, bonus, expiry_date, days_left, conditions, code, description, min_amount, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        ['Concurrent Test', 'Test Project', '#2563eb', '10%', new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), 30, 'Min investment $100', 'CONCURRENT', 'Test description', 100, 'active']
      );

      const couponId = couponResult.lastInsertRowid;

      // Try to use the same coupon twice concurrently
      const promises = [
        request(app)
          .post('/api/coupons/use')
          .set('Authorization', `Bearer ${authToken}`)
          .send({ couponId: couponId }),
        request(app)
          .post('/api/coupons/use')
          .set('Authorization', `Bearer ${authToken}`)
          .send({ couponId: couponId })
      ];

      const responses = await Promise.all(promises);
      
      // One should succeed, one should fail
      const successCount = responses.filter(r => r.status === 200).length;
      const errorCount = responses.filter(r => r.status === 400).length;
      
      expect(successCount).toBe(1);
      expect(errorCount).toBe(1);
    });
  });

  describe('Performance Integration', () => {
    it('should handle multiple requests efficiently', async () => {
      const startTime = Date.now();
      
      // Make multiple concurrent requests
      const promises = Array(10).fill().map(() =>
        request(app)
          .get(`/api/wallet/${testUser.id}`)
          .set('Authorization', `Bearer ${authToken}`)
      );

      const responses = await Promise.all(promises);
      const endTime = Date.now();
      const duration = endTime - startTime;

      // All requests should succeed
      responses.forEach(response => {
        expect(response.status).toBe(200);
      });

      // Should complete within reasonable time (5 seconds)
      expect(duration).toBeLessThan(5000);
    });

    it('should handle large result sets efficiently', async () => {
      // Create many test coupons
      const couponPromises = Array(50).fill().map((_, index) =>
        dbRun(
          'INSERT INTO coupons (name, project, project_color, bonus, expiry_date, days_left, conditions, code, description, min_amount, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
          [`Test Coupon ${index}`, `Project ${index}`, '#2563eb', '10%', new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), 30, 'Min investment $100', `TEST${index}`, 'Test description', 100, 'active']
        )
      );

      await Promise.all(couponPromises);

      const startTime = Date.now();
      
      const response = await request(app)
        .get('/api/coupons/active')
        .query({ page: 1, limit: 20 })
        .expect(200);

      const endTime = Date.now();
      const duration = endTime - startTime;

      expect(response.body.coupons.length).toBe(20);
      expect(duration).toBeLessThan(1000); // Should complete within 1 second
    });
  });

  describe('Security Integration', () => {
    it('should prevent unauthorized access to user data', async () => {
      // Create another test user
      const hashedPassword = await bcrypt.hash('TestPassword123!', 12);
      const otherUserResult = await dbRun(
        'INSERT INTO users (username, email, password, email_verified, phone_verified) VALUES (?, ?, ?, ?, ?)',
        ['otheruser', 'other@example.com', hashedPassword, 1, 1]
      );

      const otherUserId = otherUserResult.lastInsertRowid;

      // Try to access other user's wallet
      const response = await request(app)
        .get(`/api/wallet/${otherUserId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(403);

      expect(response.body).toHaveProperty('error');
    });

    it('should handle malformed requests gracefully', async () => {
      // Test with malformed JSON
      const response = await request(app)
        .post('/api/wallet/1/deposit')
        .set('Authorization', `Bearer ${authToken}`)
        .set('Content-Type', 'application/json')
        .send('{"amount": 100, "currency": "USD", "method": "card"') // Missing closing brace
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });
  });
});
