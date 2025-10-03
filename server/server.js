const express = require('express');
const path = require('path');
const cors = require('cors');
const { dbGet } = require('./config/database');
const health = require('./health');
const config = require('./config/environment');
const { helmetConfig, securityLogger, bodySizeLimiter, contentTypeChecker, apiLimiter } = require('./middleware/security');
const { errorHandler, notFoundHandler, unhandledRejectionHandler, uncaughtExceptionHandler, validationErrorHandler, jsonErrorHandler } = require('./middleware/errorHandler');
const { logger, httpLoggingMiddleware, auditLog } = require('./config/logger');

const app = express();
const PORT = config.PORT;

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

// CORS configuration
app.use(cors({
  origin: config.FRONTEND_URL,
  credentials: true
}));

// Body parsing middleware с обработкой ошибок
app.use(express.json({ 
  limit: config.MAX_BODY_SIZE,
  verify: (req, res, buf) => {
    try {
      JSON.parse(buf);
    } catch (e) {
      throw new Error('Invalid JSON');
    }
  }
}));
app.use(express.urlencoded({ extended: true, limit: config.MAX_BODY_SIZE }));

// Обработка ошибок парсинга
app.use(jsonErrorHandler);
app.use(validationErrorHandler);

// Static files
app.use(express.static(path.join(__dirname, '../')));

// Rate limiting for API routes
app.use('/api', apiLimiter);

// Health check endpoint for Render
app.get('/health', health);

// API routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/coupons', require('./routes/coupons'));
app.use('/api/investments', require('./routes/investments'));
app.use('/api/wallet', require('./routes/wallet'));
app.use('/api/projects', require('./routes/projects'));
app.use('/api/transactions', require('./routes/transactions'));

// JWT auth check
async function isAuthenticated(req) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    // Fallback to cookie-based auth for backward compatibility
    const cookieHeader = req.headers.cookie || '';
    if (!cookieHeader) return false;
    const cookies = Object.fromEntries(
      cookieHeader
        .split(';')
        .map(c => c.trim())
        .filter(Boolean)
        .map(kv => {
          const i = kv.indexOf('=');
          if (i === -1) return [kv, ''];
          return [kv.slice(0, i), decodeURIComponent(kv.slice(i + 1))];
        })
    );
    return Boolean(cookies.auth || cookies.authToken);
  }

  try {
    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token, config.JWT_SECRET);
    
    // Проверяем, что пользователь все еще существует
    const userExists = await dbGet('SELECT id FROM users WHERE id = ?', [decoded.id]);
    return Boolean(userExists);
  } catch (err) {
    return false;
  }
}

// Serve frontend with auth gating
app.get('/', async (req, res) => {
  if (await isAuthenticated(req)) {
    return res.sendFile(path.join(__dirname, '../index.html'));
  }
  return res.sendFile(path.join(__dirname, '../landing.html'));
});

app.get('/index.html', async (req, res) => {
  if (!(await isAuthenticated(req))) {
    return res.redirect('/landing.html');
  }
  res.sendFile(path.join(__dirname, '../index.html'));
});

app.get('/coupons', (req, res) => {
  res.sendFile(path.join(__dirname, '../coupons.html'));
});

app.get('/wallet', (req, res) => {
  res.sendFile(path.join(__dirname, '../wallet.html'));
});

app.get('/invest', (req, res) => {
  res.sendFile(path.join(__dirname, '../invest.html'));
});

// Новая страница регистрации
app.get('/register', (req, res) => {
  res.sendFile(path.join(__dirname, '../register.html'));
});

// Новая страница пополнения счета
app.get('/deposit', (req, res) => {
  res.sendFile(path.join(__dirname, '../deposit.html'));
});

// Новая страница проектов
app.get('/projects', (req, res) => {
  res.sendFile(path.join(__dirname, '../projects.html'));
});

// Новая страница моих инвестиций
app.get('/my-investments', (req, res) => {
  res.sendFile(path.join(__dirname, '../my-investments.html'));
});

// Страница купонов и промокодов
app.get('/coupons.html', (req, res) => {
  res.sendFile(path.join(__dirname, '../coupons.html'));
});

// Страница пакетов
app.get('/packages', (req, res) => {
  res.sendFile(path.join(__dirname, '../packages.html'));
});

// Страница оформления пакета
app.get('/checkout', (req, res) => {
  res.sendFile(path.join(__dirname, '../checkout.html'));
});

// Обработка 404 ошибок
app.use(notFoundHandler);

// Централизованный обработчик ошибок (должен быть последним)
app.use(errorHandler);

app.listen(PORT, () => {
  logger.info(`Server is running on port ${PORT}`, {
    environment: config.NODE_ENV,
    port: PORT,
    timestamp: new Date().toISOString()
  });
  
  auditLog.systemEvent('server_started', {
    port: PORT,
    environment: config.NODE_ENV
  });
});