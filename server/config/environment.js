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
  LOG_LEVEL: process.env.LOG_LEVEL || 'info',
  
  // Deployment
  DEPLOYMENT_ENV: process.env.DEPLOYMENT_ENV || 'development',
  CONTAINER_NAME: process.env.CONTAINER_NAME || 'solar-group-app',
  NAMESPACE: process.env.NAMESPACE || 'solar-group',
  
  // Monitoring
  ENABLE_MONITORING: process.env.ENABLE_MONITORING === 'true' || false,
  METRICS_PORT: parseInt(process.env.METRICS_PORT || '9090', 10),
  HEALTH_CHECK_INTERVAL: parseInt(process.env.HEALTH_CHECK_INTERVAL || '30000', 10), // 30 seconds
  
  // Alerting
  ALERT_WEBHOOK_URL: process.env.ALERT_WEBHOOK_URL || '',
  ALERT_EMAIL: process.env.ALERT_EMAIL || '',
  ALERT_SLACK_CHANNEL: process.env.ALERT_SLACK_CHANNEL || '#alerts',
  
  // Backup & Recovery
  BACKUP_S3_BUCKET: process.env.BACKUP_S3_BUCKET || '',
  BACKUP_S3_REGION: process.env.BACKUP_S3_REGION || 'us-east-1',
  BACKUP_RETENTION_DAYS: parseInt(process.env.BACKUP_RETENTION_DAYS || '30', 10),
  BACKUP_ENCRYPTION_KEY: process.env.BACKUP_ENCRYPTION_KEY || '',
  
  // Performance
  CLUSTER_MODE: process.env.CLUSTER_MODE === 'true' || false,
  CLUSTER_WORKERS: parseInt(process.env.CLUSTER_WORKERS || '0', 10), // 0 = auto-detect
  MEMORY_LIMIT: process.env.MEMORY_LIMIT || '512m',
  CPU_LIMIT: process.env.CPU_LIMIT || '500m',
  
  // Scaling
  MIN_REPLICAS: parseInt(process.env.MIN_REPLICAS || '1', 10),
  MAX_REPLICAS: parseInt(process.env.MAX_REPLICAS || '10', 10),
  TARGET_CPU_UTILIZATION: parseInt(process.env.TARGET_CPU_UTILIZATION || '70', 10),
  TARGET_MEMORY_UTILIZATION: parseInt(process.env.TARGET_MEMORY_UTILIZATION || '80', 10),
  
  // Security
  ENABLE_CORS: process.env.ENABLE_CORS !== 'false',
  CORS_ORIGINS: process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(',') : ['http://localhost:3000'],
  ENABLE_HTTPS: process.env.ENABLE_HTTPS === 'true' || false,
  SSL_CERT_PATH: process.env.SSL_CERT_PATH || '',
  SSL_KEY_PATH: process.env.SSL_KEY_PATH || '',
  
  // External Services
  REDIS_URL: process.env.REDIS_URL || '',
  ELASTICSEARCH_URL: process.env.ELASTICSEARCH_URL || '',
  PROMETHEUS_URL: process.env.PROMETHEUS_URL || 'http://localhost:9090',
  GRAFANA_URL: process.env.GRAFANA_URL || 'http://localhost:3001'
};
