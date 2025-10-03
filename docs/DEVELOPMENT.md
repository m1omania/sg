# Development Guide

This guide provides comprehensive information for developers working on the SolarGroup Investment Platform.

## Table of Contents

- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Development Environment](#development-environment)
- [Coding Standards](#coding-standards)
- [Testing](#testing)
- [Database](#database)
- [API Development](#api-development)
- [Frontend Development](#frontend-development)
- [Deployment](#deployment)
- [Troubleshooting](#troubleshooting)

## Getting Started

### Prerequisites

- Node.js 20 or higher
- npm 8 or higher
- Git
- Docker and Docker Compose (optional)
- VS Code (recommended)

### Initial Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/solar-group.git
   cd solar-group
   ```

2. **Install dependencies**
   ```bash
   # Install frontend dependencies
   npm install
   
   # Install backend dependencies
   cd server
   npm install
   cd ..
   ```

3. **Set up environment variables**
   ```bash
   # Copy environment template
   cp server/.env.example server/.env
   
   # Edit environment variables
   nano server/.env
   ```

4. **Initialize database**
   ```bash
   cd server
   npm run migrate
   npm run seed
   cd ..
   ```

5. **Start development servers**
   ```bash
   # Start backend server
   cd server
   npm run dev
   
   # In another terminal, start frontend
   npm run dev
   ```

## Project Structure

```
solar-group/
├── docs/                    # Documentation
│   ├── architecture.md      # System architecture
│   ├── API.md              # API documentation
│   ├── DEVELOPMENT.md      # This file
│   └── postman/            # Postman collections
├── k8s/                     # Kubernetes manifests
├── monitoring/              # Monitoring configurations
├── nginx/                   # Nginx configuration
├── scripts/                 # Utility scripts
├── server/                  # Backend application
│   ├── config/             # Configuration files
│   ├── controllers/        # Route controllers
│   ├── middleware/         # Express middleware
│   ├── models/             # Data models
│   ├── routes/             # API routes
│   ├── tests/              # Backend tests
│   └── utils/              # Utility functions
├── src/                     # Frontend source
│   ├── components/         # Reusable components
│   ├── styles/             # CSS files
│   └── app-optimized.js    # Main JavaScript file
├── tests/                   # E2E tests
├── .github/                 # GitHub Actions
├── docker-compose.yml       # Docker Compose
├── Dockerfile              # Docker configuration
├── Makefile                # Build commands
└── README.md               # Project overview
```

## Development Environment

### VS Code Setup

1. **Install recommended extensions**
   - ESLint
   - Prettier
   - GitLens
   - Docker
   - Kubernetes

2. **Configure settings**
   ```json
   {
     "editor.formatOnSave": true,
     "editor.codeActionsOnSave": {
       "source.fixAll.eslint": true
     },
     "eslint.validate": ["javascript", "html", "css"]
   }
   ```

### Environment Variables

Create a `.env` file in the `server` directory:

```env
# Server Configuration
PORT=3000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

# Database
DATABASE_PATH=./database.sqlite
DB_CONNECTION_POOL_SIZE=10

# Security
JWT_SECRET=your-super-secret-jwt-key
BCRYPT_ROUNDS=12

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Monitoring
ENABLE_MONITORING=true
METRICS_PORT=9090
```

### Database Setup

The application uses SQLite for development and testing:

```bash
# Run migrations
cd server
npm run migrate

# Seed database with test data
npm run seed

# Check migration status
npm run migrate:status
```

## Coding Standards

### JavaScript/Node.js

- Use ES6+ features
- Follow async/await patterns
- Use const/let instead of var
- Use arrow functions where appropriate
- Use template literals for strings
- Use destructuring for objects/arrays

```javascript
// Good
const { dbGet, dbRun } = require('../config/database');
const user = await dbGet('SELECT * FROM users WHERE id = ?', [userId]);

// Bad
var db = require('../config/database');
db.dbGet('SELECT * FROM users WHERE id = ?', [userId], function(err, user) {
  // callback hell
});
```

### CSS

- Use CSS custom properties (variables)
- Follow BEM methodology for class names
- Use mobile-first responsive design
- Use semantic HTML elements

```css
/* Good */
.card {
  --card-padding: 1rem;
  --card-radius: 8px;
  padding: var(--card-padding);
  border-radius: var(--card-radius);
}

.card__header {
  margin-bottom: 1rem;
}

/* Bad */
.card {
  padding: 16px;
  border-radius: 8px;
}

.cardHeader {
  margin-bottom: 16px;
}
```

### HTML

- Use semantic HTML5 elements
- Include proper ARIA attributes
- Use proper heading hierarchy
- Include alt text for images

```html
<!-- Good -->
<main role="main">
  <section aria-labelledby="projects-heading">
    <h2 id="projects-heading">Investment Projects</h2>
    <article class="project-card">
      <h3>Solar Farm Alpha</h3>
      <p>Large-scale solar farm in California</p>
    </article>
  </section>
</main>

<!-- Bad -->
<div>
  <div>
    <div>Investment Projects</div>
    <div>
      <div>Solar Farm Alpha</div>
      <div>Large-scale solar farm in California</div>
    </div>
  </div>
</div>
```

## Testing

### Backend Testing

```bash
# Run all tests
cd server
npm test

# Run specific test file
npm test -- auth.test.js

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch
```

### Frontend Testing

```bash
# Run E2E tests
npm run test:e2e

# Run E2E tests with UI
npm run test:e2e:ui

# Run E2E tests in headed mode
npm run test:e2e:headed
```

### Test Structure

```
server/tests/
├── routes/           # Route tests
├── integration/      # Integration tests
├── setup.js         # Test setup
└── globalSetup.js   # Global test setup

tests/e2e/
├── auth.spec.js     # Authentication tests
├── wallet.spec.js   # Wallet tests
└── invest.spec.js   # Investment tests
```

## Database

### Migrations

Create a new migration:

```bash
cd server
npm run migrate:create add_user_preferences
```

Edit the migration file:

```sql
-- migrations/003_add_user_preferences.sql
CREATE TABLE user_preferences (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  theme VARCHAR(20) DEFAULT 'light',
  currency VARCHAR(3) DEFAULT 'USD',
  notifications BOOLEAN DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE INDEX idx_user_preferences_user_id ON user_preferences(user_id);
```

Run migrations:

```bash
npm run migrate
```

### Database Queries

Use the database helper functions:

```javascript
const { dbGet, dbAll, dbRun } = require('../config/database');

// Get single record
const user = await dbGet('SELECT * FROM users WHERE id = ?', [userId]);

// Get multiple records
const users = await dbAll('SELECT * FROM users WHERE active = ?', [true]);

// Insert/Update/Delete
const result = await dbRun(
  'INSERT INTO users (email, name) VALUES (?, ?)',
  [email, name]
);
```

## API Development

### Creating New Routes

1. **Create route file**
   ```javascript
   // server/routes/example.js
   const express = require('express');
   const router = express.Router();
   const { authenticateToken } = require('../middleware/auth');
   const { validateExample } = require('../middleware/validation');
   
   router.get('/', authenticateToken, async (req, res) => {
     try {
       // Route logic
       res.json({ success: true, data: [] });
     } catch (error) {
       res.status(500).json({ error: error.message });
     }
   });
   
   module.exports = router;
   ```

2. **Add to server.js**
   ```javascript
   app.use('/api/example', require('./routes/example'));
   ```

3. **Add validation**
   ```javascript
   // server/middleware/validation.js
   const validateExample = [
     body('name').notEmpty().withMessage('Name is required'),
     body('email').isEmail().withMessage('Valid email is required'),
     handleValidationErrors
   ];
   ```

### Error Handling

Use the centralized error handling:

```javascript
const { errorHandler } = require('../middleware/errorHandler');

// In route
try {
  // Route logic
} catch (error) {
  next(error); // Pass to error handler
}
```

### Logging

Use structured logging:

```javascript
const { logger, auditLog } = require('../config/logger');

// Info logging
logger.info('User logged in', { userId: user.id });

// Error logging
logger.error('Database error', { error: error.message, query: sql });

// Audit logging
auditLog.userAction('investment_created', {
  userId: user.id,
  projectId: project.id,
  amount: investment.amount
});
```

## Frontend Development

### Component Development

Create reusable components:

```javascript
// src/components/Modal.js
class Modal {
  constructor(options = {}) {
    this.options = {
      title: 'Modal',
      content: '',
      ...options
    };
    this.init();
  }

  init() {
    this.create();
    this.bindEvents();
  }

  create() {
    this.element = document.createElement('div');
    this.element.className = 'modal';
    this.element.innerHTML = `
      <div class="modal-content">
        <div class="modal-header">
          <h3>${this.options.title}</h3>
          <button class="modal-close">&times;</button>
        </div>
        <div class="modal-body">
          ${this.options.content}
        </div>
      </div>
    `;
  }

  show() {
    document.body.appendChild(this.element);
    this.element.classList.add('show');
  }

  hide() {
    this.element.classList.remove('show');
    setTimeout(() => {
      if (this.element.parentNode) {
        this.element.parentNode.removeChild(this.element);
      }
    }, 300);
  }
}
```

### State Management

Use the global state manager:

```javascript
// Subscribe to state changes
solarGroupApp.stateManager.subscribe('user', (user) => {
  updateUserInterface(user);
});

// Update state
solarGroupApp.stateManager.setState({ user: newUser });
```

### API Integration

Use the API service:

```javascript
// Get data
const projects = await solarGroupApp.apiService.getProjects();

// Post data
const investment = await solarGroupApp.apiService.invest(projectId, amount);
```

## Deployment

### Local Development

```bash
# Start with Docker Compose
docker-compose up -d

# Check logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Production Deployment

```bash
# Build Docker image
docker build -t solar-group:latest .

# Deploy to Kubernetes
kubectl apply -f k8s/

# Check deployment
kubectl get pods -n solar-group
```

### Environment Configuration

Update environment variables for production:

```env
NODE_ENV=production
FRONTEND_URL=https://solar-group.com
JWT_SECRET=your-production-secret
DATABASE_PATH=/app/database.sqlite
```

## Troubleshooting

### Common Issues

1. **Database connection errors**
   ```bash
   # Check database file permissions
   ls -la server/database.sqlite
   
   # Recreate database
   rm server/database.sqlite
   cd server && npm run migrate && npm run seed
   ```

2. **Port already in use**
   ```bash
   # Find process using port
   lsof -i :3000
   
   # Kill process
   kill -9 PID
   ```

3. **Module not found errors**
   ```bash
   # Clear node_modules and reinstall
   rm -rf node_modules package-lock.json
   npm install
   ```

4. **Docker build failures**
   ```bash
   # Clean Docker cache
   docker system prune -a
   
   # Rebuild without cache
   docker build --no-cache -t solar-group:latest .
   ```

### Debug Mode

Enable debug logging:

```env
LOG_LEVEL=debug
NODE_ENV=development
```

### Performance Issues

1. **Database queries**
   ```bash
   # Check slow queries
   cd server
   npm run db:monitor
   ```

2. **Memory usage**
   ```bash
   # Check memory usage
   docker stats
   ```

3. **API performance**
   ```bash
   # Check API metrics
   curl http://localhost:3000/api/monitoring/metrics
   ```

## Best Practices

### Security

- Always validate input data
- Use parameterized queries
- Implement proper authentication
- Use HTTPS in production
- Regular security updates

### Performance

- Use database indexes
- Implement caching
- Optimize images
- Use CDN for static assets
- Monitor performance metrics

### Code Quality

- Write tests for new features
- Use meaningful variable names
- Add comments for complex logic
- Follow consistent code style
- Regular code reviews

### Documentation

- Update API documentation
- Add inline comments
- Update README files
- Document breaking changes
- Keep architecture diagrams current

## Resources

- [Node.js Documentation](https://nodejs.org/docs/)
- [Express.js Guide](https://expressjs.com/guide/)
- [SQLite Documentation](https://www.sqlite.org/docs.html)
- [Docker Documentation](https://docs.docker.com/)
- [Kubernetes Documentation](https://kubernetes.io/docs/)
- [Postman Learning Center](https://learning.postman.com/)

## Support

For development questions and issues:

- **GitHub Issues**: Create an issue on GitHub
- **Discord**: Join our developer community
- **Email**: dev-support@solar-group.com
- **Documentation**: Check the docs/ directory
