# Testing Guide

## Overview

This document describes the comprehensive testing strategy implemented in the SolarGroup platform, including unit tests, integration tests, and end-to-end (E2E) tests.

## Testing Stack

### Backend Testing
- **Jest**: JavaScript testing framework
- **Supertest**: HTTP assertion library for API testing
- **Babel**: JavaScript transpilation for modern features

### Frontend Testing
- **Playwright**: End-to-end testing framework
- **Jest**: Unit testing for JavaScript modules
- **Lighthouse**: Performance and accessibility testing

## Test Structure

```
tests/
├── unit/                    # Unit tests
│   ├── routes/             # API route tests
│   ├── middleware/         # Middleware tests
│   └── utils/              # Utility function tests
├── integration/            # Integration tests
│   ├── api.test.js        # API integration tests
│   └── database.test.js   # Database integration tests
└── e2e/                   # End-to-end tests
    ├── auth.spec.js       # Authentication flow tests
    ├── wallet.spec.js     # Wallet management tests
    └── investment.spec.js # Investment flow tests
```

## Running Tests

### Backend Tests

```bash
# Run all backend tests
cd server
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run tests for CI
npm run test:ci
```

### Frontend Tests

```bash
# Run E2E tests
npm run test:e2e

# Run E2E tests with UI
npm run test:e2e:ui

# Run E2E tests in headed mode
npm run test:e2e:headed

# Debug E2E tests
npm run test:e2e:debug

# View test report
npm run test:e2e:report
```

### All Tests

```bash
# Run all tests (backend + frontend)
npm run test:all

# Run tests with coverage
npm run test:coverage:all
```

## Test Categories

### 1. Unit Tests

Unit tests focus on testing individual functions, methods, and components in isolation.

#### API Route Tests
- **Authentication routes**: Registration, login, verification
- **Wallet routes**: Balance retrieval, deposits, currency switching
- **Coupon routes**: Activation, usage, history
- **Investment routes**: Project listing, investment creation

#### Middleware Tests
- **Authentication middleware**: JWT validation, user verification
- **Validation middleware**: Input validation, sanitization
- **Security middleware**: Rate limiting, CORS, Helmet
- **Error handling middleware**: Error responses, logging

#### Utility Tests
- **Database utilities**: Query execution, transaction handling
- **Validation utilities**: Data validation, sanitization
- **Crypto utilities**: Password hashing, JWT generation
- **Format utilities**: Currency formatting, date formatting

### 2. Integration Tests

Integration tests verify that different parts of the system work together correctly.

#### API Integration Tests
- **Complete user journeys**: Registration → Login → Wallet → Investment
- **Cross-route interactions**: Coupon activation affecting wallet balance
- **Database consistency**: Data integrity across operations
- **Error handling**: Consistent error responses across endpoints

#### Database Integration Tests
- **Transaction handling**: Rollback on errors, data consistency
- **Migration testing**: Schema changes, data migration
- **Performance testing**: Query optimization, connection pooling
- **Backup/restore**: Data integrity, recovery procedures

### 3. End-to-End Tests

E2E tests simulate real user interactions with the application.

#### Authentication Flow
- **Registration process**: Form validation, API integration, success handling
- **Login process**: Credential validation, session management
- **Logout process**: Session cleanup, redirect handling
- **Password reset**: Email flow, token validation

#### Wallet Management
- **Balance display**: Currency conversion, real-time updates
- **Deposit process**: Form validation, payment integration
- **Coupon management**: Activation, usage, history
- **Transaction history**: Pagination, filtering, search

#### Investment Flow
- **Project browsing**: Filtering, sorting, pagination
- **Investment creation**: Form validation, payment processing
- **Portfolio management**: Investment tracking, performance
- **Withdrawal process**: Balance validation, processing

## Test Configuration

### Jest Configuration

```javascript
// jest.config.js
module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/__tests__/**/*.js', '**/?(*.)+(spec|test).js'],
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70
    }
  }
};
```

### Playwright Configuration

```javascript
// playwright.config.js
module.exports = defineConfig({
  testDir: './tests/e2e',
  timeout: 30 * 1000,
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure'
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } }
  ]
});
```

## Test Data Management

