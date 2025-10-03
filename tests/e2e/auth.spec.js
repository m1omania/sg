const { test, expect } = require('@playwright/test');

test.describe('Authentication Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the landing page
    await page.goto('http://localhost:3000/landing.html');
  });

  test('should display landing page correctly', async ({ page }) => {
    // Check if the page loads
    await expect(page).toHaveTitle(/SolarGroup/);
    
    // Check for key elements
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('text=Register')).toBeVisible();
    await expect(page.locator('text=Login')).toBeVisible();
  });

  test('should navigate to registration page', async ({ page }) => {
    // Click on register button
    await page.click('text=Register');
    
    // Check if we're on the registration page
    await expect(page).toHaveURL(/register\.html/);
    await expect(page.locator('h1')).toContainText('Register');
  });

  test('should navigate to login page', async ({ page }) => {
    // Click on login button
    await page.click('text=Login');
    
    // Check if we're on the login page
    await expect(page).toHaveURL(/index\.html/);
  });

  test('should show validation errors for invalid email', async ({ page }) => {
    // Navigate to registration page
    await page.goto('http://localhost:3000/register.html');
    
    // Fill in invalid email
    await page.fill('input[type="email"]', 'invalid-email');
    await page.fill('input[type="text"][placeholder*="code"]', '123456');
    await page.fill('input[type="password"]', 'TestPassword123!');
    
    // Submit form
    await page.click('button[type="submit"]');
    
    // Check for validation error
    await expect(page.locator('.error, .alert, [role="alert"]')).toBeVisible();
  });

  test('should show validation errors for weak password', async ({ page }) => {
    // Navigate to registration page
    await page.goto('http://localhost:3000/register.html');
    
    // Fill in weak password
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="text"][placeholder*="code"]', '123456');
    await page.fill('input[type="password"]', 'weak');
    
    // Submit form
    await page.click('button[type="submit"]');
    
    // Check for validation error
    await expect(page.locator('.error, .alert, [role="alert"]')).toBeVisible();
  });

  test('should handle successful registration flow', async ({ page }) => {
    // Mock successful API response
    await page.route('**/api/auth/register', async route => {
      await route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({
          token: 'mock-jwt-token',
          user: {
            id: 1,
            username: 'testuser',
            email: 'test@example.com'
          }
        })
      });
    });

    // Navigate to registration page
    await page.goto('http://localhost:3000/register.html');
    
    // Fill in valid data
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="text"][placeholder*="code"]', '123456');
    await page.fill('input[type="password"]', 'TestPassword123!');
    
    // Submit form
    await page.click('button[type="submit"]');
    
    // Check for success message or redirect
    await expect(page.locator('.success, .alert-success, [role="alert"]')).toBeVisible();
  });

  test('should handle login flow', async ({ page }) => {
    // Mock successful API response
    await page.route('**/api/auth/login', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          token: 'mock-jwt-token',
          user: {
            id: 1,
            username: 'testuser',
            email: 'test@example.com'
          }
        })
      });
    });

    // Navigate to login page
    await page.goto('http://localhost:3000/index.html');
    
    // Fill in login credentials
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'TestPassword123!');
    
    // Submit form
    await page.click('button[type="submit"]');
    
    // Check for success or redirect to dashboard
    await expect(page.locator('.success, .alert-success, [role="alert"]')).toBeVisible();
  });

  test('should handle API errors gracefully', async ({ page }) => {
    // Mock API error response
    await page.route('**/api/auth/register', async route => {
      await route.fulfill({
        status: 400,
        contentType: 'application/json',
        body: JSON.stringify({
          error: 'Email already exists',
          code: 'EMAIL_EXISTS'
        })
      });
    });

    // Navigate to registration page
    await page.goto('http://localhost:3000/register.html');
    
    // Fill in data
    await page.fill('input[type="email"]', 'existing@example.com');
    await page.fill('input[type="text"][placeholder*="code"]', '123456');
    await page.fill('input[type="password"]', 'TestPassword123!');
    
    // Submit form
    await page.click('button[type="submit"]');
    
    // Check for error message
    await expect(page.locator('.error, .alert-danger, [role="alert"]')).toBeVisible();
    await expect(page.locator('text=Email already exists')).toBeVisible();
  });

  test('should maintain form state on validation errors', async ({ page }) => {
    // Navigate to registration page
    await page.goto('http://localhost:3000/register.html');
    
    // Fill in data with invalid email
    await page.fill('input[type="email"]', 'invalid-email');
    await page.fill('input[type="text"][placeholder*="code"]', '123456');
    await page.fill('input[type="password"]', 'TestPassword123!');
    
    // Submit form
    await page.click('button[type="submit"]');
    
    // Check that form data is preserved
    await expect(page.locator('input[type="email"]')).toHaveValue('invalid-email');
    await expect(page.locator('input[type="text"][placeholder*="code"]')).toHaveValue('123456');
    await expect(page.locator('input[type="password"]')).toHaveValue('TestPassword123!');
  });

  test('should handle network errors gracefully', async ({ page }) => {
    // Mock network error
    await page.route('**/api/auth/register', async route => {
      await route.abort('failed');
    });

    // Navigate to registration page
    await page.goto('http://localhost:3000/register.html');
    
    // Fill in data
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="text"][placeholder*="code"]', '123456');
    await page.fill('input[type="password"]', 'TestPassword123!');
    
    // Submit form
    await page.click('button[type="submit"]');
    
    // Check for network error message
    await expect(page.locator('.error, .alert-danger, [role="alert"]')).toBeVisible();
  });

  test('should be accessible with keyboard navigation', async ({ page }) => {
    // Navigate to registration page
    await page.goto('http://localhost:3000/register.html');
    
    // Tab through form elements
    await page.keyboard.press('Tab');
    await expect(page.locator('input[type="email"]:focus')).toBeVisible();
    
    await page.keyboard.press('Tab');
    await expect(page.locator('input[type="text"][placeholder*="code"]:focus')).toBeVisible();
    
    await page.keyboard.press('Tab');
    await expect(page.locator('input[type="password"]:focus')).toBeVisible();
    
    await page.keyboard.press('Tab');
    await expect(page.locator('button[type="submit"]:focus')).toBeVisible();
  });

  test('should work on mobile devices', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Navigate to registration page
    await page.goto('http://localhost:3000/register.html');
    
    // Check if form is visible and usable
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="text"][placeholder*="code"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
    
    // Test form interaction
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="text"][placeholder*="code"]', '123456');
    await page.fill('input[type="password"]', 'TestPassword123!');
    
    // Check if submit button is clickable
    await expect(page.locator('button[type="submit"]')).toBeEnabled();
  });
});
