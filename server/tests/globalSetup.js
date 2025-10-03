const { db } = require('../config/database');
const path = require('path');

module.exports = async () => {
  console.log('🚀 Setting up test environment...');
  
  try {
    // Wait for database to be ready
    await new Promise((resolve) => {
      const checkDb = () => {
        if (db) {
          resolve();
        } else {
          setTimeout(checkDb, 100);
        }
      };
      checkDb();
    });
    
    console.log('✅ Test environment setup complete');
  } catch (error) {
    console.error('❌ Test environment setup failed:', error);
    throw error;
  }
};
