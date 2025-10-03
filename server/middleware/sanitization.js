const { body, param, query, sanitizeBody, sanitizeParam, sanitizeQuery } = require('express-validator');

/**
 * Санитизация входных данных для предотвращения XSS и инъекций
 */
const sanitizeInput = (req, res, next) => {
  // Санитизируем все строковые поля в body
  if (req.body) {
    Object.keys(req.body).forEach(key => {
      if (typeof req.body[key] === 'string') {
        // Удаляем потенциально опасные символы
        req.body[key] = req.body[key]
          .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Удаляем script теги
          .replace(/<[^>]*>/g, '') // Удаляем HTML теги
          .replace(/javascript:/gi, '') // Удаляем javascript: протоколы
          .replace(/on\w+\s*=/gi, '') // Удаляем event handlers
          .trim();
      }
    });
  }

  // Санитизируем query параметры
  if (req.query) {
    Object.keys(req.query).forEach(key => {
      if (typeof req.query[key] === 'string') {
        req.query[key] = req.query[key]
          .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
          .replace(/<[^>]*>/g, '')
          .replace(/javascript:/gi, '')
          .replace(/on\w+\s*=/gi, '')
          .trim();
      }
    });
  }

  next();
};

/**
 * Валидация и санитизация для создания купона
 */
const validateCouponCreation = [
  body('name')
    .isLength({ min: 1, max: 100 })
    .trim()
    .escape()
    .withMessage('Name must be 1-100 characters'),
  body('project')
    .isLength({ min: 1, max: 50 })
    .trim()
    .escape()
    .withMessage('Project must be 1-50 characters'),
  body('project_color')
    .matches(/^#[0-9A-Fa-f]{6}$/)
    .withMessage('Project color must be a valid hex color'),
  body('bonus')
    .isLength({ min: 1, max: 20 })
    .trim()
    .escape()
    .withMessage('Bonus must be 1-20 characters'),
  body('expiry_date')
    .isISO8601()
    .withMessage('Expiry date must be a valid date'),
  body('days_left')
    .isInt({ min: 0, max: 365 })
    .withMessage('Days left must be between 0 and 365'),
  body('conditions')
    .optional()
    .isLength({ max: 200 })
    .trim()
    .escape()
    .withMessage('Conditions must be less than 200 characters'),
  body('code')
    .isLength({ min: 5, max: 50 })
    .matches(/^[A-Z0-9-]+$/)
    .withMessage('Code must be 5-50 characters, uppercase letters, numbers and hyphens only'),
  body('description')
    .optional()
    .isLength({ max: 500 })
    .trim()
    .escape()
    .withMessage('Description must be less than 500 characters'),
  body('min_amount')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Min amount must be a positive number'),
  body('source')
    .optional()
    .isIn(['manual', 'email', 'sms', 'api'])
    .withMessage('Source must be one of: manual, email, sms, api')
];

/**
 * Валидация для создания проекта
 */
const validateProjectCreation = [
  body('name')
    .isLength({ min: 1, max: 100 })
    .trim()
    .escape()
    .withMessage('Name must be 1-100 characters'),
  body('description')
    .isLength({ min: 10, max: 1000 })
    .trim()
    .escape()
    .withMessage('Description must be 10-1000 characters'),
  body('image_url')
    .optional()
    .isURL()
    .withMessage('Image URL must be a valid URL'),
  body('min_investment')
    .isFloat({ min: 1 })
    .withMessage('Min investment must be at least 1'),
  body('interest_rate')
    .isFloat({ min: 0, max: 100 })
    .withMessage('Interest rate must be between 0 and 100'),
  body('duration')
    .isInt({ min: 1, max: 120 })
    .withMessage('Duration must be between 1 and 120 months'),
  body('status')
    .optional()
    .isIn(['active', 'completed', 'upcoming', 'paused'])
    .withMessage('Status must be one of: active, completed, upcoming, paused')
];

/**
 * Валидация для создания транзакции
 */
const validateTransactionCreation = [
  body('type')
    .isIn(['deposit', 'withdrawal', 'investment', 'coupon', 'refund'])
    .withMessage('Type must be one of: deposit, withdrawal, investment, coupon, refund'),
  body('amount')
    .isFloat({ min: 0.01 })
    .withMessage('Amount must be a positive number'),
  body('currency')
    .optional()
    .isIn(['USD', 'EUR', 'GBP', 'RUB'])
    .withMessage('Currency must be one of: USD, EUR, GBP, RUB'),
  body('status')
    .optional()
    .isIn(['pending', 'completed', 'failed', 'cancelled'])
    .withMessage('Status must be one of: pending, completed, failed, cancelled'),
  body('payment_method')
    .optional()
    .isIn(['card', 'crypto', 'bank_transfer', 'paypal'])
    .withMessage('Payment method must be one of: card, crypto, bank_transfer, paypal'),
  body('description')
    .optional()
    .isLength({ max: 200 })
    .trim()
    .escape()
    .withMessage('Description must be less than 200 characters')
];

/**
 * Валидация для обновления пользователя
 */
const validateUserUpdate = [
  body('username')
    .optional()
    .isLength({ min: 3, max: 50 })
    .matches(/^[a-zA-Z0-9_-]+$/)
    .withMessage('Username must be 3-50 characters, alphanumeric, underscore, or hyphen only'),
  body('phone')
    .optional()
    .matches(/^\+?[1-9]\d{1,14}$/)
    .withMessage('Phone must be a valid international phone number'),
  body('email')
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage('Email must be valid')
];

/**
 * Валидация для фильтрации и пагинации
 */
const validatePagination = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  query('sort')
    .optional()
    .isIn(['created_at', 'updated_at', 'name', 'amount', 'status'])
    .withMessage('Sort must be one of: created_at, updated_at, name, amount, status'),
  query('order')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('Order must be asc or desc')
];

