const fs = require('fs');
const path = require('path');
const { dbExec, dbGet, dbAll } = require('./database');
const { logger } = require('./logger');

class MigrationManager {
  constructor() {
    this.migrationsDir = path.join(__dirname, '../migrations');
    this.migrationsTable = 'schema_migrations';
  }

  /**
   * Инициализирует таблицу миграций
   */
  async init() {
    try {
      await dbExec(`
        CREATE TABLE IF NOT EXISTS ${this.migrationsTable} (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          version VARCHAR(255) UNIQUE NOT NULL,
          filename VARCHAR(255) NOT NULL,
          executed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          checksum VARCHAR(255)
        )
      `);
      logger.info('Migration table initialized');
    } catch (err) {
      logger.error('Failed to initialize migration table:', err);
      throw err;
    }
  }

  /**
   * Получает список выполненных миграций
   */
  async getExecutedMigrations() {
    try {
      const migrations = await dbAll(`
        SELECT version, filename, executed_at, checksum 
        FROM ${this.migrationsTable} 
        ORDER BY version
      `);
      return migrations;
    } catch (err) {
      logger.error('Failed to get executed migrations:', err);
      throw err;
    }
  }

  /**
   * Получает список файлов миграций
   */
  getMigrationFiles() {
    try {
      const files = fs.readdirSync(this.migrationsDir)
        .filter(file => file.endsWith('.sql'))
        .sort();
      return files;
    } catch (err) {
      logger.error('Failed to read migration files:', err);
      throw err;
    }
  }

  /**
   * Вычисляет checksum файла
   */
  getFileChecksum(filePath) {
    const crypto = require('crypto');
    const content = fs.readFileSync(filePath, 'utf8');
    return crypto.createHash('md5').update(content).digest('hex');
  }

  /**
   * Выполняет миграцию
   */
  async runMigration(filename) {
    const filePath = path.join(this.migrationsDir, filename);
    const version = filename.split('_')[0];
    
    try {
      // Проверяем, не выполнена ли уже эта миграция
      const existing = await dbGet(`
        SELECT * FROM ${this.migrationsTable} WHERE version = ?
      `, [version]);
      
      if (existing) {
        logger.info(`Migration ${version} already executed, skipping`);
        return;
      }

      // Читаем содержимое файла миграции
      const content = fs.readFileSync(filePath, 'utf8');
      const checksum = this.getFileChecksum(filePath);

      // Выполняем миграцию
      logger.info(`Running migration ${version}: ${filename}`);
      await dbExec(content);

      // Записываем информацию о выполненной миграции
      await dbExec(`
        INSERT INTO ${this.migrationsTable} (version, filename, checksum)
        VALUES (?, ?, ?)
      `, [version, filename, checksum]);

      logger.info(`Migration ${version} completed successfully`);
    } catch (err) {
      logger.error(`Failed to run migration ${version}:`, err);
      throw err;
    }
  }

  /**
   * Выполняет все невыполненные миграции
   */
  async runMigrations() {
    try {
      await this.init();
      
      const executedMigrations = await this.getExecutedMigrations();
      const executedVersions = new Set(executedMigrations.map(m => m.version));
      
      const migrationFiles = this.getMigrationFiles();
      const pendingMigrations = migrationFiles.filter(file => {
        const version = file.split('_')[0];
        return !executedVersions.has(version);
      });

      if (pendingMigrations.length === 0) {
        logger.info('No pending migrations found');
        return;
      }

      logger.info(`Found ${pendingMigrations.length} pending migrations`);

      for (const filename of pendingMigrations) {
        await this.runMigration(filename);
      }

      logger.info('All migrations completed successfully');
    } catch (err) {
      logger.error('Migration process failed:', err);
      throw err;
    }
  }

  /**
   * Откатывает последнюю миграцию (если поддерживается)
   */
  async rollbackLastMigration() {
    try {
      const lastMigration = await dbGet(`
        SELECT * FROM ${this.migrationsTable} 
        ORDER BY executed_at DESC 
        LIMIT 1
      `);

      if (!lastMigration) {
        logger.info('No migrations to rollback');
        return;
      }

      logger.warn(`Rollback functionality not implemented for ${lastMigration.version}`);
      logger.warn('Manual rollback may be required');
    } catch (err) {
      logger.error('Failed to rollback migration:', err);
      throw err;
    }
  }

  /**
   * Проверяет статус миграций
   */
  async status() {
    try {
      await this.init();
      
      const executedMigrations = await this.getExecutedMigrations();
      const migrationFiles = this.getMigrationFiles();
      
      const status = {
        executed: executedMigrations.length,
        total: migrationFiles.length,
        pending: migrationFiles.length - executedMigrations.length,
        migrations: []
      };

      for (const file of migrationFiles) {
        const version = file.split('_')[0];
        const executed = executedMigrations.find(m => m.version === version);
        
        status.migrations.push({
          version,
          filename: file,
          executed: !!executed,
          executedAt: executed ? executed.executed_at : null,
          checksum: executed ? executed.checksum : null
        });
      }

      return status;
    } catch (err) {
      logger.error('Failed to get migration status:', err);
      throw err;
    }
  }

  /**
   * Валидирует целостность выполненных миграций
   */
  async validate() {
    try {
      const executedMigrations = await this.getExecutedMigrations();
      let isValid = true;
      const issues = [];

      for (const migration of executedMigrations) {
        const filePath = path.join(this.migrationsDir, migration.filename);
        
        if (!fs.existsSync(filePath)) {
          issues.push(`Migration file not found: ${migration.filename}`);
          isValid = false;
          continue;
        }

        const currentChecksum = this.getFileChecksum(filePath);
        if (currentChecksum !== migration.checksum) {
          issues.push(`Checksum mismatch for ${migration.filename}`);
          isValid = false;
        }
      }

      if (isValid) {
        logger.info('All migrations are valid');
      } else {
        logger.warn('Migration validation failed:', issues);
      }

      return { isValid, issues };
    } catch (err) {
      logger.error('Failed to validate migrations:', err);
      throw err;
    }
  }
}

module.exports = MigrationManager;
