const { logger } = require('../config/logger');

// Global metrics storage
global.requestCount = 0;
global.errorCount = 0;
global.responseTimes = [];
global.averageResponseTime = 0;

// Metrics collection class
class MetricsCollector {
  constructor() {
    this.metrics = {
      requests: {
        total: 0,
        successful: 0,
        errors: 0,
        byMethod: {},
        byRoute: {},
        byStatus: {}
      },
      responseTime: {
        min: Infinity,
        max: 0,
        average: 0,
        p50: 0,
        p95: 0,
        p99: 0
      },
      errors: {
        byType: {},
        byRoute: {},
        total: 0
      },
      database: {
        queries: 0,
        slowQueries: 0,
        averageQueryTime: 0,
        byTable: {}
      },
      memory: {
        heapUsed: 0,
        heapTotal: 0,
        external: 0,
        rss: 0
      },
      uptime: 0
    };
    
    this.startTime = Date.now();
    this.updateInterval = null;
  }

  // Start metrics collection
  start() {
    // Update metrics every 30 seconds
    this.updateInterval = setInterval(() => {
      this.updateMetrics();
    }, 30000);
    
    logger.info('Metrics collection started');
  }

  // Stop metrics collection
  stop() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
    
    logger.info('Metrics collection stopped');
  }

  // Record request
  recordRequest(req, res, responseTime) {
    const method = req.method;
    const route = req.route?.path || req.path;
    const status = res.statusCode;
    
    // Update counters
    this.metrics.requests.total++;
    global.requestCount = this.metrics.requests.total;
    
    if (status >= 200 && status < 400) {
      this.metrics.requests.successful++;
    } else {
      this.metrics.requests.errors++;
      global.errorCount = this.metrics.requests.errors;
    }
    
    // Update by method
    this.metrics.requests.byMethod[method] = (this.metrics.requests.byMethod[method] || 0) + 1;
    
    // Update by route
    this.metrics.requests.byRoute[route] = (this.metrics.requests.byRoute[route] || 0) + 1;
    
    // Update by status
    this.metrics.requests.byStatus[status] = (this.metrics.requests.byStatus[status] || 0) + 1;
    
    // Update response time metrics
    this.updateResponseTimeMetrics(responseTime);
  }

  // Record error
  recordError(error, req) {
    const route = req.route?.path || req.path;
    const errorType = error.constructor.name;
    
    this.metrics.errors.total++;
    this.metrics.errors.byType[errorType] = (this.metrics.errors.byType[errorType] || 0) + 1;
    this.metrics.errors.byRoute[route] = (this.metrics.errors.byRoute[route] || 0) + 1;
    
    global.errorCount = this.metrics.errors.total;
  }

  // Record database query
  recordDatabaseQuery(table, queryTime) {
    this.metrics.database.queries++;
    
    if (queryTime > 1000) { // Slow query threshold
      this.metrics.database.slowQueries++;
    }
    
    this.metrics.database.byTable[table] = (this.metrics.database.byTable[table] || 0) + 1;
    
    // Update average query time
    const totalQueries = this.metrics.database.queries;
    const currentAverage = this.metrics.database.averageQueryTime;
    this.metrics.database.averageQueryTime = 
      (currentAverage * (totalQueries - 1) + queryTime) / totalQueries;
  }

  // Update response time metrics
  updateResponseTimeMetrics(responseTime) {
    // Add to response times array
    global.responseTimes.push(responseTime);
    
    // Keep only last 1000 response times
    if (global.responseTimes.length > 1000) {
      global.responseTimes.shift();
    }
    
    // Update min/max
    this.metrics.responseTime.min = Math.min(this.metrics.responseTime.min, responseTime);
    this.metrics.responseTime.max = Math.max(this.metrics.responseTime.max, responseTime);
    
    // Calculate average
    const total = global.responseTimes.reduce((sum, time) => sum + time, 0);
    this.metrics.responseTime.average = total / global.responseTimes.length;
    global.averageResponseTime = this.metrics.responseTime.average;
    
    // Calculate percentiles
    const sortedTimes = [...global.responseTimes].sort((a, b) => a - b);
    const len = sortedTimes.length;
    
    if (len > 0) {
      this.metrics.responseTime.p50 = sortedTimes[Math.floor(len * 0.5)];
      this.metrics.responseTime.p95 = sortedTimes[Math.floor(len * 0.95)];
      this.metrics.responseTime.p99 = sortedTimes[Math.floor(len * 0.99)];
    }
  }

  // Update system metrics
  updateMetrics() {
    const memoryUsage = process.memoryUsage();
    
    this.metrics.memory = {
      heapUsed: memoryUsage.heapUsed,
      heapTotal: memoryUsage.heapTotal,
      external: memoryUsage.external,
      rss: memoryUsage.rss
    };
    
    this.metrics.uptime = process.uptime();
  }

  // Get current metrics
  getMetrics() {
    this.updateMetrics();
    return { ...this.metrics };
  }

  // Get metrics summary
  getSummary() {
    const metrics = this.getMetrics();
    
    return {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: metrics.uptime,
      requests: {
        total: metrics.requests.total,
        successful: metrics.requests.successful,
        errors: metrics.requests.errors,
        successRate: metrics.requests.total > 0 ? 
          (metrics.requests.successful / metrics.requests.total * 100).toFixed(2) + '%' : '0%'
      },
      responseTime: {
        average: Math.round(metrics.responseTime.average) + 'ms',
        min: metrics.responseTime.min === Infinity ? 0 : Math.round(metrics.responseTime.min) + 'ms',
        max: Math.round(metrics.responseTime.max) + 'ms',
        p95: Math.round(metrics.responseTime.p95) + 'ms'
      },
      database: {
        queries: metrics.database.queries,
        slowQueries: metrics.database.slowQueries,
        averageQueryTime: Math.round(metrics.database.averageQueryTime) + 'ms'
      },
      memory: {
        heapUsed: Math.round(metrics.memory.heapUsed / 1024 / 1024) + 'MB',
        heapTotal: Math.round(metrics.memory.heapTotal / 1024 / 1024) + 'MB',
        rss: Math.round(metrics.memory.rss / 1024 / 1024) + 'MB'
      }
    };
  }

  // Reset metrics
  reset() {
    this.metrics = {
      requests: {
        total: 0,
        successful: 0,
        errors: 0,
        byMethod: {},
        byRoute: {},
        byStatus: {}
      },
      responseTime: {
        min: Infinity,
        max: 0,
        average: 0,
        p50: 0,
        p95: 0,
        p99: 0
      },
      errors: {
        byType: {},
        byRoute: {},
        total: 0
      },
      database: {
        queries: 0,
        slowQueries: 0,
        averageQueryTime: 0,
        byTable: {}
      },
      memory: {
        heapUsed: 0,
        heapTotal: 0,
        external: 0,
        rss: 0
      },
      uptime: 0
    };
    
    global.requestCount = 0;
    global.errorCount = 0;
    global.responseTimes = [];
    global.averageResponseTime = 0;
    
    logger.info('Metrics reset');
  }
}

// Create global metrics collector instance
const metricsCollector = new MetricsCollector();

// Middleware to collect request metrics
const metricsMiddleware = (req, res, next) => {
  const startTime = Date.now();
  
  // Override res.end to capture response time
  const originalEnd = res.end;
  res.end = function(...args) {
    const responseTime = Date.now() - startTime;
    metricsCollector.recordRequest(req, res, responseTime);
    originalEnd.apply(this, args);
  };
  
  next();
};

// Middleware to collect error metrics
const errorMetricsMiddleware = (err, req, res, next) => {
  metricsCollector.recordError(err, req);
  next(err);
};

// Start metrics collection
metricsCollector.start();

module.exports = {
  metricsCollector,
  metricsMiddleware,
  errorMetricsMiddleware
};
