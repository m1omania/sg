#!/usr/bin/env node

const MigrationManager = require('../config/migrations');
const { logger } = require('../config/logger');

async function main() {
  const command = process.argv[2];
  const migrationManager = new MigrationManager();

  try {
    switch (command) {
      case 'up':
      case 'migrate':
        console.log('Running migrations...');
        await migrationManager.runMigrations();
        console.log('✅ Migrations completed successfully');
        break;

      case 'status':
        console.log('Checking migration status...');
        const status = await migrationManager.status();
        console.log(`\n📊 Migration Status:`);
        console.log(`   Executed: ${status.executed}`);
        console.log(`   Total: ${status.total}`);
        console.log(`   Pending: ${status.pending}`);
        console.log(`\n📋 Migration Details:`);
        status.migrations.forEach(migration => {
          const status = migration.executed ? '✅' : '⏳';
          const date = migration.executedAt ? ` (${migration.executedAt})` : '';
          console.log(`   ${status} ${migration.version} - ${migration.filename}${date}`);
        });
        break;

      case 'validate':
        console.log('Validating migrations...');
        const validation = await migrationManager.validate();
        if (validation.isValid) {
          console.log('✅ All migrations are valid');
        } else {
          console.log('❌ Migration validation failed:');
          validation.issues.forEach(issue => console.log(`   - ${issue}`));
          process.exit(1);
        }
        break;

      case 'rollback':
        console.log('Rolling back last migration...');
        await migrationManager.rollbackLastMigration();
        console.log('⚠️  Rollback completed (manual verification may be required)');
        break;

      case 'help':
      default:
        console.log(`
🗄️  Database Migration Tool

Usage: node migrate.js <command>

Commands:
  up, migrate    Run all pending migrations
  status         Show migration status
  validate       Validate executed migrations
  rollback       Rollback last migration (if supported)
  help           Show this help message

Examples:
  node migrate.js up
  node migrate.js status
  node migrate.js validate
        `);
        break;
    }
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    logger.error('Migration CLI error:', error);
    process.exit(1);
  }
}

// Обработка сигналов завершения
process.on('SIGINT', () => {
  console.log('\n⚠️  Migration interrupted by user');
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
