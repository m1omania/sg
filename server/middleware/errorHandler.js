const config = require('../config/environment');

/**
 * Централизованный обработчик ошибок
 */
const errorHandler = (err, req, res, next) => {
  // Логируем ошибку
  console.error('Error occurred:', {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    timestamp: new Date().toISOString()
  });

  // Определяем тип ошибки и соответствующий HTTP статус
  let statusCode = 500;
  let errorCode = 'INTERNAL_ERROR';
  let message = 'Internal server error';

  if (err.name === 'ValidationError') {
    statusCode = 400;
    errorCode = 'VALIDATION_ERROR';
    message = 'Validation failed';
  } else if (err.name === 'UnauthorizedError') {
    statusCode = 401;
    errorCode = 'UNAUTHORIZED';
    message = 'Unauthorized access';
  } else if (err.name === 'ForbiddenError') {
    statusCode = 403;
    errorCode = 'FORBIDDEN';
    message = 'Access forbidden';
  } else if (err.name === 'NotFoundError') {
    statusCode = 404;
    errorCode = 'NOT_FOUND';
    message = 'Resource not found';
  } else if (err.name === 'ConflictError') {
    statusCode = 409;
    errorCode = 'CONFLICT';
    message = 'Resource conflict';
  } else if (err.name === 'RateLimitError') {
    statusCode = 429;
    errorCode = 'RATE_LIMIT_EXCEEDED';
    message = 'Too many requests';
  } else if (err.code === 'SQLITE_CONSTRAINT') {
    statusCode = 409;
    errorCode = 'DATABASE_CONSTRAINT';
    message = 'Database constraint violation';
  } else if (err.code === 'SQLITE_BUSY') {
    statusCode = 503;
    errorCode = 'DATABASE_BUSY';
    message = 'Database is busy, please try again later';
  } else if (err.code === 'ENOTFOUND' || err.code === 'ECONNREFUSED') {
    statusCode = 503;
    errorCode = 'SERVICE_UNAVAILABLE';
    message = 'Service temporarily unavailable';
  }

  // В development режиме показываем полную информацию об ошибке
  const isDevelopment = config.NODE_ENV === 'development';
  
  const errorResponse = {
    error: message,
    code: errorCode,
    timestamp: new Date().toISOString(),
    path: req.url,
    method: req.method
  };

  // Добавляем детали ошибки только в development
  if (isDevelopment) {
    errorResponse.details = {
      message: err.message,
      stack: err.stack,
      name: err.name
    };
  }

  res.status(statusCode).json(errorResponse);
};

/**
 * Middleware для обработки 404 ошибок
 */
const notFoundHandler = (req, res) => {
  res.status(404).json({
    error: 'Route not found',
    code: 'ROUTE_NOT_FOUND',
    path: req.url,
    method: req.method,
    timestamp: new Date().toISOString()
  });
};

/**
 * Middleware для обработки необработанных промисов
 */
const unhandledRejectionHandler = (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // В production можно отправить уведомление в систему мониторинга
};

/**
 * Middleware для обработки необработанных исключений
 */
const uncaughtExceptionHandler = (error) => {
  console.error('Uncaught Exception:', error);
  // В production нужно корректно завершить процесс
  if (config.NODE_ENV === 'production') {
    process.exit(1);
  }
};

/**
 * Middleware для обработки ошибок валидации
 */
const validationErrorHandler = (err, req, res, next) => {
  if (err.name === 'ValidationError' || err.type === 'entity.parse.failed') {
    return res.status(400).json({
      error: 'Invalid request data',
      code: 'VALIDATION_ERROR',
      details: err.message,
      timestamp: new Date().toISOString()
    });
  }
  next(err);
};

/**
 * Middleware для обработки ошибок JSON парсинга
 */
const jsonErrorHandler = (err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({
      error: 'Invalid JSON format',
      code: 'INVALID_JSON',
      details: 'Request body must be valid JSON',
      timestamp: new Date().toISOString()
    });
  }
  next(err);
};

module.exports = {
  errorHandler,
  notFoundHandler,
  unhandledRejectionHandler,
  uncaughtExceptionHandler,
  validationErrorHandler,
  jsonErrorHandler
};
