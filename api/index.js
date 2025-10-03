const express = require('express');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const app = express();

// Basic security middleware
app.use(helmet());

// CORS
app.use(cors({
  origin: '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api', limiter);

// Static files
app.use(express.static(path.join(__dirname, '../')));

// Serve CSS files
app.get('/style.css', (req, res) => {
  res.sendFile(path.join(__dirname, '../style.css'));
});

// Serve JS files
app.get('/app.js', (req, res) => {
  res.sendFile(path.join(__dirname, '../app.js'));
});

app.get('/deposit.js', (req, res) => {
  res.sendFile(path.join(__dirname, '../deposit.js'));
});

app.get('/dashboard.js', (req, res) => {
  res.sendFile(path.join(__dirname, '../dashboard.js'));
});

app.get('/wallet.js', (req, res) => {
  res.sendFile(path.join(__dirname, '../wallet.js'));
});

app.get('/checkout.js', (req, res) => {
  res.sendFile(path.join(__dirname, '../checkout.js'));
});

// Serve manifest files
app.get('/manifest.json', (req, res) => {
  res.sendFile(path.join(__dirname, '../manifest.json'));
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'production'
  });
});

// Basic API routes
app.get('/api/projects', (req, res) => {
  res.json([
    {
      id: 1,
      name: "Дирижабли",
      description: "Инвестируйте в инновационные проекты воздушных дирижаблей. Современные технологии и экологичный транспорт будущего.",
      image_url: "/images/airships.jpg",
      min_investment: 500,
      interest_rate: 12,
      duration: 36,
      status: "active",
      created_at: "2025-10-03 10:48:32"
    },
    {
      id: 2,
      name: "Совэлмаш",
      description: "Инвестируйте в развитие современного машиностроительного завода. Перспективный проект с высокой отдачей.",
      image_url: "/images/sovelmash.jpg",
      min_investment: 1000,
      interest_rate: 15,
      duration: 60,
      status: "active",
      created_at: "2025-10-03 10:48:32"
    },
    {
      id: 3,
      name: "Солнечные панели",
      description: "Инвестируйте в развитие солнечной энергетики. Проект по установке солнечных панелей в жилых комплексах.",
      image_url: "/images/solar.jpg",
      min_investment: 250,
      interest_rate: 10,
      duration: 24,
      status: "active",
      created_at: "2025-10-03 10:48:32"
    }
  ]);
});

app.get('/api/projects/:id', (req, res) => {
  const { id } = req.params;
  const projects = [
    {
      id: 1,
      name: "Дирижабли",
      description: "Инвестируйте в инновационные проекты воздушных дирижаблей. Современные технологии и экологичный транспорт будущего.",
      image_url: "/images/airships.jpg",
      min_investment: 500,
      interest_rate: 12,
      duration: 36,
      status: "active",
      created_at: "2025-10-03 10:48:32"
    },
    {
      id: 2,
      name: "Совэлмаш",
      description: "Инвестируйте в развитие современного машиностроительного завода. Перспективный проект с высокой отдачей.",
      image_url: "/images/sovelmash.jpg",
      min_investment: 1000,
      interest_rate: 15,
      duration: 60,
      status: "active",
      created_at: "2025-10-03 10:48:32"
    },
    {
      id: 3,
      name: "Солнечные панели",
      description: "Инвестируйте в развитие солнечной энергетики. Проект по установке солнечных панелей в жилых комплексах.",
      image_url: "/images/solar.jpg",
      min_investment: 250,
      interest_rate: 10,
      duration: 24,
      status: "active",
      created_at: "2025-10-03 10:48:32"
    }
  ];
  
  const project = projects.find(p => p.id === parseInt(id));
  if (!project) {
    return res.status(404).json({ error: 'Project not found' });
  }
  
  res.json(project);
});

// Auth endpoints
app.post('/api/auth/logout', (req, res) => {
  res.json({ message: 'Logged out successfully' });
});

// Registration endpoints
app.post('/api/auth/send-code', (req, res) => {
  const { email } = req.body;
  
  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }
  
  // For demo purposes, always return success
  res.json({ 
    message: 'Code sent successfully',
    demoCode: '123456' // Demo code for testing
  });
});

// Alternative endpoint name that frontend might be using
app.post('/api/auth/send-verification', (req, res) => {
  const { email } = req.body;
  
  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }
  
  // For demo purposes, always return success
  res.json({ 
    message: 'Verification code sent successfully',
    demoCode: '123456' // Demo code for testing
  });
});

app.post('/api/auth/verify-code', (req, res) => {
  const { email, code } = req.body;
  
  if (!email || !code) {
    return res.status(400).json({ error: 'Email and code are required' });
  }
  
  // For demo purposes, accept code 123456
  if (code === '123456') {
    res.json({ 
      message: 'Code verified successfully',
      token: 'demo-token-' + Date.now(),
      user: {
        id: 1,
        email: email,
        username: 'demo_user_' + Date.now()
      }
    });
  } else {
    res.status(400).json({ error: 'Invalid verification code' });
  }
});

