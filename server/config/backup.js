const fs = require('fs');
const path = require('path');
const { db } = require('./database');
const { logger } = require('./logger');
const config = require('./environment');

class DatabaseBackup {
  constructor() {
    this.backupDir = path.join(__dirname, '../backups');
    this.maxBackups = config.MAX_BACKUPS || 10;
    this.backupInterval = config.BACKUP_INTERVAL || 24 * 60 * 60 * 1000; // 24 hours
  }

  /**
   * Создает директорию для бэкапов если её нет
   */
  ensureBackupDir() {
    if (!fs.existsSync(this.backupDir)) {
      fs.mkdirSync(this.backupDir, { recursive: true });
      logger.info(`Created backup directory: ${this.backupDir}`);
    }
  }

  /**
   * Создает резервную копию базы данных
   */
  async createBackup() {
    try {
      this.ensureBackupDir();
      
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupFilename = `backup-${timestamp}.sqlite`;
      const backupPath = path.join(this.backupDir, backupFilename);
      
      // В SQLite просто копируем файл базы данных
      const dbPath = db.filename;
      fs.copyFileSync(dbPath, backupPath);
      
      // Сжимаем бэкап
      const compressedPath = `${backupPath}.gz`;
      const { exec } = require('child_process');
      const { promisify } = require('util');
      const execAsync = promisify(exec);
      
      try {
        await execAsync(`gzip -c "${backupPath}" > "${compressedPath}"`);
        fs.unlinkSync(backupPath); // Удаляем несжатый файл
        logger.info(`Backup created: ${compressedPath}`);
        return compressedPath;
      } catch (gzipError) {
        logger.warn('Gzip compression failed, keeping uncompressed backup:', gzipError.message);
        return backupPath;
      }
    } catch (err) {
      logger.error('Failed to create backup:', err);
      throw err;
    }
  }

  /**
   * Восстанавливает базу данных из резервной копии
   */
  async restoreBackup(backupPath) {
    try {
      if (!fs.existsSync(backupPath)) {
        throw new Error(`Backup file not found: ${backupPath}`);
      }

      const dbPath = db.filename;
      
      // Если это сжатый файл, распаковываем его
      if (backupPath.endsWith('.gz')) {
        const { exec } = require('child_process');
        const { promisify } = require('util');
        const execAsync = promisify(exec);
        
        const tempPath = backupPath.replace('.gz', '');
        await execAsync(`gunzip -c "${backupPath}" > "${tempPath}"`);
        
        fs.copyFileSync(tempPath, dbPath);
        fs.unlinkSync(tempPath); // Удаляем временный файл
        
        logger.info(`Database restored from compressed backup: ${backupPath}`);
      } else {
        fs.copyFileSync(backupPath, dbPath);
        logger.info(`Database restored from backup: ${backupPath}`);
      }
    } catch (err) {
      logger.error('Failed to restore backup:', err);
      throw err;
    }
  }

  /**
   * Получает список доступных бэкапов
   */
  getBackups() {
    try {
      this.ensureBackupDir();
      
      const files = fs.readdirSync(this.backupDir)
        .filter(file => file.startsWith('backup-') && (file.endsWith('.sqlite') || file.endsWith('.sqlite.gz')))
        .map(file => {
          const filePath = path.join(this.backupDir, file);
          const stats = fs.statSync(filePath);
          return {
            filename: file,
            path: filePath,
            size: stats.size,
            created: stats.birthtime,
            modified: stats.mtime
          };
        })
        .sort((a, b) => b.created - a.created);
      
      return files;
    } catch (err) {
      logger.error('Failed to get backup list:', err);
      throw err;
    }
  }

  /**
   * Удаляет старые бэкапы, оставляя только последние N
   */
  async cleanupOldBackups() {
    try {
      const backups = this.getBackups();
      
      if (backups.length <= this.maxBackups) {
        logger.info(`No cleanup needed. Current backups: ${backups.length}, max: ${this.maxBackups}`);
        return;
      }

      const toDelete = backups.slice(this.maxBackups);
      
      for (const backup of toDelete) {
        fs.unlinkSync(backup.path);
        logger.info(`Deleted old backup: ${backup.filename}`);
      }
      
      logger.info(`Cleanup completed. Deleted ${toDelete.length} old backups`);
    } catch (err) {
      logger.error('Failed to cleanup old backups:', err);
      throw err;
    }
  }

  /**
   * Запускает автоматическое резервное копирование
   */
  startAutoBackup() {
    if (config.NODE_ENV !== 'production') {
      logger.info('Auto backup disabled in non-production environment');
      return;
    }

    logger.info(`Starting auto backup. Interval: ${this.backupInterval}ms`);
    
    setInterval(async () => {
      try {
        await this.createBackup();
        await this.cleanupOldBackups();
      } catch (err) {
        logger.error('Auto backup failed:', err);
      }
    }, this.backupInterval);
  }

  /**
   * Экспортирует данные в SQL формат
   */
  async exportToSQL() {
    try {
      this.ensureBackupDir();
      
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const exportFilename = `export-${timestamp}.sql`;
      const exportPath = path.join(this.backupDir, exportFilename);
      
      const { exec } = require('child_process');
      const { promisify } = require('util');
      const execAsync = promisify(exec);
      
      // Используем sqlite3 для экспорта
      await execAsync(`sqlite3 "${db.filename}" .dump > "${exportPath}"`);
      
      logger.info(`Database exported to SQL: ${exportPath}`);
      return exportPath;
    } catch (err) {
      logger.error('Failed to export to SQL:', err);
      throw err;
    }
  }

  /**
   * Проверяет целостность базы данных
   */
  async checkIntegrity() {
    try {
      const result = await dbGet('PRAGMA integrity_check');
      const isIntegrityOk = result.integrity_check === 'ok';
      
      if (isIntegrityOk) {
        logger.info('Database integrity check passed');
      } else {
        logger.error('Database integrity check failed:', result);
      }
      
      return isIntegrityOk;
    } catch (err) {
      logger.error('Failed to check database integrity:', err);
      throw err;
    }
  }

  /**
   * Оптимизирует базу данных
   */
  async optimize() {
    try {
      await dbExec('VACUUM');
      await dbExec('ANALYZE');
      logger.info('Database optimization completed');
    } catch (err) {
      logger.error('Failed to optimize database:', err);
      throw err;
    }
  }
}

module.exports = DatabaseBackup;
