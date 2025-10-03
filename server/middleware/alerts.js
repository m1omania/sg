const { logger, auditLog } = require('../config/logger');
const config = require('../config/environment');

// Alert types and thresholds
const ALERT_THRESHOLDS = {
  RESPONSE_TIME: 2000, // 2 seconds
  ERROR_RATE: 0.05, // 5%
  MEMORY_USAGE: 0.8, // 80%
  CPU_USAGE: 0.8, // 80%
  DATABASE_RESPONSE_TIME: 1000, // 1 second
  SLOW_QUERIES: 0.1, // 10%
  DISK_USAGE: 0.9 // 90%
};

// Alert severity levels
const ALERT_LEVELS = {
  INFO: 'info',
  WARNING: 'warning',
  ERROR: 'error',
  CRITICAL: 'critical'
};

// Alert storage (in production, this would be a database)
const alerts = new Map();
const alertHistory = [];

// Alert class
class Alert {
  constructor(type, level, message, details = {}) {
    this.id = this.generateId();
    this.type = type;
    this.level = level;
    this.message = message;
    this.details = details;
    this.timestamp = new Date().toISOString();
    this.acknowledged = false;
    this.resolved = false;
    this.resolvedAt = null;
  }

  generateId() {
    return `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  acknowledge() {
    this.acknowledged = true;
    this.acknowledgedAt = new Date().toISOString();
  }

  resolve() {
    this.resolved = true;
    this.resolvedAt = new Date().toISOString();
  }
}

// Alert manager class
class AlertManager {
  constructor() {
    this.thresholds = ALERT_THRESHOLDS;
    this.alertHistory = alertHistory;
    this.activeAlerts = alerts;
  }

  // Create a new alert
  createAlert(type, level, message, details = {}) {
    const alert = new Alert(type, level, message, details);
    
    // Store alert
    this.activeAlerts.set(alert.id, alert);
    this.alertHistory.push(alert);
    
    // Log alert
    logger.warn(`ALERT: ${level.toUpperCase()} - ${type}`, {
      alertId: alert.id,
      type,
      level,
      message,
      details,
      timestamp: alert.timestamp
    });
    
    // Audit log
    auditLog.systemEvent('alert_created', {
      alertId: alert.id,
      type,
      level,
      message,
      details
    });
    
    // Send notification (if configured)
    this.sendNotification(alert);
    
    return alert;
  }

  // Check if alert should be created (avoid duplicates)
  shouldCreateAlert(type, level, message) {
    const existingAlert = Array.from(this.activeAlerts.values())
      .find(alert => 
        alert.type === type && 
        alert.level === level && 
        alert.message === message &&
        !alert.resolved
      );
    
    return !existingAlert;
  }

  // Check response time
  checkResponseTime(avgResponseTime) {
    if (avgResponseTime > this.thresholds.RESPONSE_TIME) {
      const level = avgResponseTime > this.thresholds.RESPONSE_TIME * 2 ? 
        ALERT_LEVELS.CRITICAL : ALERT_LEVELS.WARNING;
      
      if (this.shouldCreateAlert('response_time', level, 'High response time detected')) {
        this.createAlert('response_time', level, 'High response time detected', {
          averageResponseTime: avgResponseTime,
          threshold: this.thresholds.RESPONSE_TIME
        });
      }
    }
  }

  // Check error rate
  checkErrorRate(errorRate) {
    if (errorRate > this.thresholds.ERROR_RATE) {
      const level = errorRate > this.thresholds.ERROR_RATE * 2 ? 
        ALERT_LEVELS.CRITICAL : ALERT_LEVELS.WARNING;
      
      if (this.shouldCreateAlert('error_rate', level, 'High error rate detected')) {
        this.createAlert('error_rate', level, 'High error rate detected', {
          errorRate: errorRate,
          threshold: this.thresholds.ERROR_RATE
        });
      }
    }
  }

  // Check memory usage
  checkMemoryUsage(memoryUsage) {
    const heapUsageRatio = memoryUsage.heapUsed / memoryUsage.heapTotal;
    
    if (heapUsageRatio > this.thresholds.MEMORY_USAGE) {
      const level = heapUsageRatio > 0.95 ? ALERT_LEVELS.CRITICAL : ALERT_LEVELS.WARNING;
      
      if (this.shouldCreateAlert('memory_usage', level, 'High memory usage detected')) {
        this.createAlert('memory_usage', level, 'High memory usage detected', {
          heapUsageRatio: heapUsageRatio,
          heapUsed: memoryUsage.heapUsed,
          heapTotal: memoryUsage.heapTotal,
          threshold: this.thresholds.MEMORY_USAGE
        });
      }
    }
  }

  // Check database performance
  checkDatabasePerformance(dbMetrics) {
    if (dbMetrics.averageQueryTime > this.thresholds.DATABASE_RESPONSE_TIME) {
      const level = dbMetrics.averageQueryTime > this.thresholds.DATABASE_RESPONSE_TIME * 2 ? 
        ALERT_LEVELS.CRITICAL : ALERT_LEVELS.WARNING;
      
      if (this.shouldCreateAlert('database_performance', level, 'Slow database queries detected')) {
        this.createAlert('database_performance', level, 'Slow database queries detected', {
          averageQueryTime: dbMetrics.averageQueryTime,
          slowQueries: dbMetrics.slowQueries,
          totalQueries: dbMetrics.queries,
          threshold: this.thresholds.DATABASE_RESPONSE_TIME
        });
      }
    }
  }

  // Check slow queries ratio
  checkSlowQueries(slowQueriesRatio) {
    if (slowQueriesRatio > this.thresholds.SLOW_QUERIES) {
      const level = slowQueriesRatio > this.thresholds.SLOW_QUERIES * 2 ? 
        ALERT_LEVELS.CRITICAL : ALERT_LEVELS.WARNING;
      
      if (this.shouldCreateAlert('slow_queries', level, 'High slow queries ratio detected')) {
        this.createAlert('slow_queries', level, 'High slow queries ratio detected', {
          slowQueriesRatio: slowQueriesRatio,
          threshold: this.thresholds.SLOW_QUERIES
        });
      }
    }
  }

  // Check disk usage
  checkDiskUsage(diskUsage) {
    if (diskUsage > this.thresholds.DISK_USAGE) {
      const level = diskUsage > 0.95 ? ALERT_LEVELS.CRITICAL : ALERT_LEVELS.WARNING;
      
      if (this.shouldCreateAlert('disk_usage', level, 'High disk usage detected')) {
        this.createAlert('disk_usage', level, 'High disk usage detected', {
          diskUsage: diskUsage,
          threshold: this.thresholds.DISK_USAGE
        });
      }
    }
  }

  // Send notification (placeholder for actual notification service)
  sendNotification(alert) {
    // In production, this would integrate with:
    // - Email services (SendGrid, AWS SES)
    // - SMS services (Twilio, AWS SNS)
    // - Slack/Discord webhooks
    // - PagerDuty for critical alerts
    
    logger.info(`Notification sent for alert ${alert.id}`, {
      alertId: alert.id,
      type: alert.type,
      level: alert.level,
      message: alert.message
    });
    
    // Example: Send to webhook
    if (config.ALERT_WEBHOOK_URL) {
      this.sendWebhookNotification(alert);
    }
  }

  // Send webhook notification
  async sendWebhookNotification(alert) {
    try {
      const fetch = require('node-fetch');
      
      const payload = {
        text: `🚨 ${alert.level.toUpperCase()} Alert: ${alert.message}`,
        attachments: [{
          color: this.getAlertColor(alert.level),
          fields: [
            { title: 'Type', value: alert.type, short: true },
            { title: 'Level', value: alert.level, short: true },
            { title: 'Time', value: alert.timestamp, short: true },
            { title: 'Details', value: JSON.stringify(alert.details, null, 2), short: false }
          ]
        }]
      };
      
      await fetch(config.ALERT_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
    } catch (error) {
      logger.error('Failed to send webhook notification:', error);
    }
  }

  // Get alert color for notifications
  getAlertColor(level) {
    const colors = {
      [ALERT_LEVELS.INFO]: '#36a64f',
      [ALERT_LEVELS.WARNING]: '#ff9800',
      [ALERT_LEVELS.ERROR]: '#f44336',
      [ALERT_LEVELS.CRITICAL]: '#d32f2f'
    };
    return colors[level] || '#757575';
  }

  // Get active alerts
  getActiveAlerts() {
    return Array.from(this.activeAlerts.values())
      .filter(alert => !alert.resolved)
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  }

  // Get alert history
  getAlertHistory(limit = 100) {
    return this.alertHistory
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, limit);
  }

  // Acknowledge alert
  acknowledgeAlert(alertId) {
    const alert = this.activeAlerts.get(alertId);
    if (alert) {
      alert.acknowledge();
      logger.info(`Alert ${alertId} acknowledged`);
      return true;
    }
    return false;
  }

  // Resolve alert
  resolveAlert(alertId) {
    const alert = this.activeAlerts.get(alertId);
    if (alert) {
      alert.resolve();
      this.activeAlerts.delete(alertId);
      logger.info(`Alert ${alertId} resolved`);
      return true;
    }
    return false;
  }

  // Auto-resolve alerts that are no longer relevant
  autoResolveAlerts(metrics) {
    const activeAlerts = this.getActiveAlerts();
    
    activeAlerts.forEach(alert => {
      let shouldResolve = false;
      
      switch (alert.type) {
        case 'response_time':
          shouldResolve = metrics.responseTime?.average < this.thresholds.RESPONSE_TIME;
          break;
        case 'error_rate':
          shouldResolve = metrics.errorRate < this.thresholds.ERROR_RATE;
          break;
        case 'memory_usage':
          const heapUsageRatio = metrics.memory?.heapUsed / metrics.memory?.heapTotal;
          shouldResolve = heapUsageRatio < this.thresholds.MEMORY_USAGE;
          break;
        case 'database_performance':
          shouldResolve = metrics.database?.averageQueryTime < this.thresholds.DATABASE_RESPONSE_TIME;
          break;
      }
      
      if (shouldResolve) {
        this.resolveAlert(alert.id);
      }
    });
  }
}

// Create global alert manager instance
const alertManager = new AlertManager();

// Middleware to check metrics and create alerts
const alertMiddleware = (req, res, next) => {
  // This middleware runs after metrics collection
  // It checks the current metrics and creates alerts if needed
  
  const metrics = global.metricsCollector?.getMetrics();
  if (metrics) {
    // Check response time
    if (metrics.responseTime?.average) {
      alertManager.checkResponseTime(metrics.responseTime.average);
    }
    
    // Check error rate
    if (metrics.requests?.total > 0) {
      const errorRate = metrics.requests.errors / metrics.requests.total;
      alertManager.checkErrorRate(errorRate);
    }
    
    // Check memory usage
    if (metrics.memory) {
      alertManager.checkMemoryUsage(metrics.memory);
    }
    
    // Check database performance
    if (metrics.database) {
      alertManager.checkDatabasePerformance(metrics.database);
      
      // Check slow queries ratio
      if (metrics.database.queries > 0) {
        const slowQueriesRatio = metrics.database.slowQueries / metrics.database.queries;
        alertManager.checkSlowQueries(slowQueriesRatio);
      }
    }
    
    // Auto-resolve alerts
    alertManager.autoResolveAlerts(metrics);
  }
  
  next();
};

module.exports = {
  alertManager,
  alertMiddleware,
  ALERT_LEVELS,
  ALERT_THRESHOLDS
};
