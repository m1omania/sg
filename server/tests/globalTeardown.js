const { db } = require('../config/database');

module.exports = async () => {
  console.log('🧹 Cleaning up test environment...');
  
  try {
    // Close database connection
    if (db) {
      await new Promise((resolve, reject) => {
        db.close((err) => {
          if (err) {
            reject(err);
          } else {
            resolve();
          }
        });
      });
    }
    
    console.log('✅ Test environment cleanup complete');
  } catch (error) {
    console.error('❌ Test environment cleanup failed:', error);
    throw error;
  }
};
