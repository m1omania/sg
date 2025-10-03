# Database Management Guide

## Overview

This document describes the database management features implemented in the SolarGroup platform, including migrations, backups, performance monitoring, and optimization.

## Features

### 1. Database Migrations

The migration system allows you to version control your database schema and apply changes incrementally.

#### Migration Files

Migrations are stored in `server/migrations/` directory:
- `001_add_indexes.sql` - Adds performance indexes
- `002_add_constraints.sql` - Adds foreign key constraints and check constraints
- `003_add_views.sql` - Creates database views for common queries

#### Migration Commands

```bash
# Run all pending migrations
npm run migrate:up

# Check migration status
npm run migrate:status

# Validate executed migrations
npm run migrate:validate
```

#### Manual Migration Commands

```bash
# Using the migration script directly
node scripts/migrate.js up
node scripts/migrate.js status
node scripts/migrate.js validate
```

### 2. Database Backups

Automated backup system with compression and cleanup.

#### Backup Commands

```bash
# Create a new backup
npm run backup:create

# List available backups
npm run backup:list

# Restore from backup
npm run backup:restore backup-2025-01-03T10-30-00-000Z.sqlite.gz

# Clean up old backups
npm run backup:cleanup

# Export to SQL format
npm run backup:export

# Check database integrity
npm run backup:check

# Optimize database
npm run backup:optimize
```

#### Auto Backup

The system can automatically create backups at regular intervals:

```bash
# Start auto backup service
node scripts/backup.js auto
```

### 3. Performance Monitoring

Real-time monitoring of database performance with query optimization.

#### Monitoring Commands

```bash
# Show query statistics
npm run db:stats

# Show index recommendations
npm run db:recommendations

# Show cache status
npm run db:cache

# Start real-time monitoring
npm run db:monitor
```

#### Query Optimization Features

- **Query Caching**: Frequently used SELECT queries are cached
- **Performance Logging**: All queries are logged with execution time
- **Slow Query Detection**: Queries taking longer than 1 second are flagged
- **Index Recommendations**: System suggests indexes based on query patterns
- **Query Statistics**: Detailed statistics for all executed queries

### 4. Database Views

Pre-built views for common queries:

- `user_wallet_summary` - User wallet information
- `active_user_coupons` - User's active coupons
- `user_investment_summary` - User investment statistics
- `project_statistics` - Project performance metrics
- `transaction_summary` - Transaction statistics
- `user_activity_summary` - Comprehensive user activity data

### 5. Indexes

Performance indexes added for frequently queried columns:

#### User Table Indexes
- `idx_users_email` - Email lookups
- `idx_users_username` - Username lookups
- `idx_users_created_at` - Registration date sorting

#### Coupon Table Indexes
- `idx_coupons_code` - Coupon code lookups
- `idx_coupons_status` - Status filtering
- `idx_coupons_project` - Project filtering
- `idx_coupons_expiry_date` - Expiry date sorting

#### Investment Table Indexes
- `idx_investments_user_id` - User investment lookups
- `idx_investments_project_id` - Project investment lookups
- `idx_investments_status` - Status filtering
- `idx_investments_user_status` - Combined user and status filtering

#### Transaction Table Indexes
- `idx_transactions_user_id` - User transaction lookups
- `idx_transactions_type` - Transaction type filtering
- `idx_transactions_status` - Status filtering
- `idx_transactions_created_at` - Date sorting

## Configuration

### Environment Variables

```bash
# Database Path
DATABASE_PATH=/tmp/database.sqlite

# Query Cache Settings
QUERY_CACHE_SIZE=1000
QUERY_CACHE_TTL=300000  # 5 minutes

# Performance Monitoring
SLOW_QUERY_THRESHOLD=1000  # 1 second

# Backup Settings
MAX_BACKUPS=10
BACKUP_INTERVAL=86400000  # 24 hours
```

## Best Practices

### 1. Regular Maintenance

```bash
# Weekly maintenance routine
npm run backup:create
npm run backup:cleanup
npm run backup:optimize
npm run db:stats
```

### 2. Performance Monitoring

- Monitor slow queries regularly
- Review index recommendations
- Check cache hit rates
- Optimize database when needed

### 3. Backup Strategy

- Create daily backups in production
- Test restore procedures regularly
- Keep multiple backup copies
- Monitor backup integrity

### 4. Migration Management

- Always test migrations in development first
- Create rollback plans for complex migrations
- Document migration purposes
- Validate migrations after execution

## Troubleshooting

### Common Issues

1. **Migration Fails**
   - Check database permissions
   - Verify migration file syntax
   - Review error logs

2. **Backup Fails**
   - Ensure sufficient disk space
   - Check file permissions
   - Verify database is not locked

3. **Performance Issues**
   - Check slow query logs
   - Review index recommendations
   - Consider query optimization

4. **Cache Issues**
   - Clear cache if data seems stale
   - Adjust cache TTL settings
   - Monitor cache hit rates

### Logs

All database operations are logged:
- Migration logs: Check application logs
- Backup logs: Check application logs
- Performance logs: Use `npm run db:stats`
- Error logs: Check application error logs

## Security Considerations

- Database files should have restricted permissions
- Backup files should be encrypted in production
- Access to database tools should be limited
- Regular security audits of database access

## Production Deployment

1. Set up automated backups
2. Configure monitoring alerts
3. Set appropriate cache sizes
4. Enable foreign key constraints
5. Regular performance reviews
6. Disaster recovery testing
