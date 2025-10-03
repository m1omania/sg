const { test, expect } = require('@playwright/test');

test.describe('Wallet Management', () => {
  test.beforeEach(async ({ page }) => {
    // Mock authentication
    await page.addInitScript(() => {
      localStorage.setItem('authToken', 'mock-jwt-token');
      localStorage.setItem('userId', '1');
    });

    // Mock API responses
    await page.route('**/api/wallet/1', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          main_balance: 1000,
          bonus_balance: 100,
          partner_balance: 50,
          total_balance: 1150
        })
      });
    });

    await page.route('**/api/wallet/1/coupons', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          coupons: [
            {
              id: 1,
              name: 'Welcome Bonus',
              project: 'Solar Project A',
              bonus: '10%',
              expiry_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
              days_left: 30,
              code: 'WELCOME10',
              min_amount: 100,
              status: 'active'
            },
            {
              id: 2,
              name: 'Loyalty Reward',
              project: 'Wind Project B',
              bonus: '15%',
              expiry_date: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
              days_left: 15,
              code: 'LOYALTY15',
              min_amount: 200,
              status: 'active'
            }
          ],
          pagination: {
            page: 1,
            limit: 10,
            total: 2,
            pages: 1
          }
        })
      });
    });

    // Navigate to wallet page
    await page.goto('http://localhost:3000/wallet.html');
  });

  test('should display wallet balances correctly', async ({ page }) => {
    // Check if balances are displayed
    await expect(page.locator('#mainBalance, [data-testid="main-balance"]')).toContainText('$1,000');
    await expect(page.locator('#bonusBalance, [data-testid="bonus-balance"]')).toContainText('$100');
    await expect(page.locator('#partnerBalance, [data-testid="partner-balance"]')).toContainText('$50');
    await expect(page.locator('#totalBalance, [data-testid="total-balance"]')).toContainText('$1,150');
  });

  test('should display coupons correctly', async ({ page }) => {
    // Check if coupons are displayed
    await expect(page.locator('[data-testid="coupon-item"], .coupon-item')).toHaveCount(2);
    
    // Check first coupon
    await expect(page.locator('text=Welcome Bonus')).toBeVisible();
    await expect(page.locator('text=Solar Project A')).toBeVisible();
    await expect(page.locator('text=10%')).toBeVisible();
    await expect(page.locator('text=WELCOME10')).toBeVisible();
    
    // Check second coupon
    await expect(page.locator('text=Loyalty Reward')).toBeVisible();
    await expect(page.locator('text=Wind Project B')).toBeVisible();
    await expect(page.locator('text=15%')).toBeVisible();
    await expect(page.locator('text=LOYALTY15')).toBeVisible();
  });

  test('should handle currency switching', async ({ page }) => {
    // Mock currency conversion API
    await page.route('**/api/exchange-rates', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          USD: 1,
          EUR: 0.85,
          GBP: 0.73,
          RUB: 75.5
        })
      });
    });

    // Find currency selector
    const currencySelector = page.locator('#currencySelector, [data-testid="currency-selector"]');
    await expect(currencySelector).toBeVisible();

    // Switch to EUR
    await currencySelector.selectOption('EUR');
    
    // Check if balances are updated (mocked conversion)
    await expect(page.locator('#mainBalance, [data-testid="main-balance"]')).toContainText('€850');
  });

  test('should handle deposit flow', async ({ page }) => {
    // Mock deposit API
    await page.route('**/api/wallet/1/deposit', async route => {
      const requestData = route.request().postDataJSON();
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          message: 'Deposit successful',
          transaction_id: 'TXN123456',
          amount: requestData.amount
        })
      });
    });

    // Find deposit form
    const depositForm = page.locator('[data-testid="deposit-form"], form');
    await expect(depositForm).toBeVisible();

    // Fill deposit form
    await page.fill('input[name="amount"], [data-testid="deposit-amount"]', '500');
    await page.selectOption('select[name="currency"], [data-testid="deposit-currency"]', 'USD');
    await page.selectOption('select[name="method"], [data-testid="deposit-method"]', 'card');

    // Submit form
    await page.click('button[type="submit"], [data-testid="deposit-submit"]');

    // Check for success message
    await expect(page.locator('.success, .alert-success, [role="alert"]')).toBeVisible();
    await expect(page.locator('text=Deposit successful')).toBeVisible();
  });

  test('should validate deposit form', async ({ page }) => {
    // Try to submit empty form
    await page.click('button[type="submit"], [data-testid="deposit-submit"]');

    // Check for validation errors
    await expect(page.locator('.error, .alert-danger, [role="alert"]')).toBeVisible();
  });

  test('should handle coupon activation', async ({ page }) => {
    // Mock coupon activation API
    await page.route('**/api/coupons/activate', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          message: 'Coupon activated successfully',
          coupon: {
            id: 1,
            name: 'Welcome Bonus',
            code: 'WELCOME10'
          }
        })
      });
    });

    // Find coupon activation form
    const activationForm = page.locator('[data-testid="coupon-activation-form"], form');
    await expect(activationForm).toBeVisible();

    // Fill activation form
    await page.fill('input[name="code"], [data-testid="coupon-code"]', 'WELCOME10');

    // Submit form
    await page.click('button[type="submit"], [data-testid="activate-submit"]');

    // Check for success message
    await expect(page.locator('.success, .alert-success, [role="alert"]')).toBeVisible();
    await expect(page.locator('text=Coupon activated successfully')).toBeVisible();
  });

  test('should handle coupon usage', async ({ page }) => {
    // Mock coupon usage API
    await page.route('**/api/coupons/use', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          message: 'Coupon used successfully',
          coupon: {
            id: 1,
            name: 'Welcome Bonus',
            code: 'WELCOME10'
          }
        })
      });
    });

    // Find use coupon button
    const useButton = page.locator('[data-testid="use-coupon-1"], button:has-text("Use")').first();
    await expect(useButton).toBeVisible();

    // Click use button
    await useButton.click();

    // Check for success message
    await expect(page.locator('.success, .alert-success, [role="alert"]')).toBeVisible();
    await expect(page.locator('text=Coupon used successfully')).toBeVisible();
  });

  test('should handle API errors gracefully', async ({ page }) => {
    // Mock API error
    await page.route('**/api/wallet/1', async route => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({
          error: 'Internal server error',
          code: 'INTERNAL_ERROR'
        })
      });
    });

    // Reload page to trigger API call
    await page.reload();

    // Check for error message
    await expect(page.locator('.error, .alert-danger, [role="alert"]')).toBeVisible();
  });

  test('should handle network errors gracefully', async ({ page }) => {
    // Mock network error
    await page.route('**/api/wallet/1', async route => {
      await route.abort('failed');
    });

    // Reload page to trigger API call
    await page.reload();

    // Check for network error message
    await expect(page.locator('.error, .alert-danger, [role="alert"]')).toBeVisible();
  });

  test('should be accessible with keyboard navigation', async ({ page }) => {
    // Tab through interactive elements
    await page.keyboard.press('Tab');
    await expect(page.locator('input:focus, select:focus, button:focus')).toBeVisible();

    // Continue tabbing
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');

    // Check if focus is visible
    await expect(page.locator('input:focus, select:focus, button:focus')).toBeVisible();
  });

  test('should work on mobile devices', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    // Check if wallet elements are visible and usable
    await expect(page.locator('#mainBalance, [data-testid="main-balance"]')).toBeVisible();
    await expect(page.locator('#bonusBalance, [data-testid="bonus-balance"]')).toBeVisible();
    await expect(page.locator('#partnerBalance, [data-testid="partner-balance"]')).toBeVisible();
    await expect(page.locator('#totalBalance, [data-testid="total-balance"]')).toBeVisible();

    // Check if coupons are visible
    await expect(page.locator('[data-testid="coupon-item"], .coupon-item')).toBeVisible();

    // Check if forms are usable
    await expect(page.locator('input[name="amount"], [data-testid="deposit-amount"]')).toBeVisible();
    await expect(page.locator('input[name="code"], [data-testid="coupon-code"]')).toBeVisible();
  });

  test('should handle loading states', async ({ page }) => {
    // Mock slow API response
    await page.route('**/api/wallet/1', async route => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          main_balance: 1000,
          bonus_balance: 100,
          partner_balance: 50,
          total_balance: 1150
        })
      });
    });

    // Reload page
    await page.reload();

    // Check for loading indicator
    await expect(page.locator('.loading, .spinner, [data-testid="loading"]')).toBeVisible();

    // Wait for loading to complete
    await expect(page.locator('#mainBalance, [data-testid="main-balance"]')).toBeVisible();
  });

  test('should handle empty states', async ({ page }) => {
    // Mock empty coupons response
    await page.route('**/api/wallet/1/coupons', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          coupons: [],
          pagination: {
            page: 1,
            limit: 10,
            total: 0,
            pages: 0
          }
        })
      });
    });

    // Reload page
    await page.reload();

    // Check for empty state message
    await expect(page.locator('.empty-state, .no-data, [data-testid="empty-state"]')).toBeVisible();
  });
});
