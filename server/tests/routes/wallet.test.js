const request = require('supertest');
const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const walletRoutes = require('../../routes/wallet');
const { dbRun, dbGet } = require('../../config/database');

// Create test app
const app = express();
app.use(express.json());
app.use('/api/wallet', walletRoutes);

describe('Wallet Routes', () => {
  let testUser;
  let authToken;

  beforeEach(async () => {
    // Clean up test data
    await dbRun('DELETE FROM users WHERE email LIKE "test%@example.com"');
    await dbRun('DELETE FROM wallets WHERE user_id NOT IN (SELECT id FROM users)');
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
    authToken = testUtils.mockJwtToken({
      id: testUser.id,
      username: testUser.username,
      email: testUser.email
    });
  });

  describe('GET /api/wallet/:userId', () => {
    it('should get wallet balance for authenticated user', async () => {
      const response = await request(app)
        .get(`/api/wallet/${testUser.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('main_balance', 1000);
      expect(response.body).toHaveProperty('bonus_balance', 100);
      expect(response.body).toHaveProperty('partner_balance', 50);
    });

    it('should return 401 for unauthenticated request', async () => {
      const response = await request(app)
        .get(`/api/wallet/${testUser.id}`)
        .expect(401);

      expect(response.body).toHaveProperty('error');
    });

    it('should return 403 for unauthorized user', async () => {
      const otherUserToken = testUtils.mockJwtToken({
        id: 999,
        username: 'otheruser',
        email: 'other@example.com'
      });

      const response = await request(app)
        .get(`/api/wallet/${testUser.id}`)
        .set('Authorization', `Bearer ${otherUserToken}`)
        .expect(403);

      expect(response.body).toHaveProperty('error');
    });

    it('should return 400 for invalid user ID', async () => {
      const response = await request(app)
        .get('/api/wallet/invalid')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('GET /api/wallet/:userId/coupons', () => {
    beforeEach(async () => {
      // Create test coupons
      await dbRun(
        'INSERT INTO coupons (name, project, project_color, bonus, expiry_date, days_left, conditions, code, description, min_amount, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        ['Test Coupon 1', 'Test Project', '#2563eb', '10%', new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), 30, 'Min $100', 'TEST1', 'Test description', 100, 'active']
      );
      
      await dbRun(
        'INSERT INTO coupons (name, project, project_color, bonus, expiry_date, days_left, conditions, code, description, min_amount, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        ['Test Coupon 2', 'Test Project', '#059669', '15%', new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(), 15, 'Min $200', 'TEST2', 'Test description 2', 200, 'active']
      );

      // Create coupon history for user
      const coupon1 = await dbGet('SELECT id FROM coupons WHERE code = ?', ['TEST1']);
      const coupon2 = await dbGet('SELECT id FROM coupons WHERE code = ?', ['TEST2']);
      
      await dbRun(
        'INSERT INTO coupon_history (user_id, coupon_id, action) VALUES (?, ?, ?)',
        [testUser.id, coupon1.id, 'created']
      );
      
      await dbRun(
        'INSERT INTO coupon_history (user_id, coupon_id, action) VALUES (?, ?, ?)',
        [testUser.id, coupon2.id, 'activated']
      );
    });

    it('should get user coupons with pagination', async () => {
      const response = await request(app)
        .get(`/api/wallet/${testUser.id}/coupons`)
        .set('Authorization', `Bearer ${authToken}`)
        .query({ page: 1, limit: 10 })
        .expect(200);

      expect(response.body).toHaveProperty('coupons');
      expect(response.body).toHaveProperty('pagination');
      expect(Array.isArray(response.body.coupons)).toBe(true);
      expect(response.body.coupons.length).toBeGreaterThan(0);
    });

    it('should search coupons by name', async () => {
      const response = await request(app)
        .get(`/api/wallet/${testUser.id}/coupons`)
        .set('Authorization', `Bearer ${authToken}`)
        .query({ search: 'Test Coupon 1' })
        .expect(200);

      expect(response.body.coupons.length).toBe(1);
      expect(response.body.coupons[0].name).toBe('Test Coupon 1');
    });

    it('should return 401 for unauthenticated request', async () => {
      const response = await request(app)
        .get(`/api/wallet/${testUser.id}/coupons`)
        .expect(401);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('POST /api/wallet/:userId/deposit', () => {
    it('should process deposit for authenticated user', async () => {
      const depositData = {
        amount: 500,
        currency: 'USD',
        method: 'card'
      };

      const response = await request(app)
        .post(`/api/wallet/${testUser.id}/deposit`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(depositData)
        .expect(200);

      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('transaction_id');
    });

    it('should return 400 for invalid deposit amount', async () => {
      const depositData = {
        amount: -100,
        currency: 'USD',
        method: 'card'
      };

      const response = await request(app)
        .post(`/api/wallet/${testUser.id}/deposit`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(depositData)
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    it('should return 400 for invalid currency', async () => {
      const depositData = {
        amount: 500,
        currency: 'INVALID',
        method: 'card'
      };

      const response = await request(app)
        .post(`/api/wallet/${testUser.id}/deposit`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(depositData)
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    it('should return 401 for unauthenticated request', async () => {
      const depositData = {
        amount: 500,
        currency: 'USD',
        method: 'card'
      };

      const response = await request(app)
        .post(`/api/wallet/${testUser.id}/deposit`)
        .send(depositData)
        .expect(401);

      expect(response.body).toHaveProperty('error');
    });

    it('should create transaction record', async () => {
      const depositData = {
        amount: 500,
        currency: 'USD',
        method: 'card'
      };

      await request(app)
        .post(`/api/wallet/${testUser.id}/deposit`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(depositData)
        .expect(200);

      // Check if transaction was created
      const transaction = await dbGet(
        'SELECT * FROM transactions WHERE user_id = ? AND type = ? ORDER BY created_at DESC LIMIT 1',
        [testUser.id, 'deposit']
      );

      expect(transaction).toBeTruthy();
      expect(transaction.amount).toBe(500);
      expect(transaction.currency).toBe('USD');
    });
  });

  describe('Wallet Balance Updates', () => {
    it('should update wallet balance after deposit', async () => {
      const initialBalance = await dbGet('SELECT main_balance FROM wallets WHERE user_id = ?', [testUser.id]);
      const depositAmount = 500;

      const depositData = {
        amount: depositAmount,
        currency: 'USD',
        method: 'card'
      };

      await request(app)
        .post(`/api/wallet/${testUser.id}/deposit`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(depositData)
        .expect(200);

      // Check if balance was updated
      const updatedBalance = await dbGet('SELECT main_balance FROM wallets WHERE user_id = ?', [testUser.id]);
      expect(updatedBalance.main_balance).toBe(initialBalance.main_balance + depositAmount);
    });
  });

  describe('Error Handling', () => {
    it('should handle database errors gracefully', async () => {
      // Mock database error
      const originalDbGet = require('../../config/database').dbGet;
      require('../../config/database').dbGet = jest.fn().mockRejectedValue(new Error('Database error'));

      const response = await request(app)
        .get(`/api/wallet/${testUser.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(500);

      expect(response.body).toHaveProperty('error');

      // Restore original function
      require('../../config/database').dbGet = originalDbGet;
    });

    it('should validate user ID format', async () => {
      const response = await request(app)
        .get('/api/wallet/not-a-number')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('Security', () => {
    it('should prevent SQL injection in user ID', async () => {
      const maliciousUserId = "1; DROP TABLE users; --";
      
      const response = await request(app)
        .get(`/api/wallet/${maliciousUserId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    it('should sanitize input data', async () => {
      const depositData = {
        amount: 500,
        currency: 'USD',
        method: '<script>alert("xss")</script>'
      };

      const response = await request(app)
        .post(`/api/wallet/${testUser.id}/deposit`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(depositData)
        .expect(200);

      // Check if script tags are escaped
      expect(response.body.message).not.toContain('<script>');
    });
  });
});
