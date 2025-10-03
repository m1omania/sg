#!/usr/bin/env node

const DatabaseBackup = require('../config/backup');
const { logger } = require('../config/logger');

async function main() {
  const command = process.argv[2];
  const backupManager = new DatabaseBackup();

  try {
    switch (command) {
      case 'create':
        console.log('Creating database backup...');
        const backupPath = await backupManager.createBackup();
        console.log(`✅ Backup created: ${backupPath}`);
        break;

      case 'list':
        console.log('Listing available backups...');
        const backups = backupManager.getBackups();
        if (backups.length === 0) {
          console.log('No backups found');
        } else {
          console.log(`\n📦 Available Backups (${backups.length}):`);
          backups.forEach((backup, index) => {
            const size = (backup.size / 1024 / 1024).toFixed(2);
            const date = backup.created.toLocaleString();
            console.log(`   ${index + 1}. ${backup.filename}`);
            console.log(`      Size: ${size} MB`);
            console.log(`      Created: ${date}`);
            console.log('');
          });
        }
        break;

      case 'restore':
        const backupFile = process.argv[3];
        if (!backupFile) {
          console.error('❌ Please specify backup file to restore');
          console.log('Usage: node backup.js restore <backup-file>');
          process.exit(1);
        }
        
        console.log(`Restoring from backup: ${backupFile}`);
        await backupManager.restoreBackup(backupFile);
        console.log('✅ Database restored successfully');
        break;

      case 'cleanup':
        console.log('Cleaning up old backups...');
        await backupManager.cleanupOldBackups();
        console.log('✅ Cleanup completed');
        break;

      case 'export':
        console.log('Exporting database to SQL...');
        const exportPath = await backupManager.exportToSQL();
        console.log(`✅ Database exported: ${exportPath}`);
        break;

      case 'check':
        console.log('Checking database integrity...');
        const isOk = await backupManager.checkIntegrity();
        if (isOk) {
          console.log('✅ Database integrity check passed');
        } else {
          console.log('❌ Database integrity check failed');
          process.exit(1);
        }
        break;

      case 'optimize':
        console.log('Optimizing database...');
        await backupManager.optimize();
        console.log('✅ Database optimization completed');
        break;

      case 'auto':
        console.log('Starting auto backup service...');
        backupManager.startAutoBackup();
        console.log('✅ Auto backup service started');
        console.log('Press Ctrl+C to stop');
        
        // Keep the process running
        process.on('SIGINT', () => {
          console.log('\n⚠️  Auto backup service stopped');
          process.exit(0);
        });
        break;

      case 'help':
      default:
        console.log(`
🗄️  Database Backup Tool

Usage: node backup.js <command> [options]

Commands:
  create                    Create a new backup
  list                      List available backups
  restore <backup-file>     Restore from backup
  cleanup                   Remove old backups
  export                    Export database to SQL
  check                     Check database integrity
  optimize                  Optimize database
  auto                      Start auto backup service
  help                      Show this help message

Examples:
  node backup.js create
  node backup.js list
  node backup.js restore backup-2025-01-03T10-30-00-000Z.sqlite.gz
  node backup.js cleanup
  node backup.js export
  node backup.js check
  node backup.js optimize
  node backup.js auto
        `);
        break;
    }
  } catch (error) {
    console.error('❌ Backup operation failed:', error.message);
    logger.error('Backup CLI error:', error);
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
