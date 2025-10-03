# SolarGroup Investment Platform

A comprehensive investment platform for renewable energy projects built with modern web technologies.

## 🚀 Features

- **User Management**: Secure registration, authentication, and profile management
- **Investment Platform**: Browse and invest in renewable energy projects
- **Wallet System**: Manage funds with deposits, withdrawals, and balance tracking
- **Coupon System**: Promotional codes and discounts for investments
- **Real-time Monitoring**: Live updates on investments and project status
- **Responsive Design**: Mobile-first design with PWA capabilities
- **Security**: JWT authentication, input validation, and rate limiting
- **Monitoring**: Comprehensive logging and health checks

## 🏗️ Architecture

The platform is built with a modern, scalable architecture:

- **Frontend**: HTML5, CSS3, Vanilla JavaScript with modern ES6+ features
- **Backend**: Node.js with Express.js
- **Database**: SQLite with migrations and backup system
- **Deployment**: Docker containers with Kubernetes orchestration
- **Monitoring**: Prometheus metrics with Grafana dashboards

For detailed architecture information, see [Architecture Documentation](docs/architecture.md).

## 🛠️ Technology Stack

### Frontend
- HTML5 with semantic markup
- CSS3 with custom properties and responsive design
- Vanilla JavaScript (ES6+) with modern features
- Webpack for bundling and optimization
- PWA capabilities with service workers

### Backend
- Node.js 20+ with Express.js
- SQLite database with connection pooling
- JWT authentication with bcrypt password hashing
- Winston logging with structured logs
- Express-validator for input validation

### Infrastructure
- Docker containers for consistent deployment
- Kubernetes for orchestration and scaling
- Nginx as reverse proxy and static file server
- Prometheus for metrics collection
- Grafana for monitoring dashboards

### DevOps
- GitHub Actions for CI/CD
- Automated testing with Jest and Playwright
- Docker Compose for local development
- Terraform for infrastructure as code

## 📦 Installation

### Prerequisites

- Node.js 20 or higher
- npm 8 or higher
- Docker and Docker Compose (optional)
- Git

### Local Development

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

6. **Access the application**
   - Frontend: http://localhost:3000
   - API: http://localhost:3000/api
   - API Documentation: http://localhost:3000/api-docs

### Docker Development

1. **Start with Docker Compose**
   ```bash
   docker-compose up -d
   ```

2. **Access the application**
   - Frontend: http://localhost:3000
   - API: http://localhost:3000/api
   - Monitoring: http://localhost:3001

### Production Deployment

1. **Build Docker image**
   ```bash
   docker build -t solar-group:latest .
   ```

2. **Deploy to Kubernetes**
   ```bash
   kubectl apply -f k8s/
   ```

3. **Check deployment status**
   ```bash
   kubectl get pods -n solar-group
   ```

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the `server` directory:

```env
# Server Configuration
PORT=3000
NODE_ENV=production
FRONTEND_URL=https://solar-group.com

# Database
DATABASE_PATH=/app/database.sqlite
DB_CONNECTION_POOL_SIZE=10

# Security
JWT_SECRET=your-super-secret-jwt-key
BCRYPT_ROUNDS=12
SESSION_SECRET=your-session-secret

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Monitoring
ENABLE_MONITORING=true
METRICS_PORT=9090
ALERT_WEBHOOK_URL=https://hooks.slack.com/your-webhook

# External Services
EMAIL_SERVICE_URL=https://api.emailservice.com
SMS_SERVICE_URL=https://api.smsservice.com
PAYMENT_GATEWAY_URL=https://api.paymentgateway.com
```

### Database Configuration

The application uses SQLite with the following features:

- **Migrations**: Version-controlled database schema changes
- **Backups**: Automated backup system with rotation
- **Connection Pooling**: Efficient database connections
- **Query Optimization**: Caching and performance monitoring

## 📚 API Documentation

### Authentication

All API endpoints require authentication except for public endpoints.

#### Register User
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "securePassword123",
    "name": "John Doe",
    "verificationCode": "123456"
  }'
```

#### Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "securePassword123"
  }'
```

### Wallet Management

#### Get Wallet Balance
```bash
curl -X GET http://localhost:3000/api/wallet/1 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

#### Deposit Funds
```bash
curl -X POST http://localhost:3000/api/wallet/1/deposit \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 1000,
    "method": "bank_transfer"
  }'
```

### Investment Management

#### Get Available Projects
```bash
curl -X GET http://localhost:3000/api/projects \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

