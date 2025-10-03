#!/usr/bin/env node

const { queryOptimizer } = require('../config/database');
const { logger } = require('../config/logger');

async function main() {
  const command = process.argv[2];

  try {
    switch (command) {
      case 'stats':
        console.log('📊 Database Query Statistics\n');
        const stats = queryOptimizer.getQueryStats();
        
        if (stats.length === 0) {
          console.log('No query statistics available yet');
          return;
        }

        console.log('Top 10 Slowest Queries:');
        stats.slice(0, 10).forEach((stat, index) => {
          const query = stat.query.substring(0, 80) + (stat.query.length > 80 ? '...' : '');
          console.log(`\n${index + 1}. ${query}`);
          console.log(`   Count: ${stat.count}`);
          console.log(`   Avg Duration: ${stat.avgDuration.toFixed(2)}ms`);
          console.log(`   Min Duration: ${stat.minDuration}ms`);
          console.log(`   Max Duration: ${stat.maxDuration}ms`);
          console.log(`   Cache Hit Rate: ${(stat.cacheHitRate * 100).toFixed(1)}%`);
        });
        break;

      case 'recommendations':
        console.log('🔍 Index Recommendations\n');
        const recommendations = queryOptimizer.getRecommendedIndexes();
        
        if (recommendations.length === 0) {
          console.log('No index recommendations at this time');
          return;
        }

        recommendations.forEach((rec, index) => {
          console.log(`${index + 1}. Field: ${rec.field}`);
          console.log(`   Priority: ${rec.priority}`);
          console.log(`   Reasons:`);
          rec.reasons.forEach(reason => {
            console.log(`     - ${reason.reason}`);
            console.log(`       Query: ${reason.query}`);
          });
          console.log('');
        });
        break;

      case 'cache':
        console.log('💾 Query Cache Status\n');
        const cacheStats = queryOptimizer.queryCache.size;
        const maxCache = queryOptimizer.maxCacheSize;
        console.log(`Cache Usage: ${cacheStats}/${maxCache} (${((cacheStats/maxCache)*100).toFixed(1)}%)`);
        
        if (cacheStats > 0) {
          console.log('\nCached Queries:');
          let count = 0;
          for (const [key, entry] of queryOptimizer.queryCache) {
            if (count >= 10) {
              console.log(`... and ${cacheStats - 10} more`);
              break;
            }
            const age = ((Date.now() - entry.timestamp) / 1000).toFixed(0);
            console.log(`  ${key.split(':')[0].substring(0, 50)}... (age: ${age}s)`);
            count++;
          }
        }
        break;

      case 'clear-cache':
        console.log('Clearing query cache...');
        queryOptimizer.clearCache();
        console.log('✅ Query cache cleared');
        break;

      case 'clear-stats':
        console.log('Clearing query statistics...');
        queryOptimizer.clearStats();
        console.log('✅ Query statistics cleared');
        break;

      case 'monitor':
        console.log('🔍 Starting real-time monitoring...');
        console.log('Press Ctrl+C to stop\n');
        
        const monitorInterval = setInterval(() => {
          const stats = queryOptimizer.getQueryStats();
          const recentStats = stats.filter(stat => stat.count > 0);
          
          if (recentStats.length > 0) {
            const avgDuration = recentStats.reduce((sum, stat) => sum + stat.avgDuration, 0) / recentStats.length;
            const totalQueries = recentStats.reduce((sum, stat) => sum + stat.count, 0);
            const cacheHits = recentStats.reduce((sum, stat) => sum + stat.cacheHits, 0);
            const cacheHitRate = totalQueries > 0 ? (cacheHits / totalQueries) * 100 : 0;
            
            console.log(`[${new Date().toLocaleTimeString()}] Queries: ${totalQueries} | Avg: ${avgDuration.toFixed(1)}ms | Cache: ${cacheHitRate.toFixed(1)}%`);
          }
        }, 5000);

        process.on('SIGINT', () => {
          clearInterval(monitorInterval);
          console.log('\n⚠️  Monitoring stopped');
          process.exit(0);
        });
        break;

      case 'help':
      default:
        console.log(`
🗄️  Database Performance Monitor

Usage: node db-monitor.js <command>

Commands:
  stats              Show query performance statistics
  recommendations    Show index recommendations
  cache              Show query cache status
  clear-cache        Clear query cache
  clear-stats        Clear query statistics
  monitor            Start real-time monitoring
  help               Show this help message

Examples:
  node db-monitor.js stats
  node db-monitor.js recommendations
  node db-monitor.js cache
  node db-monitor.js monitor
        `);
        break;
    }
  } catch (error) {
    console.error('❌ Monitor operation failed:', error.message);
    logger.error('DB Monitor CLI error:', error);
    process.exit(1);
  }
}

// Обработка сигналов завершения
process.on('SIGINT', () => {
  console.log('\n⚠️  Operation interrupted by user');
  process.exit(0);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

if (require.main === module) {
  main();
}

module.exports = { main };
