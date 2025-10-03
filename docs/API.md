# SolarGroup Investment Platform API Documentation

## Overview

The SolarGroup Investment Platform API provides a comprehensive RESTful interface for managing renewable energy investments. The API is built with Node.js and Express.js, featuring JWT authentication, input validation, and comprehensive error handling.

## Base URL

- **Development**: `http://localhost:3000/api`
- **Production**: `https://api.solar-group.com/api`

## Authentication

The API uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:

```bash
Authorization: Bearer YOUR_JWT_TOKEN
```

### Getting a Token

1. Register a new user or login
2. The API will return a JWT token
3. Include this token in subsequent requests

## Response Format

All API responses follow a consistent format:

### Success Response
```json
{
  "success": true,
  "data": {
    // Response data
  },
  "message": "Operation successful"
}
```

### Error Response
```json
{
  "success": false,
  "error": "Error type",
  "message": "Error description",
  "details": {
    "field": "Specific field error"
  },
  "timestamp": "2024-01-01T00:00:00.000Z",
  "path": "/api/endpoint"
}
```

## Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict
- `429` - Too Many Requests
- `500` - Internal Server Error

## Rate Limiting

The API implements rate limiting to prevent abuse:

- **General API**: 100 requests per 15 minutes
- **Authentication**: 5 attempts per 15 minutes
- **Registration**: 3 attempts per 15 minutes

## Endpoints

### Authentication

#### POST /auth/send-verification

Send verification code to email address.

**Request Body:**
```json
{
  "email": "john@example.com"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Verification code sent to email"
}
```

#### POST /auth/register

Register a new user.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "securePassword123",
  "name": "John Doe",
  "verificationCode": "123456"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": 1,
      "email": "john@example.com",
      "name": "John Doe",
      "createdAt": "2024-01-01T00:00:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

#### POST /auth/login

Authenticate user and get JWT token.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "securePassword123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": 1,
      "email": "john@example.com",
      "name": "John Doe"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### Wallet Management

#### GET /wallet/{userId}

Get user wallet information.

**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "userId": 1,
    "balance": 10000.50,
    "currency": "USD",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

#### GET /wallet/{userId}/coupons

Get user's coupon history.

**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN
```

**Query Parameters:**
- `search` (optional): Search term for coupon code
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)

**Response:**
```json
{
  "success": true,
  "data": {
    "coupons": [
      {
        "id": 1,
        "code": "WELCOME10",
        "type": "percentage",
        "value": 10,
        "usedAt": "2024-01-01T00:00:00.000Z",
        "amount": 100
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 5,
      "pages": 1
    }
  }
}
```

#### POST /wallet/{userId}/deposit

Deposit funds to user wallet.

**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json
```

**Request Body:**
```json
{
  "amount": 1000,
  "method": "bank_transfer"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Deposit successful",
  "data": {
    "transaction": {
      "id": 1,
      "userId": 1,
      "type": "deposit",
      "amount": 1000,
      "status": "completed",
      "method": "bank_transfer",
      "reference": "TXN123456789",
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

### Investment Management

#### GET /investments/{userId}

Get user's investment history.

**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN
```

**Query Parameters:**
- `status` (optional): Filter by investment status
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)

**Response:**
```json
{
  "success": true,
  "data": {
    "investments": [
      {
        "id": 1,
        "userId": 1,
        "projectId": 1,
        "amount": 5000,
        "status": "active",
        "expectedReturn": 6250,
        "actualReturn": 0,
        "createdAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 1,
      "pages": 1
    }
  }
}
```

#### POST /investments

Create a new investment.