/**
 * Валидация для дат
 */
const validateDateRange = [
  query('start_date')
    .optional()
    .isISO8601()
    .withMessage('Start date must be a valid ISO 8601 date'),
  query('end_date')
    .optional()
    .isISO8601()
    .withMessage('End date must be a valid ISO 8601 date'),
  query('start_date')
    .custom((value, { req }) => {
      if (value && req.query.end_date && new Date(value) > new Date(req.query.end_date)) {
        throw new Error('Start date must be before end date');
      }
      return true;
    })
];

/**
 * Валидация для сумм в разных валютах
 */
const validateCurrencyAmount = (fieldName, minAmount = 0.01) => [
  body(fieldName)
    .isFloat({ min: minAmount })
    .withMessage(`${fieldName} must be at least ${minAmount}`),
  body('currency')
    .optional()
    .isIn(['USD', 'EUR', 'GBP', 'RUB'])
    .withMessage('Currency must be one of: USD, EUR, GBP, RUB')
];

/**
 * Валидация для ID параметров с дополнительными проверками
 */
const validateIdWithType = (idType) => [
  param('id')
    .isInt({ min: 1 })
    .withMessage(`${idType} ID must be a positive integer`)
    .custom(async (value) => {
      // Здесь можно добавить проверку существования ID в базе данных
      return true;
    })
];

/**
 * Middleware для проверки обязательных полей
 */
const requireFields = (fields) => {
  return (req, res, next) => {
    const missingFields = fields.filter(field => !req.body[field]);
    
    if (missingFields.length > 0) {
      return res.status(400).json({
        error: 'Missing required fields',
        code: 'MISSING_FIELDS',
        missingFields,
        timestamp: new Date().toISOString()
      });
    }
    
    next();
  };
};

/**
 * Middleware для проверки размера файлов
 */
const validateFileSize = (maxSizeInMB = 5) => {
  return (req, res, next) => {
    if (req.file && req.file.size > maxSizeInMB * 1024 * 1024) {
      return res.status(400).json({
        error: 'File too large',
        code: 'FILE_TOO_LARGE',
        maxSize: `${maxSizeInMB}MB`,
        timestamp: new Date().toISOString()
      });
    }
    next();
  };
};

module.exports = {
  sanitizeInput,
  validateCouponCreation,
  validateProjectCreation,
  validateTransactionCreation,
  validateUserUpdate,
  validatePagination,
  validateDateRange,
  validateCurrencyAmount,
  validateIdWithType,
  requireFields,
  validateFileSize
};
