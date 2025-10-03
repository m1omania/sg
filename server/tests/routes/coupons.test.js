const request = require('supertest');
const express = require('express');
const bcrypt = require('bcrypt');
const couponRoutes = require('../../routes/coupons');
const { dbRun, dbGet, dbAll } = require('../../config/database');

// Create test app
const app = express();
app.use(express.json());
app.use('/api/coupons', couponRoutes);

describe('Coupon Routes', () => {
  let testUser;
  let authToken;
  let testCoupons = [];

  beforeEach(async () => {
    // Clean up test data
    await dbRun('DELETE FROM users WHERE email LIKE "test%@example.com"');
    await dbRun('DELETE FROM coupons WHERE name LIKE "Test Coupon%"');
    await dbRun('DELETE FROM coupon_history WHERE user_id NOT IN (SELECT id FROM users)');

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

    // Generate auth token
    authToken = testUtils.mockJwtToken({
      id: testUser.id,
      username: testUser.username,
      email: testUser.email
    });

    // Create test coupons
    const coupon1 = await dbRun(
      'INSERT INTO coupons (name, project, project_color, bonus, expiry_date, days_left, conditions, code, description, min_amount, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      ['Test Coupon 1', 'Solar Project A', '#2563eb', '10%', new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), 30, 'Min investment $100', 'TEST1', 'Test coupon 1 description', 100, 'active']
    );

    const coupon2 = await dbRun(
      'INSERT INTO coupons (name, project, project_color, bonus, expiry_date, days_left, conditions, code, description, min_amount, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      ['Test Coupon 2', 'Wind Project B', '#059669', '15%', new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(), 15, 'Min investment $200', 'TEST2', 'Test coupon 2 description', 200, 'active']
    );

    const coupon3 = await dbRun(
      'INSERT INTO coupons (name, project, project_color, bonus, expiry_date, days_left, conditions, code, description, min_amount, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      ['Test Coupon 3', 'Hydro Project C', '#f59e0b', '20%', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), -1, 'Min investment $300', 'TEST3', 'Test coupon 3 description', 300, 'expired']
    );

    testCoupons = [
      { id: coupon1.lastInsertRowid, code: 'TEST1' },
      { id: coupon2.lastInsertRowid, code: 'TEST2' },
      { id: coupon3.lastInsertRowid, code: 'TEST3' }
    ];
  });

  describe('GET /api/coupons/active', () => {
    it('should get active coupons with pagination', async () => {
      const response = await request(app)
        .get('/api/coupons/active')
        .query({ page: 1, limit: 10 })
        .expect(200);

      expect(response.body).toHaveProperty('coupons');
      expect(response.body).toHaveProperty('pagination');
      expect(Array.isArray(response.body.coupons)).toBe(true);
      expect(response.body.coupons.length).toBe(2); // Only active coupons
    });

    it('should search coupons by name', async () => {
      const response = await request(app)
        .get('/api/coupons/active')
        .query({ search: 'Solar' })
        .expect(200);

      expect(response.body.coupons.length).toBe(1);
      expect(response.body.coupons[0].name).toBe('Test Coupon 1');
    });

    it('should search coupons by project', async () => {
      const response = await request(app)
        .get('/api/coupons/active')
        .query({ search: 'Wind' })
        .expect(200);

      expect(response.body.coupons.length).toBe(1);
      expect(response.body.coupons[0].project).toBe('Wind Project B');
    });

    it('should filter by minimum amount', async () => {
      const response = await request(app)
        .get('/api/coupons/active')
        .query({ min_amount: 150 })
        .expect(200);

      expect(response.body.coupons.length).toBe(1);
      expect(response.body.coupons[0].min_amount).toBeGreaterThanOrEqual(150);
    });

    it('should handle empty search results', async () => {
      const response = await request(app)
        .get('/api/coupons/active')
        .query({ search: 'NonExistent' })
        .expect(200);

      expect(response.body.coupons.length).toBe(0);
    });
  });

  describe('GET /api/coupons/history', () => {
    beforeEach(async () => {
      // Create coupon history for user
      await dbRun(
        'INSERT INTO coupon_history (user_id, coupon_id, action) VALUES (?, ?, ?)',
        [testUser.id, testCoupons[0].id, 'created']
      );
      
      await dbRun(
        'INSERT INTO coupon_history (user_id, coupon_id, action) VALUES (?, ?, ?)',
        [testUser.id, testCoupons[1].id, 'activated']
      );
    });

    it('should get user coupon history with pagination', async () => {
      const response = await request(app)
        .get('/api/coupons/history')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ page: 1, limit: 10 })
        .expect(200);

      expect(response.body).toHaveProperty('history');
      expect(response.body).toHaveProperty('pagination');
      expect(Array.isArray(response.body.history)).toBe(true);
      expect(response.body.history.length).toBe(2);
    });

    it('should return 401 for unauthenticated request', async () => {
      const response = await request(app)
        .get('/api/coupons/history')
        .expect(401);

      expect(response.body).toHaveProperty('error');
    });

    it('should search history by coupon name', async () => {
      const response = await request(app)
        .get('/api/coupons/history')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ search: 'Test Coupon 1' })
        .expect(200);

      expect(response.body.history.length).toBe(1);
      expect(response.body.history[0].name).toBe('Test Coupon 1');
    });
  });

  describe('POST /api/coupons/use', () => {
    it('should use coupon successfully', async () => {
      const response = await request(app)
        .post('/api/coupons/use')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ couponId: testCoupons[0].id })
        .expect(200);

      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('coupon');
    });

    it('should return 400 for invalid coupon ID', async () => {
      const response = await request(app)
        .post('/api/coupons/use')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ couponId: 99999 })
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    it('should return 400 for expired coupon', async () => {
      const response = await request(app)
        .post('/api/coupons/use')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ couponId: testCoupons[2].id })
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    it('should return 400 for already used coupon', async () => {
      // First use
      await request(app)
        .post('/api/coupons/use')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ couponId: testCoupons[0].id })
        .expect(200);

      // Second use should fail
      const response = await request(app)
        .post('/api/coupons/use')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ couponId: testCoupons[0].id })
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    it('should return 401 for unauthenticated request', async () => {
      const response = await request(app)
        .post('/api/coupons/use')
        .send({ couponId: testCoupons[0].id })
        .expect(401);

      expect(response.body).toHaveProperty('error');
    });

    it('should create coupon history record', async () => {
      await request(app)
        .post('/api/coupons/use')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ couponId: testCoupons[0].id })
        .expect(200);

      // Check if history record was created
      const history = await dbGet(
        'SELECT * FROM coupon_history WHERE user_id = ? AND coupon_id = ? AND action = ?',
        [testUser.id, testCoupons[0].id, 'used']
      );

      expect(history).toBeTruthy();
    });
  });

  describe('POST /api/coupons/activate', () => {
    it('should activate promo code successfully', async () => {
      const response = await request(app)
        .post('/api/coupons/activate')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ code: 'TEST1' })
        .expect(200);

      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('coupon');
    });

    it('should return 400 for invalid promo code', async () => {
      const response = await request(app)
        .post('/api/coupons/activate')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ code: 'INVALID' })
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    it('should return 400 for expired promo code', async () => {
      const response = await request(app)
        .post('/api/coupons/activate')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ code: 'TEST3' })
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    it('should return 400 for already activated promo code', async () => {
      // First activation
      await request(app)
        .post('/api/coupons/activate')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ code: 'TEST1' })
        .expect(200);

      // Second activation should fail
      const response = await request(app)
        .post('/api/coupons/activate')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ code: 'TEST1' })
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    it('should return 401 for unauthenticated request', async () => {
      const response = await request(app)
        .post('/api/coupons/activate')
        .send({ code: 'TEST1' })
        .expect(401);

      expect(response.body).toHaveProperty('error');
    });

    it('should create activation history record', async () => {
      await request(app)
        .post('/api/coupons/activate')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ code: 'TEST1' })
        .expect(200);

      // Check if history record was created
      const history = await dbGet(
        'SELECT * FROM coupon_history WHERE user_id = ? AND coupon_id = ? AND action = ?',
        [testUser.id, testCoupons[0].id, 'activated']
      );

      expect(history).toBeTruthy();
    });
  });

  describe('Input Validation', () => {
    it('should validate coupon ID format', async () => {
      const response = await request(app)
        .post('/api/coupons/use')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ couponId: 'not-a-number' })
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    it('should validate promo code format', async () => {
      const response = await request(app)
        .post('/api/coupons/activate')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ code: '' })
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    it('should sanitize input data', async () => {
      const response = await request(app)
        .post('/api/coupons/activate')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ code: '<script>alert("xss")</script>' })
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('Security', () => {
    it('should prevent SQL injection in coupon ID', async () => {
      const maliciousCouponId = "1; DROP TABLE coupons; --";
      
      const response = await request(app)
        .post('/api/coupons/use')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ couponId: maliciousCouponId })
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    it('should prevent SQL injection in promo code', async () => {
      const maliciousCode = "'; DROP TABLE coupons; --";
      
      const response = await request(app)
        .post('/api/coupons/activate')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ code: maliciousCode })
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('Error Handling', () => {
    it('should handle database errors gracefully', async () => {
      // Mock database error
      const originalDbGet = require('../../config/database').dbGet;
      require('../../config/database').dbGet = jest.fn().mockRejectedValue(new Error('Database error'));

      const response = await request(app)
        .get('/api/coupons/active')
        .expect(500);

      expect(response.body).toHaveProperty('error');

      // Restore original function
      require('../../config/database').dbGet = originalDbGet;
    });
  });
});
