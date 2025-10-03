const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'SolarGroup Investment Platform API',
      version: '1.0.0',
      description: 'A comprehensive API for managing renewable energy investments',
      contact: {
        name: 'SolarGroup API Support',
        email: 'api-support@solar-group.com',
        url: 'https://solar-group.com/support'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: [
      {
        url: 'http://localhost:3000/api',
        description: 'Development server'
      },
      {
        url: 'https://api.solar-group.com/api',
        description: 'Production server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        },
        cookieAuth: {
          type: 'apiKey',
          in: 'cookie',
          name: 'authToken'
        }
      },
      schemas: {
        User: {
          type: 'object',
          required: ['id', 'email', 'name'],
          properties: {
            id: {
              type: 'integer',
              description: 'User ID',
              example: 1
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'User email address',
              example: 'john@example.com'
            },
            name: {
              type: 'string',
              description: 'User full name',
              example: 'John Doe'
            },
            avatar: {
              type: 'string',
              format: 'uri',
              description: 'User avatar URL',
              example: 'https://example.com/avatar.jpg'
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'User creation timestamp'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'User last update timestamp'
            }
          }
        },
        Wallet: {
          type: 'object',
          required: ['id', 'userId', 'balance'],
          properties: {
            id: {
              type: 'integer',
              description: 'Wallet ID',
              example: 1
            },
            userId: {
              type: 'integer',
              description: 'User ID',
              example: 1
            },
            balance: {
              type: 'number',
              format: 'float',
              description: 'Wallet balance in USD',
              example: 10000.50
            },
            currency: {
              type: 'string',
              description: 'Wallet currency',
              example: 'USD'
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Wallet creation timestamp'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Wallet last update timestamp'
            }
          }
        },
        Project: {
          type: 'object',
          required: ['id', 'name', 'description', 'expectedReturn', 'minInvestment', 'duration'],
          properties: {
            id: {
              type: 'integer',
              description: 'Project ID',
              example: 1
            },
            name: {
              type: 'string',
              description: 'Project name',
              example: 'Solar Farm Alpha'
            },
            description: {
              type: 'string',
              description: 'Project description',
              example: 'Large-scale solar farm in California'
            },
            expectedReturn: {
              type: 'number',
              format: 'float',
              description: 'Expected annual return percentage',
              example: 12.5
            },
            minInvestment: {
              type: 'number',
              format: 'float',
              description: 'Minimum investment amount',
              example: 1000
            },
            maxInvestment: {
              type: 'number',
              format: 'float',
              description: 'Maximum investment amount',
              example: 100000
            },
            duration: {
              type: 'integer',
              description: 'Project duration in months',
              example: 60
            },
            status: {
              type: 'string',
              enum: ['active', 'funded', 'completed', 'cancelled'],
              description: 'Project status',
              example: 'active'
            },
            totalFunding: {
              type: 'number',
              format: 'float',
              description: 'Total funding raised',
              example: 2500000
            },
            targetFunding: {
              type: 'number',
              format: 'float',
              description: 'Target funding amount',
              example: 5000000
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Project creation timestamp'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Project last update timestamp'
            }
          }
        },
        Investment: {
          type: 'object',
          required: ['id', 'userId', 'projectId', 'amount'],
          properties: {
            id: {
              type: 'integer',
              description: 'Investment ID',
              example: 1
            },
            userId: {
              type: 'integer',
              description: 'User ID',
              example: 1
            },
            projectId: {
              type: 'integer',
              description: 'Project ID',
              example: 1
            },
            amount: {
              type: 'number',
              format: 'float',
              description: 'Investment amount',
              example: 5000
            },
            status: {
              type: 'string',
              enum: ['pending', 'active', 'completed', 'cancelled'],
              description: 'Investment status',
              example: 'active'
            },
            expectedReturn: {
              type: 'number',
              format: 'float',
              description: 'Expected return amount',
              example: 6250
            },
            actualReturn: {
              type: 'number',
              format: 'float',
              description: 'Actual return amount',
              example: 0
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Investment creation timestamp'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Investment last update timestamp'
            }
          }
        },
        Coupon: {
          type: 'object',
          required: ['id', 'code', 'type', 'value', 'status'],
          properties: {
            id: {
              type: 'integer',
              description: 'Coupon ID',
              example: 1
            },
            code: {
              type: 'string',
              description: 'Coupon code',
              example: 'WELCOME10'
            },
            type: {
              type: 'string',
              enum: ['percentage', 'fixed'],
              description: 'Coupon type',
              example: 'percentage'
            },
            value: {
              type: 'number',
              format: 'float',
              description: 'Coupon value',
              example: 10
            },
            minAmount: {
              type: 'number',
              format: 'float',
              description: 'Minimum amount for coupon usage',
              example: 1000
            },
            maxDiscount: {
              type: 'number',
              format: 'float',
              description: 'Maximum discount amount',
              example: 500
            },
            status: {
              type: 'string',
              enum: ['active', 'inactive', 'expired'],
              description: 'Coupon status',
              example: 'active'
            },
            validFrom: {
              type: 'string',
              format: 'date-time',
              description: 'Coupon valid from date'
            },
            validTo: {
              type: 'string',
              format: 'date-time',
              description: 'Coupon valid to date'
            },
            usageLimit: {
              type: 'integer',
              description: 'Maximum usage limit',
              example: 100
            },
            usedCount: {
              type: 'integer',
              description: 'Number of times used',
              example: 25
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Coupon creation timestamp'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Coupon last update timestamp'
            }
          }
        },
        Transaction: {
          type: 'object',
          required: ['id', 'userId', 'type', 'amount', 'status'],
          properties: {
            id: {
              type: 'integer',
              description: 'Transaction ID',
              example: 1
            },
            userId: {
              type: 'integer',
              description: 'User ID',
              example: 1
            },
            type: {
              type: 'string',
              enum: ['deposit', 'withdrawal', 'investment', 'return', 'refund'],
              description: 'Transaction type',
              example: 'deposit'
            },
            amount: {
              type: 'number',
              format: 'float',
              description: 'Transaction amount',
              example: 1000
            },
            status: {
              type: 'string',
              enum: ['pending', 'completed', 'failed', 'cancelled'],
              description: 'Transaction status',
              example: 'completed'
            },
            method: {
              type: 'string',
              enum: ['bank_transfer', 'credit_card', 'crypto', 'investment', 'return'],
              description: 'Transaction method',
              example: 'bank_transfer'
            },
            reference: {
              type: 'string',
              description: 'Transaction reference',
              example: 'TXN123456789'
            },
            description: {
              type: 'string',
              description: 'Transaction description',
              example: 'Deposit via bank transfer'
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Transaction creation timestamp'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Transaction last update timestamp'
            }
          }
        },
        Error: {
          type: 'object',
          required: ['error', 'message'],
          properties: {
            error: {
              type: 'string',
              description: 'Error type',
              example: 'ValidationError'
            },
            message: {
              type: 'string',
              description: 'Error message',
              example: 'Invalid input data'
            },
            details: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  field: {
                    type: 'string',
                    description: 'Field name',
                    example: 'email'
                  },
                  message: {
                    type: 'string',
                    description: 'Field error message',
                    example: 'Invalid email format'
                  }
                }
              }
            },
            timestamp: {
              type: 'string',
              format: 'date-time',
              description: 'Error timestamp'
            },
            path: {
              type: 'string',
              description: 'Request path',
              example: '/api/users'
            }
          }
        },
        HealthCheck: {
          type: 'object',
          required: ['status', 'timestamp'],
          properties: {
            status: {
              type: 'string',
              enum: ['healthy', 'degraded', 'unhealthy'],
              description: 'System health status',
              example: 'healthy'
            },
            timestamp: {
              type: 'string',
              format: 'date-time',
              description: 'Health check timestamp'
            },
            uptime: {
              type: 'number',
              description: 'System uptime in seconds',
              example: 3600
            },
            version: {
              type: 'string',
              description: 'Application version',
              example: '1.0.0'
            },
            database: {
              type: 'object',
              properties: {
                status: {
                  type: 'string',
                  enum: ['connected', 'disconnected', 'error'],
                  example: 'connected'
                },
                responseTime: {
                  type: 'number',
                  description: 'Database response time in ms',
                  example: 15
                }
              }
            },
            memory: {
              type: 'object',
              properties: {
                used: {
                  type: 'number',
                  description: 'Used memory in MB',
                  example: 128
                },
                total: {
                  type: 'number',
                  description: 'Total memory in MB',
                  example: 512
                },
                percentage: {
                  type: 'number',
                  description: 'Memory usage percentage',
                  example: 25
                }
              }
            }
          }
        }
      }
    },
    security: [
      {
        bearerAuth: []
      },
      {
        cookieAuth: []
      }
    ]
  },
  apis: [
    './routes/*.js',
    './server.js'
  ]
};

const specs = swaggerJsdoc(options);

module.exports = {
  swaggerUi,
  specs
};
