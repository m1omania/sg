const { body, param, query, validationResult } = require('express-validator');

/**
 * Middleware для обработки ошибок валидации
 */
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation failed',
      code: 'VALIDATION_ERROR',
      details: errors.array().map(err => ({
        field: err.path,
        message: err.msg,
        value: err.value
      }))
    });
  }
  next();
};

/**
 * Валидация для регистрации пользователя
 */
const validateRegistration = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Valid email is required'),
  body('code')
    .isLength({ min: 4, max: 6 })
    .isNumeric()
    .withMessage('Verification code must be 4-6 digits'),
  handleValidationErrors
];

/**
 * Валидация для входа пользователя
 */
const validateLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Valid email is required'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
  handleValidationErrors
];

/**
 * Валидация для пополнения кошелька
 */
const validateDeposit = [
  body('amount')
    .isFloat({ min: 0.01 })
    .withMessage('Amount must be a positive number'),
  body('type')
    .isIn(['main', 'partner'])
    .withMessage('Type must be either "main" or "partner"'),
  handleValidationErrors
];

/**
 * Валидация для создания инвестиции
 */
const validateInvestment = [
  body('project_id')
    .isInt({ min: 1 })
    .withMessage('Valid project ID is required'),
  body('amount')
    .isFloat({ min: 1 })
    .withMessage('Amount must be at least 1'),
  body('coupon_id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Coupon ID must be a positive integer'),
  handleValidationErrors
];

/**
 * Валидация для активации промокода
 */
const validatePromoActivation = [
  body('code')
    .isLength({ min: 1, max: 50 })
    .matches(/^[A-Z0-9-]+$/)
    .withMessage('Promo code must contain only uppercase letters, numbers and hyphens'),
  handleValidationErrors
];

/**
 * Валидация ID параметра
 */
const validateId = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('ID must be a positive integer'),
  handleValidationErrors
];

/**
 * Валидация userId параметра
 */
const validateUserId = [
  param('userId')
    .isInt({ min: 1 })
    .withMessage('User ID must be a positive integer'),
  handleValidationErrors
];

/**
 * Валидация поискового запроса
 */
const validateSearch = [
  query('q')
    .optional()
    .isLength({ min: 1, max: 100 })
    .trim()
    .escape()
    .withMessage('Search query must be 1-100 characters'),
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  handleValidationErrors
];

module.exports = {
  handleValidationErrors,
  validateRegistration,
  validateLogin,
  validateDeposit,
  validateInvestment,
  validatePromoActivation,
  validateId,
  validateUserId,
  validateSearch
};
