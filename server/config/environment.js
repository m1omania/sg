// Environment configuration
module.exports = {
  // Server
  PORT: process.env.PORT || 3000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  
  // JWT
  JWT_SECRET: process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '24h',
  
  // Database
  DATABASE_URL: process.env.DATABASE_URL || 'sqlite:///tmp/database.sqlite',
  DATABASE_PATH: process.env.DATABASE_PATH || '/tmp/database.sqlite',
  
  // Database Performance
  QUERY_CACHE_SIZE: parseInt(process.env.QUERY_CACHE_SIZE || '1000', 10),
  QUERY_CACHE_TTL: parseInt(process.env.QUERY_CACHE_TTL || '300000', 10), // 5 minutes
  SLOW_QUERY_THRESHOLD: parseInt(process.env.SLOW_QUERY_THRESHOLD || '1000', 10), // 1 second
  
  // Backup Settings
  MAX_BACKUPS: parseInt(process.env.MAX_BACKUPS || '10', 10),
  BACKUP_INTERVAL: parseInt(process.env.BACKUP_INTERVAL || '86400000', 10), // 24 hours
  
  // CORS
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:3000',
  
  // Security
  BCRYPT_ROUNDS: parseInt(process.env.BCRYPT_ROUNDS) || 12,
  
  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 900000, // 15 minutes
  RATE_LIMIT_MAX_REQUESTS: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  AUTH_RATE_LIMIT_MAX_ATTEMPTS: parseInt(process.env.AUTH_RATE_LIMIT_MAX_ATTEMPTS) || 5,
  REGISTRATION_RATE_LIMIT_MAX_ATTEMPTS: parseInt(process.env.REGISTRATION_RATE_LIMIT_MAX_ATTEMPTS) || 3,
  
  // Validation
  MAX_BODY_SIZE: process.env.MAX_BODY_SIZE || '10mb',
  
  // Logging
  LOG_LEVEL: process.env.LOG_LEVEL || 'info'
};
