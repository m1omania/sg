/**
 * Swagger API Documentation Annotations
 * This file contains all Swagger/OpenAPI annotations for the SolarGroup API
 */

module.exports = {
  // Authentication endpoints
  auth: {
    sendVerification: `
      /**
       * @swagger
       * /api/auth/send-verification:
       *   post:
       *     summary: Send verification code
       *     tags: [Authentication]
       *     requestBody:
       *       required: true
       *       content:
       *         application/json:
       *           schema:
       *             type: object
       *             required:
       *               - email
       *             properties:
       *               email:
       *                 type: string
       *                 format: email
       *                 example: john@example.com
       *     responses:
       *       200:
       *         description: Verification code sent successfully
       *         content:
       *           application/json:
       *             schema:
       *               type: object
       *               properties:
       *                 message:
       *                   type: string
       *                   example: Verification code sent to email
       *       400:
       *         description: Invalid email format
       *         content:
       *           application/json:
       *             schema:
       *               $ref: '#/components/schemas/Error'
       *       409:
       *         description: User already exists
       *         content:
       *           application/json:
       *             schema:
       *               $ref: '#/components/schemas/Error'
       *       429:
       *         description: Too many requests
       *         content:
       *           application/json:
       *             schema:
       *               $ref: '#/components/schemas/Error'
       */`,

    register: `
      /**
       * @swagger
       * /api/auth/register:
       *   post:
       *     summary: Register new user
       *     tags: [Authentication]
       *     requestBody:
       *       required: true
       *       content:
       *         application/json:
       *           schema:
       *             type: object
       *             required:
       *               - email
       *               - password
       *               - name
       *               - verificationCode
       *             properties:
       *               email:
       *                 type: string
       *                 format: email
       *                 example: john@example.com
       *               password:
       *                 type: string
       *                 minLength: 8
       *                 example: securePassword123
       *               name:
       *                 type: string
       *                 example: John Doe
       *               verificationCode:
       *                 type: string
       *                 example: 123456
       *     responses:
       *       201:
       *         description: User registered successfully
       *         content:
       *           application/json:
       *             schema:
       *               type: object
       *               properties:
       *                 message:
       *                   type: string
       *                   example: User registered successfully
       *                 user:
       *                   $ref: '#/components/schemas/User'
       *                 token:
       *                   type: string
       *                   example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
       *       400:
       *         description: Invalid input data
       *         content:
       *           application/json:
       *             schema:
       *               $ref: '#/components/schemas/Error'
       *       409:
       *         description: User already exists
       *         content:
       *           application/json:
       *             schema:
       *               $ref: '#/components/schemas/Error'
       *       429:
       *         description: Too many requests
       *         content:
       *           application/json:
       *             schema:
       *               $ref: '#/components/schemas/Error'
       */`,

    login: `
      /**
       * @swagger
       * /api/auth/login:
       *   post:
       *     summary: User login
       *     tags: [Authentication]
       *     requestBody:
       *       required: true
       *       content:
       *         application/json:
       *           schema:
       *             type: object
       *             required:
       *               - email
       *               - password
       *             properties:
       *               email:
       *                 type: string
       *                 format: email
       *                 example: john@example.com
       *               password:
       *                 type: string
       *                 example: securePassword123
       *     responses:
       *       200:
       *         description: Login successful
       *         content:
       *           application/json:
       *             schema:
       *               type: object
       *               properties:
       *                 message:
       *                   type: string
       *                   example: Login successful
       *                 user:
       *                   $ref: '#/components/schemas/User'
       *                 token:
       *                   type: string
       *                   example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
       *       400:
       *         description: Invalid credentials
       *         content:
       *           application/json:
       *             schema:
       *               $ref: '#/components/schemas/Error'
       *       401:
       *         description: Authentication failed
       *         content:
       *           application/json:
       *             schema:
       *               $ref: '#/components/schemas/Error'
       *       429:
       *         description: Too many requests
       *         content:
       *           application/json:
       *             schema:
       *               $ref: '#/components/schemas/Error'
       */`
  },

  // Wallet endpoints
  wallet: {
    getWallet: `
      /**
       * @swagger
       * /api/wallet/{userId}:
       *   get:
       *     summary: Get user wallet
       *     tags: [Wallet]
       *     security:
       *       - bearerAuth: []
       *       - cookieAuth: []
       *     parameters:
       *       - in: path
       *         name: userId
       *         required: true
       *         schema:
       *           type: integer
       *         example: 1
       *     responses:
       *       200:
       *         description: Wallet information retrieved successfully
       *         content:
       *           application/json:
       *             schema:
       *               $ref: '#/components/schemas/Wallet'
       *       401:
       *         description: Unauthorized
       *         content:
       *           application/json:
       *             schema:
       *               $ref: '#/components/schemas/Error'
       *       403:
       *         description: Forbidden - Access denied
       *         content:
       *           application/json:
       *             schema:
       *               $ref: '#/components/schemas/Error'
       *       404:
       *         description: Wallet not found
       *         content:
       *           application/json:
       *             schema:
       *               $ref: '#/components/schemas/Error'
       */`,

    getCoupons: `
      /**
       * @swagger
       * /api/wallet/{userId}/coupons:
       *   get:
       *     summary: Get user coupons
       *     tags: [Wallet]
       *     security:
       *       - bearerAuth: []
       *       - cookieAuth: []
       *     parameters:
       *       - in: path
       *         name: userId
       *         required: true
       *         schema:
       *           type: integer
       *         example: 1
       *     responses:
       *       200:
       *         description: User coupons retrieved successfully
       *         content:
       *           application/json:
       *             schema:
       *               type: object
       *               properties:
       *                 coupons:
       *                   type: array
       *                   items:
       *                     $ref: '#/components/schemas/Coupon'
       *       401:
       *         description: Unauthorized
       *         content:
       *           application/json:
       *             schema:
       *               $ref: '#/components/schemas/Error'
       *       403:
       *         description: Forbidden - Access denied
       *         content:
       *           application/json:
       *             schema:
       *               $ref: '#/components/schemas/Error'
       */`,

    deposit: `
      /**
       * @swagger
       * /api/wallet/{userId}/deposit:
       *   post:
       *     summary: Deposit funds to wallet
       *     tags: [Wallet]
       *     security:
       *       - bearerAuth: []
       *       - cookieAuth: []
       *     parameters:
       *       - in: path
       *         name: userId
       *         required: true
       *         schema:
       *           type: integer
       *         example: 1
       *     requestBody:
       *       required: true
       *       content:
       *         application/json:
       *           schema:
       *             type: object
       *             required:
       *               - amount
       *               - method
       *             properties:
       *               amount:
       *                 type: number
       *                 format: float
       *                 minimum: 0.01
       *                 example: 1000
       *               method:
       *                 type: string
       *                 enum: [bank_transfer, credit_card, crypto]
       *                 example: bank_transfer
       *     responses:
       *       200:
       *         description: Deposit successful
       *         content:
       *           application/json:
       *             schema:
       *               type: object
       *               properties:
       *                 message:
       *                   type: string
       *                   example: Deposit successful
       *                 transaction:
       *                   $ref: '#/components/schemas/Transaction'
       *       400:
       *         description: Invalid input data
       *         content:
       *           application/json:
       *             schema:
       *               $ref: '#/components/schemas/Error'
       *       401:
       *         description: Unauthorized
       *         content:
       *           application/json:
       *             schema:
       *               $ref: '#/components/schemas/Error'
       *       403:
       *         description: Forbidden - Access denied
       *         content:
       *           application/json:
       *             schema:
       *               $ref: '#/components/schemas/Error'
       */`
  },

  // Coupons endpoints
  coupons: {
    getActive: `
      /**
       * @swagger
       * /api/coupons/active:
       *   get:
       *     summary: Get active coupons
       *     tags: [Coupons]
       *     parameters:
       *       - in: query
       *         name: search
       *         schema:
       *           type: string
       *         description: Search term for coupon code
       *       - in: query
       *         name: page
       *         schema:
       *           type: integer
       *           default: 1
       *         description: Page number
       *       - in: query
       *         name: limit
       *         schema:
       *           type: integer
       *           default: 10
       *         description: Number of items per page
       *     responses:
       *       200:
       *         description: Active coupons retrieved successfully
       *         content:
       *           application/json:
       *             schema:
       *               type: object
       *               properties:
       *                 coupons:
       *                   type: array
       *                   items:
       *                     $ref: '#/components/schemas/Coupon'
       *                 pagination:
       *                   type: object
       *                   properties:
       *                     page:
       *                       type: integer
       *                       example: 1
       *                     limit:
       *                       type: integer
       *                       example: 10
       *                     total:
       *                       type: integer
       *                       example: 25
       *                     pages:
       *                       type: integer
       *                       example: 3
       */`,

    getHistory: `
      /**
       * @swagger
       * /api/coupons/history:
       *   get:
       *     summary: Get user coupon history
       *     tags: [Coupons]
       *     security:
       *       - bearerAuth: []
       *       - cookieAuth: []
       *     parameters:
       *       - in: query
       *         name: search
       *         schema:
       *           type: string
       *         description: Search term for coupon code
       *       - in: query
       *         name: page
       *         schema:
       *           type: integer
       *           default: 1
       *         description: Page number
       *       - in: query
       *         name: limit
       *         schema:
       *           type: integer
       *           default: 10
       *         description: Number of items per page
       *     responses:
       *       200:
       *         description: Coupon history retrieved successfully
       *         content:
       *           application/json:
       *             schema:
       *               type: object
       *               properties:
       *                 history:
       *                   type: array
       *                   items:
       *                     type: object
       *                     properties:
       *                       id:
       *                         type: integer
       *                       couponCode:
       *                         type: string
       *                       usedAt:
       *                         type: string
       *                         format: date-time
       *                       amount:
       *                         type: number
       *                         format: float
       *                 pagination:
       *                   type: object
       *                   properties:
       *                     page:
       *                       type: integer
       *                       example: 1
       *                     limit:
       *                       type: integer
       *                       example: 10
       *                     total:
       *                       type: integer
       *                       example: 5
       *                     pages:
       *                       type: integer
       *                       example: 1
       *       401:
       *         description: Unauthorized
       *         content:
       *           application/json:
       *             schema:
       *               $ref: '#/components/schemas/Error'
       */`,

    useCoupon: `
      /**
       * @swagger
       * /api/coupons/use:
       *   post:
       *     summary: Use a coupon
       *     tags: [Coupons]
       *     security:
       *       - bearerAuth: []
       *       - cookieAuth: []
       *     requestBody:
       *       required: true
       *       content:
       *         application/json:
       *           schema:
       *             type: object
       *             required:
       *               - couponId
       *             properties:
       *               couponId:
       *                 type: integer
       *                 example: 1
       *     responses:
       *       200:
       *         description: Coupon used successfully
       *         content:
       *           application/json:
       *             schema:
       *               type: object
       *               properties:
       *                 message:
       *                   type: string
       *                   example: Coupon used successfully
       *                 discount:
       *                   type: number
       *                   format: float
       *                   example: 100
       *       400:
       *         description: Invalid coupon or already used
       *         content:
       *           application/json:
       *             schema:
       *               $ref: '#/components/schemas/Error'
       *       401:
       *         description: Unauthorized
       *         content:
       *           application/json:
       *             schema:
       *               $ref: '#/components/schemas/Error'
       *       404:
       *         description: Coupon not found
       *         content:
       *           application/json:
       *             schema:
       *               $ref: '#/components/schemas/Error'
       */`,

    activatePromo: `
      /**
       * @swagger
       * /api/coupons/activate:
       *   post:
       *     summary: Activate a promo code
       *     tags: [Coupons]
       *     security:
       *       - bearerAuth: []
       *       - cookieAuth: []
       *     requestBody:
       *       required: true
       *       content:
       *         application/json:
       *           schema:
       *             type: object
       *             required:
       *               - promoCode
       *             properties:
       *               promoCode:
       *                 type: string
       *                 example: WELCOME10
       *     responses:
       *       200:
       *         description: Promo code activated successfully
       *         content:
       *           application/json:
       *             schema:
       *               type: object
       *               properties:
       *                 message:
       *                   type: string
       *                   example: Promo code activated successfully
       *                 coupon:
       *                   $ref: '#/components/schemas/Coupon'
       *       400:
       *         description: Invalid promo code
       *         content:
       *           application/json:
       *             schema:
       *               $ref: '#/components/schemas/Error'
       *       401:
       *         description: Unauthorized
       *         content:
       *           application/json:
       *             schema:
       *               $ref: '#/components/schemas/Error'
       *       404:
       *         description: Promo code not found
       *         content:
       *           application/json:
       *             schema:
       *               $ref: '#/components/schemas/Error'
       */`
  },

  // Health check endpoints
  health: {
    basic: `
      /**
       * @swagger
       * /api/health:
       *   get:
       *     summary: Basic health check
       *     tags: [Health]
       *     responses:
       *       200:
       *         description: Service is healthy
       *         content:
       *           application/json:
       *             schema:
       *               type: object
       *               properties:
       *                 status:
       *                   type: string
       *                   example: healthy
       *                 timestamp:
       *                   type: string
       *                   format: date-time
       *       503:
       *         description: Service is unhealthy
       *         content:
       *           application/json:
       *             schema:
       *               $ref: '#/components/schemas/Error'
       */`,

    detailed: `
      /**
       * @swagger
       * /api/health/detailed:
       *   get:
       *     summary: Detailed health check
       *     tags: [Health]
       *     responses:
       *       200:
       *         description: Detailed health information
       *         content:
       *           application/json:
       *             schema:
       *               $ref: '#/components/schemas/HealthCheck'
       *       503:
       *         description: Service is unhealthy
       *         content:
       *           application/json:
       *             schema:
       *               $ref: '#/components/schemas/Error'
       */`
  }
};