#### Make Investment
```bash
curl -X POST http://localhost:3000/api/investments \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "projectId": 1,
    "amount": 5000
  }'
```

### Coupon Management

#### Get Active Coupons
```bash
curl -X GET http://localhost:3000/api/coupons/active \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

#### Use Coupon
```bash
curl -X POST http://localhost:3000/api/coupons/use \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "couponId": 1
  }'
```

For complete API documentation, visit: http://localhost:3000/api-docs

## 🧪 Testing

### Run Tests

```bash
# Run all tests
npm test

# Run backend tests
cd server
npm test

# Run frontend tests
npm run test:e2e

# Run tests with coverage
npm run test:coverage
```

### Test Coverage

The project maintains high test coverage:

- **Unit Tests**: 90%+ coverage for backend services
- **Integration Tests**: API endpoint testing
- **E2E Tests**: Full user journey testing
- **Performance Tests**: Load and stress testing

## 📊 Monitoring

### Health Checks

- **Basic Health**: `GET /api/health`
- **Detailed Health**: `GET /api/health/detailed`
- **Metrics**: `GET /api/monitoring/metrics`

### Monitoring Dashboard

Access the monitoring dashboard at: http://localhost:3001

Features:
- Real-time system metrics
- Performance monitoring
- Error tracking
- Alert management

### Logging

The application uses structured logging with Winston:

- **Console Logs**: Development debugging
- **File Logs**: Persistent log storage
- **Audit Logs**: User action tracking
- **Error Logs**: Exception and error tracking

## 🚀 Deployment

### Docker Deployment

1. **Build image**
   ```bash
   docker build -t solar-group:latest .
   ```

2. **Run container**
   ```bash
   docker run -d -p 3000:3000 --name solar-group solar-group:latest
   ```

### Kubernetes Deployment

1. **Apply manifests**
   ```bash
   kubectl apply -f k8s/
   ```

2. **Check status**
   ```bash
   kubectl get pods -n solar-group
   ```

3. **Access application**
   ```bash
   kubectl port-forward svc/solar-group-service 3000:80 -n solar-group
   ```

### Cloud Deployment

The application is designed to run on various cloud platforms:

- **AWS**: EKS, ECS, or EC2
- **Google Cloud**: GKE or Cloud Run
- **Azure**: AKS or Container Instances
- **DigitalOcean**: Kubernetes or App Platform

## 🔒 Security

### Security Features

- **Authentication**: JWT tokens with secure storage
- **Authorization**: Role-based access control
- **Input Validation**: Comprehensive input sanitization
- **Rate Limiting**: API abuse prevention
- **Security Headers**: Helmet.js security middleware
- **HTTPS**: TLS encryption for all communications

### Security Best Practices

- Regular security updates
- Dependency vulnerability scanning
- Secure coding practices
- Regular security audits
- Incident response procedures

## 🤝 Contributing

### Development Workflow

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Make your changes**
4. **Run tests**
   ```bash
   npm test
   ```
5. **Commit your changes**
   ```bash
   git commit -m 'Add amazing feature'
   ```
6. **Push to the branch**
   ```bash
   git push origin feature/amazing-feature
   ```
7. **Open a Pull Request**

### Code Standards

- **ESLint**: JavaScript linting
- **Prettier**: Code formatting
- **Husky**: Git hooks
- **Conventional Commits**: Commit message format

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

### Getting Help

- **Documentation**: Check the [docs](docs/) directory
- **API Docs**: Visit http://localhost:3000/api-docs
- **Issues**: Create an issue on GitHub
- **Discussions**: Use GitHub Discussions for questions

### Contact

- **Email**: support@solar-group.com
- **Website**: https://solar-group.com
- **GitHub**: https://github.com/your-username/solar-group

## 🗺️ Roadmap

### Upcoming Features

- [ ] Mobile application (React Native)
- [ ] Advanced analytics dashboard
- [ ] Machine learning investment recommendations
- [ ] Blockchain integration
- [ ] Multi-language support
- [ ] Advanced reporting tools

### Performance Improvements

- [ ] Database optimization
- [ ] Caching improvements
- [ ] CDN integration
- [ ] Microservices architecture
- [ ] Event-driven architecture

## 🙏 Acknowledgments

- Express.js community for the excellent framework
- SQLite team for the reliable database
- Docker team for containerization
- Kubernetes community for orchestration
- All contributors and users

---

**SolarGroup Investment Platform** - Investing in a sustainable future 🌱