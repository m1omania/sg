const express = require('express');
const { metricsCollector } = require('../middleware/metrics');
const { alertManager } = require('../middleware/alerts');
const { logger } = require('../config/logger');

const router = express.Router();

// Get current metrics
router.get('/metrics', (req, res) => {
  try {
    const metrics = metricsCollector.getMetrics();
    res.json({
      status: 'success',
      data: metrics,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Failed to get metrics:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to retrieve metrics',
      timestamp: new Date().toISOString()
    });
  }
});

// Get metrics summary
router.get('/metrics/summary', (req, res) => {
  try {
    const summary = metricsCollector.getSummary();
    res.json({
      status: 'success',
      data: summary,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Failed to get metrics summary:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to retrieve metrics summary',
      timestamp: new Date().toISOString()
    });
  }
});

// Get active alerts
router.get('/alerts', (req, res) => {
  try {
    const alerts = alertManager.getActiveAlerts();
    res.json({
      status: 'success',
      data: {
        alerts,
        count: alerts.length
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Failed to get alerts:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to retrieve alerts',
      timestamp: new Date().toISOString()
    });
  }
});

// Get alert history
router.get('/alerts/history', (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 100;
    const alerts = alertManager.getAlertHistory(limit);
    
    res.json({
      status: 'success',
      data: {
        alerts,
        count: alerts.length
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Failed to get alert history:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to retrieve alert history',
      timestamp: new Date().toISOString()
    });
  }
});

// Acknowledge alert
router.post('/alerts/:alertId/acknowledge', (req, res) => {
  try {
    const { alertId } = req.params;
    const success = alertManager.acknowledgeAlert(alertId);
    
    if (success) {
      res.json({
        status: 'success',
        message: 'Alert acknowledged successfully',
        timestamp: new Date().toISOString()
      });
    } else {
      res.status(404).json({
        status: 'error',
        message: 'Alert not found',
        timestamp: new Date().toISOString()
      });
    }
  } catch (error) {
    logger.error('Failed to acknowledge alert:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to acknowledge alert',
      timestamp: new Date().toISOString()
    });
  }
});

// Resolve alert
router.post('/alerts/:alertId/resolve', (req, res) => {
  try {
    const { alertId } = req.params;
    const success = alertManager.resolveAlert(alertId);
    
    if (success) {
      res.json({
        status: 'success',
        message: 'Alert resolved successfully',
        timestamp: new Date().toISOString()
      });
    } else {
      res.status(404).json({
        status: 'error',
        message: 'Alert not found',
        timestamp: new Date().toISOString()
      });
    }
  } catch (error) {
    logger.error('Failed to resolve alert:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to resolve alert',
      timestamp: new Date().toISOString()
    });
  }
});

// Get system information
router.get('/system', (req, res) => {
  try {
    const os = require('os');
    const process = require('process');
    
    const systemInfo = {
      platform: os.platform(),
      arch: os.arch(),
      nodeVersion: process.version,
      uptime: process.uptime(),
      memory: {
        total: os.totalmem(),
        free: os.freemem(),
        used: os.totalmem() - os.freemem(),
        usage: ((os.totalmem() - os.freemem()) / os.totalmem() * 100).toFixed(2) + '%'
      },
      cpu: {
        cores: os.cpus().length,
        model: os.cpus()[0]?.model || 'Unknown',
        loadAverage: os.loadavg()
      },
      network: {
        interfaces: Object.keys(os.networkInterfaces()).length
      }
    };
    
    res.json({
      status: 'success',
      data: systemInfo,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Failed to get system information:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to retrieve system information',
      timestamp: new Date().toISOString()
    });
  }
});

