const { config } = require('dotenv');
const path = require('path');

// Load test environment variables
config({ path: path.join(__dirname, '../.env.test') });

// Set test environment
process.env.NODE_ENV = 'test';
process.env.DATABASE_PATH = ':memory:'; // Use in-memory database for tests
process.env.JWT_SECRET = 'test-jwt-secret';
process.env.LOG_LEVEL = 'error'; // Reduce log noise during tests

// Mock console methods to reduce noise during tests
const originalConsole = { ...console };
global.console = {
  ...console,
  log: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  debug: jest.fn()
};

// Restore console for debugging
global.console.original = originalConsole;

// Global test utilities
global.testUtils = {
  // Generate test user data
  generateTestUser: (overrides = {}) => ({
    username: 'testuser',
    email: 'test@example.com',
    password: 'TestPassword123!',
    ...overrides
  }),

  // Generate test coupon data
  generateTestCoupon: (overrides = {}) => ({
    name: 'Test Coupon',
    project: 'Test Project',
    project_color: '#2563eb',
    bonus: '10%',
    expiry_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    days_left: 30,
    conditions: 'Min investment $100',
    code: 'TEST123',
    description: 'Test coupon description',
    min_amount: 100,
    status: 'active',
    ...overrides
  }),

  // Generate test investment data
  generateTestInvestment: (overrides = {}) => ({
    user_id: 1,
    project_id: 1,
    amount: 1000,
    final_amount: 1100,
    status: 'active',
    coupon_id: null,
    ...overrides
  }),

  // Generate test transaction data
  generateTestTransaction: (overrides = {}) => ({
    user_id: 1,
    type: 'deposit',
    amount: 1000,
    currency: 'USD',
    status: 'completed',
    transaction_id: 'TXN123456',
    description: 'Test transaction',
    ...overrides
  }),

  // Wait for async operations
  wait: (ms) => new Promise(resolve => setTimeout(resolve, ms)),

  // Generate random string
  randomString: (length = 10) => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  },

  // Generate random email
  randomEmail: () => `test-${Date.now()}@example.com`,

  // Generate random username
  randomUsername: () => `testuser${Date.now()}`,

  // Mock JWT token
  mockJwtToken: (payload = {}) => {
    const jwt = require('jsonwebtoken');
    return jwt.sign(
      { id: 1, username: 'testuser', ...payload },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
  }
};

// Mock external services
jest.mock('../config/logger', () => ({
  logger: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn()
  },
  auditLog: {
    userAction: jest.fn(),
    securityEvent: jest.fn(),
    systemEvent: jest.fn()
  }
}));

// Mock rate limiting
jest.mock('../middleware/security', () => ({
  apiLimiter: (req, res, next) => next(),
  authLimiter: (req, res, next) => next(),
  registrationLimiter: (req, res, next) => next(),
  helmetConfig: (req, res, next) => next(),
  securityLogger: (req, res, next) => next(),
  bodySizeLimiter: (req, res, next) => next(),
  contentTypeChecker: (req, res, next) => next()
}));

// Mock validation middleware
jest.mock('../middleware/validation', () => ({
  validateRegistration: (req, res, next) => next(),
  validateLogin: (req, res, next) => next(),
  validateDeposit: (req, res, next) => next(),
  validateInvestment: (req, res, next) => next(),
  validatePromoActivation: (req, res, next) => next(),
  validateId: (req, res, next) => next(),
  validateUserId: (req, res, next) => next(),
  validateSearch: (req, res, next) => next()
}));

// Mock sanitization middleware
jest.mock('../middleware/sanitization', () => ({
  sanitizeInput: (req, res, next) => next()
}));

// Global test timeout
jest.setTimeout(10000);

// Clean up after each test
afterEach(() => {
  jest.clearAllMocks();
});

// Global error handler for unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Global error handler for uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
});
