const jwt = require('jsonwebtoken');
const { dbGet } = require('../config/database');
const config = require('../config/environment');

const JWT_SECRET = config.JWT_SECRET;
const JWT_EXPIRES_IN = config.JWT_EXPIRES_IN;

/**
 * Middleware для проверки JWT токена
 */
const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ 
      error: 'Access token required',
      code: 'MISSING_TOKEN'
    });
  }

  try {
    const user = jwt.verify(token, JWT_SECRET);
    
    // Проверяем, что пользователь все еще существует
    const userExists = await dbGet('SELECT id, username, email FROM users WHERE id = ?', [user.id]);
    if (!userExists) {
      return res.status(403).json({ 
        error: 'User not found',
        code: 'USER_NOT_FOUND'
      });
    }
    
    req.user = userExists;
    next();
  } catch (err) {
    return res.status(403).json({ 
      error: 'Invalid or expired token',
      code: 'INVALID_TOKEN'
    });
  }
};

/**
 * Middleware для проверки прав администратора
 */
const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ 
      error: 'Admin access required',
      code: 'ADMIN_REQUIRED'
    });
  }
  next();
};

/**
 * Генерация JWT токена
 */
const generateToken = (user) => {
  return jwt.sign(
    { 
      id: user.id, 
      email: user.email,
      username: user.username 
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
};

/**
 * Middleware для опциональной аутентификации (не блокирует запрос)
 */
const optionalAuth = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    req.user = null;
    return next();
  }

  try {
    const user = jwt.verify(token, JWT_SECRET);
    const userExists = await dbGet('SELECT id, username, email FROM users WHERE id = ?', [user.id]);
    req.user = userExists || null;
  } catch (err) {
    req.user = null;
  }
  next();
};

module.exports = {
  authenticateToken,
  requireAdmin,
  generateToken,
  optionalAuth,
  JWT_SECRET,
  JWT_EXPIRES_IN
};