app.post('/api/auth/register', (req, res) => {
  const { email, password, code } = req.body;
  
  // For demo purposes, we only require email and code
  if (!email || !code) {
    return res.status(400).json({ error: 'Email and code are required' });
  }
  
  // For demo purposes, accept code 123456
  if (code === '123456') {
    res.json({ 
      message: 'User registered successfully',
      user: {
        id: 1,
        email: email,
        username: 'user_' + Date.now(),
        emailVerified: true
      },
      token: 'demo-token-' + Date.now()
    });
  } else {
    res.status(400).json({ error: 'Invalid verification code' });
  }
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }
  
  // For demo purposes, accept any email/password
  res.json({ 
    message: 'Login successful',
    user: {
      id: 1,
      email: email,
      username: 'user_' + Date.now(),
      emailVerified: true
    },
    token: 'demo-token-' + Date.now()
  });
});

// Simple in-memory storage for demo purposes
let userBalances = {
  1: {
    main_balance: 0.00,
    partner_balance: 0.00
  }
};

// Wallet endpoints
app.get('/api/wallet/:userId', (req, res) => {
  const { userId } = req.params;
  const userIdNum = parseInt(userId);
  
  const balance = userBalances[userIdNum] || { main_balance: 0.00, partner_balance: 0.00 };
  
  res.json({
    id: userIdNum,
    main_balance: balance.main_balance,
    partner_balance: balance.partner_balance,
    currency: 'USD',
    lastUpdated: new Date().toISOString()
  });
});

app.post('/api/wallet/:userId/deposit', (req, res) => {
  const { userId } = req.params;
  const { amount, type } = req.body;
  
  res.json({
    message: 'Deposit successful',
    transactionId: 'tx_' + Date.now(),
    amount: amount,
    type: type,
    newBalance: amount
  });
});

app.get('/api/wallet/:userId/transactions', (req, res) => {
  const { userId } = req.params;
  
  res.json([
    {
      id: 1,
      type: 'deposit',
      amount: 100.00,
      currency: 'USD',
      status: 'completed',
      date: new Date().toISOString()
    }
  ]);
});

// Transactions endpoints
app.post('/api/transactions/deposit', (req, res) => {
  const { userId, amount, paymentMethod } = req.body;
  
  console.log('Deposit request:', { userId, amount, paymentMethod });
  
  if (!userId || !amount || !paymentMethod) {
    console.log('Missing required fields');
    return res.status(400).json({ error: 'User ID, amount and payment method are required' });
  }
  
  if (isNaN(amount) || amount <= 0) {
    console.log('Invalid amount:', amount);
    return res.status(400).json({ error: 'Amount must be a positive number' });
  }
  
  // Update user balance
  const userIdNum = parseInt(userId);
  const depositAmount = parseFloat(amount);
  
  if (!userBalances[userIdNum]) {
    userBalances[userIdNum] = { main_balance: 0.00, partner_balance: 0.00 };
  }
  
  userBalances[userIdNum].main_balance += depositAmount;
  
  console.log('Updated balance for user', userIdNum, ':', userBalances[userIdNum]);
  
  // For demo purposes, always return success
  const response = {
    success: true,
    message: 'Deposit successful',
    transactionId: 'tx_' + Date.now(),
    amount: depositAmount,
    paymentMethod: paymentMethod,
    status: 'completed',
    date: new Date().toISOString()
  };
  
  console.log('Deposit response:', response);
  res.json(response);
});

app.get('/api/transactions/:userId', (req, res) => {
  const { userId } = req.params;
  
  res.json([
    {
      id: 1,
      type: 'deposit',
      amount: 100.00,
      currency: 'USD',
      status: 'completed',
      paymentMethod: 'card',
      date: new Date().toISOString()
    },
    {
      id: 2,
      type: 'withdrawal',
      amount: 50.00,
      currency: 'USD',
      status: 'pending',
      paymentMethod: 'bank',
      date: new Date().toISOString()
    }
  ]);
});

// Serve landing.html for root path (default for unauthenticated users)
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../landing.html'));
});

// Serve index.html for authenticated users
app.get('/index.html', (req, res) => {
  res.sendFile(path.join(__dirname, '../index.html'));
});

// Serve other HTML pages
app.get('/landing.html', (req, res) => {
  res.sendFile(path.join(__dirname, '../landing.html'));
});

app.get('/register.html', (req, res) => {
  res.sendFile(path.join(__dirname, '../register.html'));
});

app.get('/projects.html', (req, res) => {
  res.sendFile(path.join(__dirname, '../projects.html'));
});

app.get('/invest.html', (req, res) => {
  res.sendFile(path.join(__dirname, '../invest.html'));
});

app.get('/wallet.html', (req, res) => {
  res.sendFile(path.join(__dirname, '../wallet.html'));
});

app.get('/my-investments.html', (req, res) => {
  res.sendFile(path.join(__dirname, '../my-investments.html'));
});

app.get('/deposit.html', (req, res) => {
  res.sendFile(path.join(__dirname, '../deposit.html'));
});

app.get('/checkout.html', (req, res) => {
  res.sendFile(path.join(__dirname, '../checkout.html'));
});

app.get('/packages.html', (req, res) => {
  res.sendFile(path.join(__dirname, '../packages.html'));
});

app.get('/coupons.html', (req, res) => {
  res.sendFile(path.join(__dirname, '../coupons.html'));
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Export for Vercel
module.exports = app;
