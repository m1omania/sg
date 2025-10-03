const express = require('express');
const path = require('path');
const cors = require('cors');
const { dbGet } = require('../server/config/database');
const health = require('../server/health');
const config = require('../server/config/environment');
const { helmetConfig, securityLogger, bodySizeLimiter, contentTypeChecker, apiLimiter } = require('../server/middleware/security');
const { errorHandler, notFoundHandler, unhandledRejectionHandler, uncaughtExceptionHandler, validationErrorHandler, jsonErrorHandler } = require('../server/middleware/errorHandler');
const { swaggerUi, specs } = require('../server/config/swagger');
const { logger, httpLoggingMiddleware, auditLog } = require('../server/config/logger');
const { sanitizeInput } = require('../server/middleware/sanitization');
const { metricsMiddleware, errorMetricsMiddleware } = require('../server/middleware/metrics');
const { alertMiddleware } = require('../server/middleware/alerts');

const app = express();

// Обработчики необработанных исключений
process.on('unhandledRejection', unhandledRejectionHandler);
process.on('uncaughtException', uncaughtExceptionHandler);

// Security middleware (должны быть первыми)
app.use(helmetConfig);
app.use(securityLogger);
app.use(bodySizeLimiter);
app.use(contentTypeChecker);

// HTTP логирование
app.use(httpLoggingMiddleware);

// CORS
app.use(cors({
  origin: config.ALLOWED_ORIGINS,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Sanitization middleware
app.use(sanitizeInput);

// Error handling middleware (должны быть перед маршрутами)
app.use(jsonErrorHandler);
app.use(validationErrorHandler);

// Static files
app.use(express.static(path.join(__dirname, '../')));

// Rate limiting for API routes
app.use('/api', apiLimiter);

// Metrics collection middleware
app.use(metricsMiddleware);

// Alert middleware
app.use(alertMiddleware);

// Health check endpoint
app.get('/api/health', health.check);

// API routes
app.use('/api/auth', require('../server/routes/auth'));
app.use('/api/users', require('../server/routes/users'));
app.use('/api/projects', require('../server/routes/projects'));
app.use('/api/investments', require('../server/routes/investments'));
app.use('/api/wallet', require('../server/routes/wallet'));
app.use('/api/transactions', require('../server/routes/transactions'));
app.use('/api/coupons', require('../server/routes/coupons'));
app.use('/api/monitoring', require('../server/routes/monitoring'));

// Swagger documentation
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(specs));

// Error metrics middleware
app.use(errorMetricsMiddleware);

// 404 handler
app.use(notFoundHandler);

// Централизованный обработчик ошибок (должен быть последним)
app.use(errorHandler);

// Export for Vercel
module.exports = app;
