async function globalTeardown(config) {
  console.log('🧹 Cleaning up E2E test environment...');
  
  // Add any cleanup logic here
  // For example, cleaning up test data, stopping services, etc.
  
  console.log('✅ E2E test environment cleanup complete');
}

module.exports = globalTeardown;
