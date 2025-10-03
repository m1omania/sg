const { chromium } = require('@playwright/test');

async function globalSetup(config) {
  console.log('🚀 Setting up E2E test environment...');
  
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  try {
    // Wait for the application to be ready
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');
    
    console.log('✅ E2E test environment setup complete');
  } catch (error) {
    console.error('❌ E2E test environment setup failed:', error);
    throw error;
  } finally {
    await browser.close();
  }
}

module.exports = globalSetup;
