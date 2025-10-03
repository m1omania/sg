const winston = require('winston');
const DailyRotateFile = require('winston-daily-rotate-file');
const path = require('path');
const config = require('./environment');

// Создаем директорию для логов
const logDir = path.join(__dirname, '../logs');

// Формат логов
const logFormat = winston.format.combine(
  winston.format.timestamp({
    format: 'YYYY-MM-DD HH:mm:ss'
  }),
  winston.format.errors({ stack: true }),
  winston.format.json(),
  winston.format.printf(({ timestamp, level, message, stack, ...meta }) => {
    let log = `${timestamp} [${level.toUpperCase()}]: ${message}`;
    
    if (stack) {
      log += `\n${stack}`;
    }
    
    if (Object.keys(meta).length > 0) {
      log += `\n${JSON.stringify(meta, null, 2)}`;
    }
    
    return log;
  })
);

// Создаем логгер
const logger = winston.createLogger({
  level: config.LOG_LEVEL || 'info',
  format: logFormat,
  defaultMeta: { service: 'solar-group-api' },
  transports: [
    // Консольный вывод для development
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    })
  ],
  // Обработка необработанных исключений
  exceptionHandlers: [
    new winston.transports.File({ 
      filename: path.join(logDir, 'exceptions.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 5
    })
  ],
  // Обработка необработанных промисов
  rejectionHandlers: [
    new winston.transports.File({ 
      filename: path.join(logDir, 'rejections.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 5
    })
  ]
});

// Добавляем файловые транспорты только в production
if (config.NODE_ENV === 'production') {
  // Общие логи
  logger.add(new DailyRotateFile({
    filename: path.join(logDir, 'application-%DATE%.log'),
    datePattern: 'YYYY-MM-DD',
    maxSize: '20m',
    maxFiles: '14d',
    zippedArchive: true
  }));

  // Логи ошибок
  logger.add(new DailyRotateFile({
    filename: path.join(logDir, 'error-%DATE%.log'),
    datePattern: 'YYYY-MM-DD',
    level: 'error',
    maxSize: '20m',
    maxFiles: '30d',
    zippedArchive: true
  }));

  // Логи доступа
  logger.add(new DailyRotateFile({
    filename: path.join(logDir, 'access-%DATE%.log'),
    datePattern: 'YYYY-MM-DD',
    level: 'http',
    maxSize: '20m',
    maxFiles: '7d',
    zippedArchive: true
  }));
}

// Создаем отдельный логгер для HTTP запросов
const httpLogger = winston.createLogger({
  level: 'http',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: config.NODE_ENV === 'production' ? [
    new DailyRotateFile({
      filename: path.join(logDir, 'http-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: '7d',
      zippedArchive: true
    })
  ] : [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    })
  ]
});

// Создаем отдельный логгер для аудита
const auditLogger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: config.NODE_ENV === 'production' ? [
    new DailyRotateFile({
      filename: path.join(logDir, 'audit-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: '90d', // Аудит храним дольше
      zippedArchive: true
    })
  ] : [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    })
  ]
});

// Middleware для логирования HTTP запросов
const httpLoggingMiddleware = (req, res, next) => {
  const start = Date.now();
  
  // Логируем входящий запрос
  httpLogger.http('Incoming request', {
    method: req.method,
    url: req.url,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    timestamp: new Date().toISOString()
  });

  // Перехватываем ответ
  const originalSend = res.send;
  res.send = function(data) {
    const duration = Date.now() - start;
    
    // Логируем исходящий ответ
    httpLogger.http('Outgoing response', {
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
      timestamp: new Date().toISOString()
    });

    originalSend.call(this, data);
  };

  next();
};

// Функции для аудита
const auditLog = {
  userAction: (userId, action, details = {}) => {
    auditLogger.info('User action', {
      userId,
      action,
      details,
      timestamp: new Date().toISOString()
    });
  },

  securityEvent: (event, details = {}) => {
    auditLogger.warn('Security event', {
      event,
      details,
      timestamp: new Date().toISOString()
    });
  },

  systemEvent: (event, details = {}) => {
    auditLogger.info('System event', {
      event,
      details,
      timestamp: new Date().toISOString()
    });
  }
};

module.exports = {
  logger,
  httpLogger,
  auditLogger,
  httpLoggingMiddleware,
  auditLog
};
