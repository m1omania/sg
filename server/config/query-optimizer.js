const { logger } = require('./logger');

class QueryOptimizer {
  constructor() {
    this.queryCache = new Map();
    this.queryStats = new Map();
    this.slowQueryThreshold = 1000; // 1 second
    this.maxCacheSize = 1000;
  }

  /**
   * Кэширует результат запроса
   */
  cacheQuery(query, params, result, ttl = 300000) { // 5 minutes default TTL
    if (this.queryCache.size >= this.maxCacheSize) {
      // Удаляем самый старый элемент
      const firstKey = this.queryCache.keys().next().value;
      this.queryCache.delete(firstKey);
    }

    const key = this.getQueryKey(query, params);
    const cacheEntry = {
      result,
      timestamp: Date.now(),
      ttl
    };

    this.queryCache.set(key, cacheEntry);
  }

  /**
   * Получает результат из кэша
   */
  getCachedQuery(query, params) {
    const key = this.getQueryKey(query, params);
    const cacheEntry = this.queryCache.get(key);

    if (!cacheEntry) {
      return null;
    }

    // Проверяем TTL
    if (Date.now() - cacheEntry.timestamp > cacheEntry.ttl) {
      this.queryCache.delete(key);
      return null;
    }

    return cacheEntry.result;
  }

  /**
   * Генерирует ключ для кэша
   */
  getQueryKey(query, params) {
    return `${query}:${JSON.stringify(params || [])}`;
  }

  /**
   * Логирует статистику запроса
   */
  logQueryStats(query, params, duration, fromCache = false) {
    const key = this.getQueryKey(query, params);
    const stats = this.queryStats.get(key) || {
      count: 0,
      totalDuration: 0,
      avgDuration: 0,
      minDuration: Infinity,
      maxDuration: 0,
      cacheHits: 0
    };

    stats.count++;
    stats.totalDuration += duration;
    stats.avgDuration = stats.totalDuration / stats.count;
    stats.minDuration = Math.min(stats.minDuration, duration);
    stats.maxDuration = Math.max(stats.maxDuration, duration);

    if (fromCache) {
      stats.cacheHits++;
    }

    this.queryStats.set(key, stats);

    // Логируем медленные запросы
    if (duration > this.slowQueryThreshold) {
      logger.warn('Slow query detected', {
        query: query.substring(0, 100) + '...',
        duration: `${duration}ms`,
        params: params,
        fromCache
      });
    }
  }

  /**
   * Получает статистику запросов
   */
  getQueryStats() {
    const stats = Array.from(this.queryStats.entries()).map(([key, stat]) => ({
      query: key.split(':')[0],
      ...stat,
      cacheHitRate: stat.cacheHits / stat.count
    }));

    return stats.sort((a, b) => b.totalDuration - a.totalDuration);
  }

  /**
   * Очищает кэш
   */
  clearCache() {
    this.queryCache.clear();
    logger.info('Query cache cleared');
  }

  /**
   * Очищает статистику
   */
  clearStats() {
    this.queryStats.clear();
    logger.info('Query statistics cleared');
  }

  /**
   * Оптимизирует SELECT запрос
   */
  optimizeSelectQuery(query, params) {
    // Добавляем LIMIT если его нет и запрос может вернуть много данных
    if (!query.toLowerCase().includes('limit') && 
        !query.toLowerCase().includes('count(') &&
        !query.toLowerCase().includes('group by')) {
      query += ' LIMIT 1000';
    }

    // Добавляем ORDER BY для стабильности результатов
    if (!query.toLowerCase().includes('order by') && 
        query.toLowerCase().includes('select')) {
      // Пытаемся найти подходящее поле для сортировки
      const tableMatch = query.match(/from\s+(\w+)/i);
      if (tableMatch) {
        const table = tableMatch[1];
        if (table === 'users') {
          query += ' ORDER BY id DESC';
        } else if (table === 'transactions') {
          query += ' ORDER BY created_at DESC';
        } else if (table === 'investments') {
          query += ' ORDER BY created_at DESC';
        } else {
          query += ' ORDER BY id';
        }
      }
    }

    return query;
  }

  /**
   * Проверяет, можно ли кэшировать запрос
   */
  isCacheableQuery(query) {
    const lowerQuery = query.toLowerCase().trim();
    
    // Не кэшируем INSERT, UPDATE, DELETE
    if (lowerQuery.startsWith('insert') || 
        lowerQuery.startsWith('update') || 
        lowerQuery.startsWith('delete') ||
        lowerQuery.startsWith('create') ||
        lowerQuery.startsWith('drop') ||
        lowerQuery.startsWith('alter')) {
      return false;
    }

    // Кэшируем только SELECT запросы
    return lowerQuery.startsWith('select');
  }

  /**
   * Получает рекомендуемые индексы на основе статистики запросов
   */
  getRecommendedIndexes() {
    const stats = this.getQueryStats();
    const recommendations = [];

    stats.forEach(stat => {
      if (stat.avgDuration > 100) { // Запросы медленнее 100ms
        const query = stat.query;
        
        // Анализируем WHERE условия
        const whereMatch = query.match(/where\s+(.+?)(?:\s+order\s+by|\s+group\s+by|\s+limit|$)/i);
        if (whereMatch) {
          const whereClause = whereMatch[1];
          
          // Ищем поля в WHERE
          const fieldMatches = whereClause.match(/(\w+)\s*[=<>!]/g);
          if (fieldMatches) {
            fieldMatches.forEach(match => {
              const field = match.split(/\s*[=<>!]/)[0];
              recommendations.push({
                field,
                reason: `Frequently queried field in slow query (avg: ${stat.avgDuration}ms)`,
                query: query.substring(0, 100) + '...'
              });
            });
          }
        }

        // Анализируем ORDER BY
        const orderMatch = query.match(/order\s+by\s+(\w+)/i);
        if (orderMatch) {
          const field = orderMatch[1];
          recommendations.push({
            field,
            reason: `Frequently sorted field in slow query (avg: ${stat.avgDuration}ms)`,
            query: query.substring(0, 100) + '...'
          });
        }
      }
    });

    // Группируем рекомендации по полям
    const grouped = {};
    recommendations.forEach(rec => {
      if (!grouped[rec.field]) {
        grouped[rec.field] = [];
      }
      grouped[rec.field].push(rec);
    });

    return Object.entries(grouped).map(([field, reasons]) => ({
      field,
      reasons,
      priority: reasons.length
    })).sort((a, b) => b.priority - a.priority);
  }
}

module.exports = QueryOptimizer;