// Get performance trends
router.get('/trends', (req, res) => {
  try {
    const hours = parseInt(req.query.hours) || 24;
    const now = new Date();
    const startTime = new Date(now.getTime() - hours * 60 * 60 * 1000);
    
    // This is a simplified version - in production, you'd query a time-series database
    const trends = {
      responseTime: {
        current: metricsCollector.getMetrics().responseTime.average,
        trend: 'stable', // Would be calculated from historical data
        change: 0 // Percentage change
      },
      errorRate: {
        current: metricsCollector.getMetrics().requests.errors / 
                Math.max(metricsCollector.getMetrics().requests.total, 1),
        trend: 'stable',
        change: 0
      },
      memoryUsage: {
        current: process.memoryUsage().heapUsed / process.memoryUsage().heapTotal,
        trend: 'stable',
        change: 0
      },
      requestVolume: {
        current: metricsCollector.getMetrics().requests.total,
        trend: 'stable',
        change: 0
      }
    };
    
    res.json({
      status: 'success',
      data: {
        trends,
        period: `${hours} hours`,
        startTime: startTime.toISOString(),
        endTime: now.toISOString()
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Failed to get performance trends:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to retrieve performance trends',
      timestamp: new Date().toISOString()
    });
  }
});

// Reset metrics
router.post('/metrics/reset', (req, res) => {
  try {
    metricsCollector.reset();
    
    res.json({
      status: 'success',
      message: 'Metrics reset successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Failed to reset metrics:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to reset metrics',
      timestamp: new Date().toISOString()
    });
  }
});

// Get monitoring dashboard data
router.get('/dashboard', (req, res) => {
  try {
    const metrics = metricsCollector.getMetrics();
    const summary = metricsCollector.getSummary();
    const alerts = alertManager.getActiveAlerts();
    const systemInfo = {
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      cpu: process.cpuUsage()
    };
    
    const dashboard = {
      overview: {
        status: alerts.length === 0 ? 'healthy' : 'degraded',
        uptime: systemInfo.uptime,
        requests: summary.requests,
        responseTime: summary.responseTime,
        memory: summary.memory,
        alerts: alerts.length
      },
      metrics: {
        requests: metrics.requests,
        responseTime: metrics.responseTime,
        errors: metrics.errors,
        database: metrics.database
      },
      alerts: alerts.slice(0, 10), // Last 10 alerts
      system: systemInfo
    };
    
    res.json({
      status: 'success',
      data: dashboard,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Failed to get dashboard data:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to retrieve dashboard data',
      timestamp: new Date().toISOString()
    });
  }
});

// Export metrics in Prometheus format
router.get('/metrics/prometheus', (req, res) => {
  try {
    const metrics = metricsCollector.getMetrics();
    
    let prometheusMetrics = '';
    
    // Add request metrics
    prometheusMetrics += `# HELP http_requests_total Total number of HTTP requests\n`;
    prometheusMetrics += `# TYPE http_requests_total counter\n`;
    prometheusMetrics += `http_requests_total{method="total"} ${metrics.requests.total}\n`;
    prometheusMetrics += `http_requests_total{method="successful"} ${metrics.requests.successful}\n`;
    prometheusMetrics += `http_requests_total{method="errors"} ${metrics.requests.errors}\n`;
    
    // Add response time metrics
    prometheusMetrics += `# HELP http_request_duration_seconds HTTP request duration in seconds\n`;
    prometheusMetrics += `# TYPE http_request_duration_seconds histogram\n`;
    prometheusMetrics += `http_request_duration_seconds{quantile="0.5"} ${metrics.responseTime.p50 / 1000}\n`;
    prometheusMetrics += `http_request_duration_seconds{quantile="0.95"} ${metrics.responseTime.p95 / 1000}\n`;
    prometheusMetrics += `http_request_duration_seconds{quantile="0.99"} ${metrics.responseTime.p99 / 1000}\n`;
    prometheusMetrics += `http_request_duration_seconds_sum ${metrics.responseTime.average * metrics.requests.total / 1000}\n`;
    prometheusMetrics += `http_request_duration_seconds_count ${metrics.requests.total}\n`;
    
    // Add memory metrics
    prometheusMetrics += `# HELP nodejs_memory_usage_bytes Memory usage in bytes\n`;
    prometheusMetrics += `# TYPE nodejs_memory_usage_bytes gauge\n`;
    prometheusMetrics += `nodejs_memory_usage_bytes{type="heapUsed"} ${metrics.memory.heapUsed}\n`;
    prometheusMetrics += `nodejs_memory_usage_bytes{type="heapTotal"} ${metrics.memory.heapTotal}\n`;
    prometheusMetrics += `nodejs_memory_usage_bytes{type="rss"} ${metrics.memory.rss}\n`;
    
    // Add database metrics
    prometheusMetrics += `# HELP database_queries_total Total number of database queries\n`;
    prometheusMetrics += `# TYPE database_queries_total counter\n`;
    prometheusMetrics += `database_queries_total ${metrics.database.queries}\n`;
    prometheusMetrics += `database_slow_queries_total ${metrics.database.slowQueries}\n`;
    
    res.set('Content-Type', 'text/plain');
    res.send(prometheusMetrics);
  } catch (error) {
    logger.error('Failed to export Prometheus metrics:', error);
    res.status(500).send('# Error generating Prometheus metrics\n');
  }
});

module.exports = router;
