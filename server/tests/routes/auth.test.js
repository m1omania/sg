const request = require('supertest');
const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const authRoutes = require('../../routes/auth');
const { dbRun, dbGet } = require('../../config/database');

// Create test app
const app = express();
app.use(express.json());
app.use('/api/auth', authRoutes);

describe('Auth Routes', () => {
  beforeEach(async () => {
    // Clean up test data
    await dbRun('DELETE FROM users WHERE email LIKE "test%@example.com"');
    await dbRun('DELETE FROM wallets WHERE user_id NOT IN (SELECT id FROM users)');
  });

  describe('POST /api/auth/send-verification', () => {
    it('should send verification code for new email', async () => {
      const response = await request(app)
        .post('/api/auth/send-verification')
        .send({ email: 'newuser@example.com' })
        .expect(200);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('verification code');
    });

    it('should return error for invalid email format', async () => {
      const response = await request(app)
        .post('/api/auth/send-verification')
        .send({ email: 'invalid-email' })
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    it('should return error for existing email', async () => {
      // Create test user first
      const hashedPassword = await bcrypt.hash('TestPassword123!', 12);
      await dbRun(
        'INSERT INTO users (username, email, password, email_verified, phone_verified) VALUES (?, ?, ?, ?, ?)',
        ['testuser', 'existing@example.com', hashedPassword, 1, 1]
      );

      const response = await request(app)
        .post('/api/auth/send-verification')
        .send({ email: 'existing@example.com' })
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('POST /api/auth/register', () => {
    it('should register new user successfully', async () => {
      const userData = testUtils.generateTestUser({
        email: 'newuser@example.com',
        code: '123456'
      });

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user).toHaveProperty('id');
      expect(response.body.user).toHaveProperty('username', userData.username);
      expect(response.body.user).toHaveProperty('email', userData.email);
    });

    it('should return error for invalid verification code', async () => {
      const userData = testUtils.generateTestUser({
        email: 'newuser@example.com',
        code: 'invalid'
      });

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    it('should return error for existing email', async () => {
      // Create test user first
      const hashedPassword = await bcrypt.hash('TestPassword123!', 12);
      await dbRun(
        'INSERT INTO users (username, email, password, email_verified, phone_verified) VALUES (?, ?, ?, ?, ?)',
        ['testuser', 'existing@example.com', hashedPassword, 1, 1]
      );

      const userData = testUtils.generateTestUser({
        email: 'existing@example.com',
        code: '123456'
      });

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    it('should create wallet for new user', async () => {
      const userData = testUtils.generateTestUser({
        email: 'newuser@example.com',
        code: '123456'
      });

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      const userId = response.body.user.id;
      
      // Check if wallet was created
      const wallet = await dbGet('SELECT * FROM wallets WHERE user_id = ?', [userId]);
      expect(wallet).toBeTruthy();
      expect(wallet.user_id).toBe(userId);
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      // Create test user
      const hashedPassword = await bcrypt.hash('TestPassword123!', 12);
      await dbRun(
        'INSERT INTO users (username, email, password, email_verified, phone_verified) VALUES (?, ?, ?, ?, ?)',
        ['testuser', 'test@example.com', hashedPassword, 1, 1]
      );
    });

    it('should login with valid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'TestPassword123!'
        })
        .expect(200);

      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user).toHaveProperty('id');
      expect(response.body.user).toHaveProperty('username', 'testuser');
      expect(response.body.user).toHaveProperty('email', 'test@example.com');
    });

    it('should return error for invalid email', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'TestPassword123!'
        })
        .expect(401);

      expect(response.body).toHaveProperty('error');
    });

    it('should return error for invalid password', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'WrongPassword'
        })
        .expect(401);

      expect(response.body).toHaveProperty('error');
    });

    it('should return error for missing credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({})
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('JWT Token Validation', () => {
    it('should generate valid JWT token', async () => {
      const hashedPassword = await bcrypt.hash('TestPassword123!', 12);
      await dbRun(
        'INSERT INTO users (username, email, password, email_verified, phone_verified) VALUES (?, ?, ?, ?, ?)',
        ['testuser', 'test@example.com', hashedPassword, 1, 1]
      );

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'TestPassword123!'
        })
        .expect(200);

      const token = response.body.token;
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      expect(decoded).toHaveProperty('id');
      expect(decoded).toHaveProperty('username', 'testuser');
      expect(decoded).toHaveProperty('email', 'test@example.com');
    });

    it('should reject invalid JWT token', async () => {
      const response = await request(app)
        .get('/api/auth/verify')
        .set('Authorization', 'Bearer invalid-token')
        .expect(403);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('Password Hashing', () => {
    it('should hash passwords securely', async () => {
      const userData = testUtils.generateTestUser({
        email: 'newuser@example.com',
        code: '123456'
      });

      await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      // Check if password is hashed in database
      const user = await dbGet('SELECT password FROM users WHERE email = ?', [userData.email]);
      expect(user.password).not.toBe(userData.password);
      expect(user.password).toMatch(/^\$2[aby]\$\d+\$/); // bcrypt hash pattern
    });

    it('should verify hashed passwords correctly', async () => {
      const password = 'TestPassword123!';
      const hashedPassword = await bcrypt.hash(password, 12);
      
      const isValid = await bcrypt.compare(password, hashedPassword);
      expect(isValid).toBe(true);
      
      const isInvalid = await bcrypt.compare('WrongPassword', hashedPassword);
      expect(isInvalid).toBe(false);
    });
  });

  describe('Rate Limiting', () => {
    it('should handle multiple rapid requests', async () => {
      const promises = Array(5).fill().map(() =>
        request(app)
          .post('/api/auth/send-verification')
          .send({ email: 'test@example.com' })
      );

      const responses = await Promise.all(promises);
      
      // At least one should succeed
      const successCount = responses.filter(r => r.status === 200).length;
      expect(successCount).toBeGreaterThan(0);
    });
  });

  describe('Input Validation', () => {
    it('should validate email format', async () => {
      const response = await request(app)
        .post('/api/auth/send-verification')
        .send({ email: 'not-an-email' })
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    it('should validate password strength', async () => {
      const userData = testUtils.generateTestUser({
        email: 'newuser@example.com',
        code: '123456',
        password: 'weak'
      });

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    it('should sanitize input data', async () => {
      const userData = testUtils.generateTestUser({
        email: 'newuser@example.com',
        code: '123456',
        username: '<script>alert("xss")</script>'
      });

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      // Check if script tags are escaped
      expect(response.body.user.username).not.toContain('<script>');
    });
  });
});