### Test Database
- **In-memory SQLite**: Fast, isolated test database
- **Test fixtures**: Predefined test data
- **Data cleanup**: Automatic cleanup between tests
- **Migration testing**: Schema validation

### Mock Data
- **API responses**: Mocked external API calls
- **User data**: Test user accounts and profiles
- **Transaction data**: Sample transactions and balances
- **Coupon data**: Test coupons and promotions

### Test Utilities
- **Data generators**: Create test data programmatically
- **API helpers**: Simplify API testing
- **Database helpers**: Database setup and cleanup
- **Assertion helpers**: Custom assertions for common patterns

## Coverage Requirements

### Backend Coverage
- **Lines**: 70% minimum
- **Functions**: 70% minimum
- **Branches**: 70% minimum
- **Statements**: 70% minimum

### Frontend Coverage
- **Lines**: 60% minimum
- **Functions**: 60% minimum
- **Branches**: 60% minimum
- **Statements**: 60% minimum

## Continuous Integration

### GitHub Actions
```yaml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      - run: npm ci
      - run: npm run test:ci
      - run: npm run test:e2e
```

### Test Reports
- **Jest HTML Reporter**: Detailed test results
- **Playwright Report**: E2E test results with screenshots
- **Coverage Reports**: Code coverage analysis
- **Performance Reports**: Lighthouse audit results

## Best Practices

### Writing Tests
1. **Arrange-Act-Assert**: Clear test structure
2. **Descriptive names**: Test names should describe the behavior
3. **Single responsibility**: One test per behavior
4. **Independent tests**: Tests should not depend on each other
5. **Fast execution**: Tests should run quickly

### Test Data
1. **Isolated data**: Each test should use its own data
2. **Cleanup**: Always clean up test data
3. **Realistic data**: Use realistic test data
4. **Edge cases**: Test boundary conditions
5. **Error cases**: Test error scenarios

### Maintenance
1. **Regular updates**: Keep tests up to date with code changes
2. **Refactoring**: Refactor tests when code changes
3. **Documentation**: Document complex test scenarios
4. **Performance**: Monitor test execution time
5. **Coverage**: Maintain coverage requirements

## Debugging Tests

### Backend Tests
```bash
# Debug specific test
npm test -- --testNamePattern="should register new user"

# Debug with verbose output
npm test -- --verbose

# Debug with coverage
npm test -- --coverage --verbose
```

### Frontend Tests
```bash
# Debug E2E tests
npm run test:e2e:debug

# Run specific test
npm run test:e2e -- --grep "should display wallet balances"

# Run with headed browser
npm run test:e2e:headed
```

### Common Issues
1. **Database locks**: Ensure proper cleanup
2. **Async operations**: Use proper async/await
3. **Timeouts**: Adjust timeout values
4. **Mock data**: Verify mock data setup
5. **Environment**: Check environment variables

## Performance Testing

### Load Testing
- **API load tests**: Test API under load
- **Database performance**: Query optimization
- **Memory usage**: Monitor memory consumption
- **Response times**: Measure response times

### Stress Testing
- **High concurrency**: Test with many concurrent users
- **Large datasets**: Test with large amounts of data
- **Resource limits**: Test resource constraints
- **Error handling**: Test error recovery

## Security Testing

### Authentication Testing
- **JWT validation**: Token verification
- **Password security**: Password hashing
- **Session management**: Session handling
- **Authorization**: Access control

### Input Validation Testing
- **SQL injection**: Prevent SQL injection
- **XSS prevention**: Cross-site scripting protection
- **CSRF protection**: Cross-site request forgery
- **Input sanitization**: Data sanitization

## Accessibility Testing

### WCAG Compliance
- **Keyboard navigation**: Tab order and shortcuts
- **Screen readers**: ARIA labels and roles
- **Color contrast**: Visual accessibility
- **Focus management**: Focus indicators

### Testing Tools
- **axe-core**: Automated accessibility testing
- **Lighthouse**: Accessibility auditing
- **Manual testing**: Human verification
- **Screen readers**: Real-world testing

This comprehensive testing strategy ensures the SolarGroup platform is reliable, secure, and user-friendly across all components and user interactions.
