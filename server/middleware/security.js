const rateLimit = require('express-rate-limit');
const slowDown = require('express-slow-down');
const helmet = require('helmet');

/**
 * Rate limiting для API endpoints
 */
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 минут
  max: 100, // максимум 100 запросов с одного IP за 15 минут
  message: {
    error: 'Too many requests from this IP',
    code: 'RATE_LIMIT_EXCEEDED',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Строгий rate limiting для аутентификации
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 минут
  max: 5, // максимум 5 попыток входа с одного IP за 15 минут
  message: {
    error: 'Too many authentication attempts',
    code: 'AUTH_RATE_LIMIT_EXCEEDED',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Rate limiting для регистрации
 */
const registrationLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 час
  max: 3, // максимум 3 регистрации с одного IP за час
  message: {
    error: 'Too many registration attempts',
    code: 'REGISTRATION_RATE_LIMIT_EXCEEDED',
    retryAfter: '1 hour'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Slow down для подозрительной активности
 */
const speedLimiter = slowDown({
  windowMs: 15 * 60 * 1000, // 15 минут
  delayAfter: 50, // начинаем замедлять после 50 запросов
  delayMs: 500, // добавляем 500ms задержки на каждый запрос
  maxDelayMs: 20000, // максимум 20 секунд задержки
});

/**
 * Настройка Helmet для безопасности заголовков
 */
const helmetConfig = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  crossOriginEmbedderPolicy: false, // отключаем для совместимости
});

/**
 * Middleware для логирования подозрительной активности
 */
const securityLogger = (req, res, next) => {
  const ip = req.ip || req.connection.remoteAddress;
  const userAgent = req.get('User-Agent') || 'Unknown';
  
  // Логируем подозрительные запросы
  if (req.url.includes('..') || req.url.includes('//')) {
    console.warn(`Suspicious request from ${ip}: ${req.method} ${req.url} - ${userAgent}`);
  }
  
  next();
};

/**
 * Middleware для проверки размера тела запроса
 */
const bodySizeLimiter = (req, res, next) => {
  const contentLength = parseInt(req.get('content-length') || '0');
  const maxSize = 10 * 1024 * 1024; // 10MB
  
  if (contentLength > maxSize) {
    return res.status(413).json({
      error: 'Request entity too large',
      code: 'PAYLOAD_TOO_LARGE',
      maxSize: '10MB'
    });
  }
  
  next();
};

/**
 * Middleware для проверки Content-Type
 */
const contentTypeChecker = (req, res, next) => {
  if (req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH') {
    const contentType = req.get('content-type');
    
    if (!contentType || !contentType.includes('application/json')) {
      return res.status(400).json({
        error: 'Content-Type must be application/json',
        code: 'INVALID_CONTENT_TYPE'
      });
    }
  }
  
  next();
};

module.exports = {
  apiLimiter,
  authLimiter,
  registrationLimiter,
  speedLimiter,
  helmetConfig,
  securityLogger,
  bodySizeLimiter,
  contentTypeChecker
};
