const express = require('express');
const { dbGet, db } = require('../config/database');
const { logger } = require('../config/logger');
const config = require('../config/environment');

const router = express.Router();

// Health check data
let healthData = {
  status: 'healthy',
  timestamp: new Date().toISOString(),
  uptime: process.uptime(),
  version: process.env.npm_package_version || '1.0.0',
  environment: config.NODE_ENV,
  checks: {}
};

// Update health data
const updateHealthData = async () => {
  try {
    const checks = {};
    
    // Database check
    try {
      const startTime = Date.now();
      await dbGet('SELECT 1 as test');
      const dbResponseTime = Date.now() - startTime;
      
      checks.database = {
        status: 'healthy',
        responseTime: `${dbResponseTime}ms`,
        lastChecked: new Date().toISOString()
      };
    } catch (error) {
      checks.database = {
        status: 'unhealthy',
        error: error.message,
        lastChecked: new Date().toISOString()
      };
    }
    
    // Memory check
    const memoryUsage = process.memoryUsage();
    const memoryUsageMB = {
      rss: Math.round(memoryUsage.rss / 1024 / 1024),
      heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024),
      heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024),
      external: Math.round(memoryUsage.external / 1024 / 1024)
    };
    
    checks.memory = {
      status: memoryUsageMB.heapUsed < 500 ? 'healthy' : 'warning',
      usage: memoryUsageMB,
      lastChecked: new Date().toISOString()
    };
    
    // CPU check
    const cpuUsage = process.cpuUsage();
    checks.cpu = {
      status: 'healthy',
      usage: {
        user: cpuUsage.user,
        system: cpuUsage.system
      },
      lastChecked: new Date().toISOString()
    };
    
    // Disk space check (if available)
    try {
      const fs = require('fs');
      const stats = fs.statSync(config.DATABASE_PATH);
      const diskUsage = {
        size: stats.size,
        sizeMB: Math.round(stats.size / 1024 / 1024)
      };
      
      checks.disk = {
        status: diskUsage.sizeMB < 1000 ? 'healthy' : 'warning',
        usage: diskUsage,
        lastChecked: new Date().toISOString()
      };
    } catch (error) {
      checks.disk = {
        status: 'unknown',
        error: error.message,
        lastChecked: new Date().toISOString()
      };
    }
    
    // Update health data
    healthData = {
      ...healthData,
      status: Object.values(checks).every(check => check.status === 'healthy') ? 'healthy' : 'degraded',
      checks,
      lastUpdated: new Date().toISOString()
    };
    
  } catch (error) {
    logger.error('Health check update failed:', error);
    healthData = {
      ...healthData,
      status: 'unhealthy',
      error: error.message,
      lastUpdated: new Date().toISOString()
    };
  }
};

// Update health data every 30 seconds
setInterval(updateHealthData, 30000);

// Initial health check
updateHealthData();

// Health check endpoint
router.get('/', async (req, res) => {
  try {
    // Update health data before responding
    await updateHealthData();
    
    const statusCode = healthData.status === 'healthy' ? 200 : 
                      healthData.status === 'degraded' ? 200 : 503;
    
    res.status(statusCode).json({
      ...healthData,
      requestId: req.headers['x-request-id'] || 'unknown'
    });
  } catch (error) {
    logger.error('Health check endpoint error:', error);
    res.status(503).json({
      status: 'unhealthy',
      error: 'Health check failed',
      timestamp: new Date().toISOString()
    });
  }
});

// Detailed health check
router.get('/detailed', async (req, res) => {
  try {
    await updateHealthData();
    
    const detailedChecks = { ...healthData.checks };
    
    // Add more detailed checks
    try {
      // Database connection pool info
      detailedChecks.database.connectionCount = 1; // SQLite doesn't have connection pooling
      
      // Query performance test
      const startTime = Date.now();
      await dbGet('SELECT COUNT(*) as count FROM users');
      const queryTime = Date.now() - startTime;
      
      detailedChecks.database.queryPerformance = {
        testQuery: 'SELECT COUNT(*) FROM users',
        responseTime: `${queryTime}ms`,
        status: queryTime < 100 ? 'good' : queryTime < 500 ? 'acceptable' : 'slow'
      };
    } catch (error) {
      detailedChecks.database.queryPerformance = {
        status: 'failed',
        error: error.message
      };
    }
    
    // System information
    const systemInfo = {
      nodeVersion: process.version,
      platform: process.platform,
      arch: process.arch,
      pid: process.pid,
      uptime: process.uptime(),
      memoryUsage: process.memoryUsage(),
      cpuUsage: process.cpuUsage(),
      loadAverage: require('os').loadavg(),
      freeMemory: require('os').freemem(),
      totalMemory: require('os').totalmem()
    };
    
    res.json({
      ...healthData,
      checks: detailedChecks,
      system: systemInfo,
      requestId: req.headers['x-request-id'] || 'unknown'
    });
  } catch (error) {
    logger.error('Detailed health check error:', error);
    res.status(500).json({
      status: 'error',
      error: 'Detailed health check failed',
      timestamp: new Date().toISOString()
    });
  }
});

// Readiness check
router.get('/ready', async (req, res) => {
  try {
    // Check if the application is ready to serve requests
    const isReady = healthData.status === 'healthy' || healthData.status === 'degraded';
    
    if (isReady) {
      res.status(200).json({
        status: 'ready',
        timestamp: new Date().toISOString()
      });
    } else {
      res.status(503).json({
        status: 'not ready',
        reason: healthData.error || 'Application not ready',
        timestamp: new Date().toISOString()
      });
    }
  } catch (error) {
    logger.error('Readiness check error:', error);
    res.status(503).json({
      status: 'not ready',
      error: 'Readiness check failed',
      timestamp: new Date().toISOString()
    });
  }
});

// Liveness check
router.get('/live', (req, res) => {
  // Simple liveness check - if the process is running, it's alive
  res.status(200).json({
    status: 'alive',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Metrics endpoint
router.get('/metrics', async (req, res) => {
  try {
    const metrics = {
      // System metrics
      system: {
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        cpu: process.cpuUsage(),
        loadAverage: require('os').loadavg()
      },
      
      // Application metrics
      application: {
        version: process.env.npm_package_version || '1.0.0',
        environment: config.NODE_ENV,
        nodeVersion: process.version,
        platform: process.platform
      },
      
      // Database metrics
      database: {
        status: healthData.checks.database?.status || 'unknown',
        responseTime: healthData.checks.database?.responseTime || 'unknown'
      },
      
      // Request metrics (if available)
      requests: {
        total: global.requestCount || 0,
        errors: global.errorCount || 0,
        averageResponseTime: global.averageResponseTime || 0
      }
    };
    
    res.json(metrics);
  } catch (error) {
    logger.error('Metrics endpoint error:', error);
    res.status(500).json({
      error: 'Failed to retrieve metrics',
      timestamp: new Date().toISOString()
    });
  }
});

module.exports = router;
