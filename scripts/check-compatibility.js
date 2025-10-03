#!/usr/bin/env node

/**
 * Compatibility check script for SolarGroup Investment Platform
 * Checks if all dependencies are compatible with the current environment
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔍 Checking compatibility...\n');

// Check Node.js version
const nodeVersion = process.version;
console.log(`Node.js version: ${nodeVersion}`);

const requiredVersion = '20.0.0';
const currentVersion = nodeVersion.replace('v', '');
const isCompatible = compareVersions(currentVersion, requiredVersion) >= 0;

if (!isCompatible) {
  console.error(`❌ Node.js version ${currentVersion} is not compatible. Required: ${requiredVersion}+`);
  process.exit(1);
} else {
  console.log(`✅ Node.js version is compatible`);
}

// Check if bcryptjs is installed
try {
  require('bcryptjs');
  console.log('✅ bcryptjs is available');
} catch (error) {
  console.error('❌ bcryptjs is not installed');
  process.exit(1);
}

// Check if sqlite3 is working
try {
  const sqlite3 = require('../server/node_modules/sqlite3');
  console.log('✅ sqlite3 is available');
} catch (error) {
  console.error('❌ sqlite3 is not working:', error.message);
  process.exit(1);
}

// Check environment variables
const requiredEnvVars = ['JWT_SECRET', 'NODE_ENV'];
const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  console.warn(`⚠️  Missing environment variables: ${missingEnvVars.join(', ')}`);
} else {
  console.log('✅ All required environment variables are set');
}

// Check database file
const dbPath = process.env.DATABASE_PATH || './server/database.sqlite';
if (fs.existsSync(dbPath)) {
  console.log('✅ Database file exists');
} else {
  console.log('ℹ️  Database file will be created on first run');
}

console.log('\n🎉 Compatibility check completed successfully!');

function compareVersions(version1, version2) {
  const v1parts = version1.split('.').map(Number);
  const v2parts = version2.split('.').map(Number);
  
  for (let i = 0; i < Math.max(v1parts.length, v2parts.length); i++) {
    const v1part = v1parts[i] || 0;
    const v2part = v2parts[i] || 0;
    
    if (v1part > v2part) return 1;
    if (v1part < v2part) return -1;
  }
  
  return 0;
}