**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json
```

**Request Body:**
```json
{
  "projectId": 1,
  "amount": 5000
}
```

**Response:**
```json
{
  "success": true,
  "message": "Investment created successfully",
  "data": {
    "investment": {
      "id": 1,
      "userId": 1,
      "projectId": 1,
      "amount": 5000,
      "status": "active",
      "expectedReturn": 6250,
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

### Project Management

#### GET /projects

Get available investment projects.

**Query Parameters:**
- `status` (optional): Filter by project status
- `search` (optional): Search term for project name
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)

**Response:**
```json
{
  "success": true,
  "data": {
    "projects": [
      {
        "id": 1,
        "name": "Solar Farm Alpha",
        "description": "Large-scale solar farm in California",
        "expectedReturn": 12.5,
        "minInvestment": 1000,
        "maxInvestment": 100000,
        "duration": 60,
        "status": "active",
        "totalFunding": 2500000,
        "targetFunding": 5000000,
        "createdAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 5,
      "pages": 1
    }
  }
}
```

#### GET /projects/{projectId}

Get specific project details.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Solar Farm Alpha",
    "description": "Large-scale solar farm in California with 20-year projected returns",
    "expectedReturn": 12.5,
    "minInvestment": 1000,
    "maxInvestment": 100000,
    "duration": 60,
    "status": "active",
    "totalFunding": 2500000,
    "targetFunding": 5000000,
    "fundingPercentage": 50,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### Coupon Management

#### GET /coupons/active

Get active coupons available for use.

**Query Parameters:**
- `search` (optional): Search term for coupon code
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)

**Response:**
```json
{
  "success": true,
  "data": {
    "coupons": [
      {
        "id": 1,
        "code": "WELCOME10",
        "type": "percentage",
        "value": 10,
        "minAmount": 1000,
        "maxDiscount": 500,
        "status": "active",
        "validFrom": "2024-01-01T00:00:00.000Z",
        "validTo": "2024-12-31T23:59:59.999Z",
        "usageLimit": 100,
        "usedCount": 25
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 5,
      "pages": 1
    }
  }
}
```

#### POST /coupons/use

Use a coupon for investment.

**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json
```

**Request Body:**
```json
{
  "couponId": 1
}
```

**Response:**
```json
{
  "success": true,
  "message": "Coupon used successfully",
  "data": {
    "discount": 100,
    "coupon": {
      "id": 1,
      "code": "WELCOME10",
      "type": "percentage",
      "value": 10
    }
  }
}
```

#### POST /coupons/activate

Activate a promo code.

**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json
```

**Request Body:**
```json
{
  "promoCode": "WELCOME10"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Promo code activated successfully",
  "data": {
    "coupon": {
      "id": 1,
      "code": "WELCOME10",
      "type": "percentage",
      "value": 10,
      "minAmount": 1000,
      "maxDiscount": 500
    }
  }
}
```

### Transaction Management

#### GET /transactions/{userId}

Get user's transaction history.

**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN
```

**Query Parameters:**
- `type` (optional): Filter by transaction type
- `status` (optional): Filter by transaction status
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)

**Response:**
```json
{
  "success": true,
  "data": {
    "transactions": [
      {
        "id": 1,
        "userId": 1,
        "type": "deposit",
        "amount": 1000,
        "status": "completed",
        "method": "bank_transfer",
        "reference": "TXN123456789",
        "description": "Deposit via bank transfer",
        "createdAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 5,
      "pages": 1
    }
  }
}
```

### Health & Monitoring

#### GET /health

Basic health check endpoint.

**Response:**
```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "timestamp": "2024-01-01T00:00:00.000Z",
    "uptime": 3600,
    "version": "1.0.0"
  }
}
```

#### GET /health/detailed

Detailed health check with system information.

**Response:**
```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "timestamp": "2024-01-01T00:00:00.000Z",
    "uptime": 3600,
    "version": "1.0.0",
    "database": {
      "status": "connected",
      "responseTime": 15
    },
    "memory": {
      "used": 128,
      "total": 512,
      "percentage": 25
    },
    "cpu": {
      "usage": 15.5
    }
  }
}
```

#### GET /monitoring/metrics

Get system performance metrics.

**Response:**
```json
{
  "success": true,
  "data": {
    "requests": {
      "total": 1000,
      "successful": 950,
      "failed": 50,
      "rate": 10.5
    },
    "responseTime": {
      "average": 150,
      "p95": 300,
      "p99": 500
    },
    "database": {
      "queries": 500,
      "averageTime": 25,
      "slowQueries": 5
    },
    "memory": {
      "used": 128,
      "total": 512,
      "percentage": 25
    }
  }
}
```

## Error Handling

The API provides comprehensive error handling with detailed error messages:

### Validation Errors
```json
{
  "success": false,
  "error": "ValidationError",
  "message": "Invalid input data",
  "details": {
    "email": "Invalid email format",
    "password": "Password must be at least 8 characters"
  },
  "timestamp": "2024-01-01T00:00:00.000Z",
  "path": "/api/auth/register"
}
```

### Authentication Errors
```json
{
  "success": false,
  "error": "UnauthorizedError",
  "message": "Invalid credentials",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "path": "/api/auth/login"
}
```

### Rate Limit Errors
```json
{
  "success": false,
  "error": "RateLimitError",
  "message": "Too many requests",
  "retryAfter": 900,
  "timestamp": "2024-01-01T00:00:00.000Z",
  "path": "/api/auth/login"
}
```

## SDKs and Libraries

### JavaScript/Node.js
```javascript
const axios = require('axios');

const api = axios.create({
  baseURL: 'http://localhost:3000/api',
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

// Get user wallet
const wallet = await api.get('/wallet/1');

// Make investment
const investment = await api.post('/investments', {
  projectId: 1,
  amount: 5000
});
```

### Python
```python
import requests

headers = {
    'Authorization': f'Bearer {token}',
    'Content-Type': 'application/json'
}

# Get user wallet
response = requests.get('http://localhost:3000/api/wallet/1', headers=headers)
wallet = response.json()

# Make investment
investment_data = {
    'projectId': 1,
    'amount': 5000
}
response = requests.post('http://localhost:3000/api/investments', 
                        json=investment_data, headers=headers)
investment = response.json()
```

### cURL Examples

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

#### Get Wallet
```bash
curl -X GET http://localhost:3000/api/wallet/1 \
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

## Testing

### Postman Collection

A Postman collection is available for testing the API:

1. Import the collection from `docs/postman/SolarGroup-API.postman_collection.json`
2. Set the base URL to your API endpoint
3. Configure authentication tokens
4. Run the collection to test all endpoints

### API Testing

```bash
# Test health endpoint
curl http://localhost:3000/api/health

# Test authentication
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "password123"}'
```

## Support

For API support and questions:

- **Documentation**: Visit http://localhost:3000/api-docs
- **Issues**: Create an issue on GitHub
- **Email**: api-support@solar-group.com
- **Discord**: Join our developer community

## Changelog

### Version 1.0.0
- Initial API release
- User authentication and registration
- Wallet management
- Investment platform
- Coupon system
- Transaction tracking
- Health monitoring
