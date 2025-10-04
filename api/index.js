const express = require('express');
const path = require('path');

const app = express();

// Simplified CORS for prototype
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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

app.get('/my-investments.js', (req, res) => {
  res.sendFile(path.join(__dirname, '../my-investments.js'));
});

app.get('/invest.js', (req, res) => {
  res.sendFile(path.join(__dirname, '../invest.js'));
});

app.get('/register.js', (req, res) => {
  res.sendFile(path.join(__dirname, '../register.js'));
});

app.get('/packages.js', (req, res) => {
  res.sendFile(path.join(__dirname, '../packages.js'));
});

app.get('/coupons.js', (req, res) => {
  res.sendFile(path.join(__dirname, '../coupons.js'));
});

// Web Components standalone files
app.get('/components/web-components/header-standalone.js', (req, res) => {
  res.sendFile(path.join(__dirname, '../components/web-components/header-standalone.js'));
});

app.get('/components/web-components/header-landing.js', (req, res) => {
  res.sendFile(path.join(__dirname, '../components/web-components/header-landing.js'));
});

app.get('/components/web-components/sidebar-standalone.js', (req, res) => {
  res.sendFile(path.join(__dirname, '../components/web-components/sidebar-standalone.js'));
});

// ES6 Module versions
app.get('/components/web-components/header-module.js', (req, res) => {
  res.sendFile(path.join(__dirname, '../components/web-components/header-module.js'));
});

app.get('/components/web-components/sidebar-module.js', (req, res) => {
  res.sendFile(path.join(__dirname, '../components/web-components/sidebar-module.js'));
});

// IIFE versions
app.get('/components/web-components/header-iife.js', (req, res) => {
  res.sendFile(path.join(__dirname, '../components/web-components/header-iife.js'));
});

// Universal loader
app.get('/components/web-components/loader.js', (req, res) => {
  res.sendFile(path.join(__dirname, '../components/web-components/loader.js'));
});

// Test files
app.get('/responsive-test.html', (req, res) => {
  res.sendFile(path.join(__dirname, '../responsive-test.html'));
});

app.get('/test-layout.js', (req, res) => {
  res.sendFile(path.join(__dirname, '../test-layout.js'));
});

app.get('/layout-fix-test.html', (req, res) => {
  res.sendFile(path.join(__dirname, '../layout-fix-test.html'));
});

app.get('/gap-fix-test.html', (req, res) => {
  res.sendFile(path.join(__dirname, '../gap-fix-test.html'));
});

app.get('/sidebar-width-test.html', (req, res) => {
  res.sendFile(path.join(__dirname, '../sidebar-width-test.html'));
});

app.get('/test-header-landing.html', (req, res) => {
  res.sendFile(path.join(__dirname, '../test-header-landing.html'));
});

// Serve manifest files
app.get('/manifest.json', (req, res) => {
  res.sendFile(path.join(__dirname, '../manifest.json'));
});

// Serve logo files
app.get('/SGLogo.svg', (req, res) => {
  res.sendFile(path.join(__dirname, '../SGLogo.svg'));
});

app.get('/SGLogosmall.svg', (req, res) => {
  res.sendFile(path.join(__dirname, '../SGLogosmall.svg'));
});

app.get('/solarlogo.png', (req, res) => {
  res.sendFile(path.join(__dirname, '../solarlogo.png'));
});

app.get('/solarlogo.avif', (req, res) => {
  res.sendFile(path.join(__dirname, '../solarlogo.avif'));
});

// Health check removed for prototype

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
// Note: In Vercel serverless, this will reset on each cold start
let userBalances = {
  1: {
    main_balance: 0.00,
    partner_balance: 0.00
  }
};

// Store user investments
let userInvestments = {
  1: []
};

// Debug logging removed for prototype

// Wallet endpoints
app.get('/api/wallet/:userId', (req, res) => {
  const { userId } = req.params;
  const userIdNum = parseInt(userId);
  
  const balance = userBalances[userIdNum] || { main_balance: 0.00, partner_balance: 0.00 };
  
  // Debug logging removed for prototype
  
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
  
  // Debug logging removed for prototype
  
  if (!userId || !amount || !paymentMethod) {
    // Debug logging removed for prototype
    return res.status(400).json({ error: 'User ID, amount and payment method are required' });
  }
  
  if (isNaN(amount) || amount <= 0) {
    // Debug logging removed for prototype
    return res.status(400).json({ error: 'Amount must be a positive number' });
  }
  
  // Update user balance
  const userIdNum = parseInt(userId);
  const depositAmount = parseFloat(amount);
  
  // Debug logging removed for prototype
  
  if (!userBalances[userIdNum]) {
    userBalances[userIdNum] = { main_balance: 0.00, partner_balance: 0.00 };
  }
  
  userBalances[userIdNum].main_balance += depositAmount;
  
  // Debug logging removed for prototype
  
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
  
  // Debug logging removed for prototype
  res.json(response);
});

// Investment endpoint
app.post('/api/transactions/invest', (req, res) => {
  const { userId, packageId, amount, account, paymentType } = req.body;

  // Debug logging removed for prototype

  if (!userId || !packageId || !amount || !account) {
    // Debug logging removed for prototype
    return res.status(400).json({ error: 'User ID, package ID, amount and account are required' });
  }

  if (isNaN(amount) || amount <= 0) {
    // Debug logging removed for prototype
    return res.status(400).json({ error: 'Amount must be a positive number' });
  }

  // Update user balance (deduct investment amount)
  const userIdNum = parseInt(userId);
  const investmentAmount = parseFloat(amount);

  // Debug logging removed for prototype

  if (!userBalances[userIdNum]) {
    userBalances[userIdNum] = { main_balance: 0.00, partner_balance: 0.00 };
  }

  // Deduct from appropriate account
  if (account === 'main') {
    userBalances[userIdNum].main_balance -= investmentAmount;
  } else if (account === 'partner') {
    userBalances[userIdNum].partner_balance -= investmentAmount;
  }

  // Debug logging removed for prototype

  // Create investment record
  const investment = {
    id: Date.now(),
    userId: userIdNum,
    packageId: packageId,
    amount: investmentAmount,
    account: account,
    status: 'active',
    createdAt: new Date().toISOString(),
    transactionId: 'INV_' + Date.now()
  };

  // Store investment
  if (!userInvestments[userIdNum]) {
    userInvestments[userIdNum] = [];
  }
  userInvestments[userIdNum].push(investment);

  // Debug logging removed for prototype

  // For demo purposes, always return success
  const response = {
    success: true,
    message: 'Investment successful',
    transactionId: investment.transactionId,
    packageId: packageId,
    amount: investmentAmount,
    account: account,
    status: 'completed',
    date: new Date().toISOString()
  };

  // Debug logging removed for prototype
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

// Get user investments
app.get('/api/investments/:userId', (req, res) => {
  const { userId } = req.params;
  const userIdNum = parseInt(userId);
  
  // Debug logging removed for prototype
  
  const investments = userInvestments[userIdNum] || [];
  
  // Format investments for frontend
  const formattedInvestments = investments.map(inv => ({
    id: inv.id,
    project_name: getProjectName(inv.packageId),
    amount: inv.amount,
    final_amount: inv.amount,
    created_at: inv.createdAt,
    status: inv.status,
    transaction_id: inv.transactionId,
    account: inv.account
  }));
  
  // Debug logging removed for prototype
  res.json(formattedInvestments);
});

// Helper function to get project name from package ID
function getProjectName(packageId) {
  const projectMap = {
    'Пакет 500 $': 'Совэлмаш',
    'Пакет 1000 $': 'Совэлмаш', 
    'Пакет 250 $': 'Дирижабли'
  };
  return projectMap[packageId] || 'Неизвестный проект';
}

// Coupons endpoints
app.get('/api/coupons/active/:userId', (req, res) => {
  const { userId } = req.params;
  
  // Demo coupons data
  const demoCoupons = [
    {
      id: 1,
      code: 'WELCOME25',
      name: 'Добро пожаловать',
      description: 'Скидка для новых пользователей',
      discount: 25,
      discount_amount: 25,
      project_name: 'Любой',
      expires_at: '2025-12-31T23:59:59.000Z',
      conditions: 'Минимальная сумма $250',
      used: false,
      created_at: '2025-01-01T00:00:00.000Z'
    },
    {
      id: 2,
      code: 'INVEST50',
      name: 'Инвестиционный бонус',
      description: 'Бонус за первую инвестицию',
      discount: 50,
      discount_amount: 50,
      project_name: 'Дирижабли',
      expires_at: '2025-06-30T23:59:59.000Z',
      conditions: 'Только для проекта Дирижабли',
      used: false,
      created_at: '2025-01-15T00:00:00.000Z'
    }
  ];
  
  res.json(demoCoupons);
});

app.post('/api/coupons/activate', (req, res) => {
  const { userId, code } = req.body;
  
  if (!userId || !code) {
    return res.status(400).json({ error: 'User ID and code are required' });
  }
  
  // For demo purposes, always return success
  res.json({
    success: true,
    message: 'Coupon activated successfully',
    coupon: {
      id: 1,
      code: code,
      discount: 25.00,
      type: 'bonus'
    }
  });
});

// Use coupon endpoint
app.post('/api/coupons/use', (req, res) => {
  const { couponId, userId } = req.body;
  
  if (!couponId || !userId) {
    return res.status(400).json({ error: 'Coupon ID and User ID are required' });
  }
  
  // For demo purposes, always return success
  res.json({ 
    success: true, 
    message: 'Купон успешно использован',
    coupon: {
      id: couponId,
      used: true
    }
  });
});

// History coupons endpoint
app.get('/api/coupons/history/:userId', (req, res) => {
  const { userId } = req.params;
  
  // Demo history coupons data
  const historyCoupons = [
    {
      id: 3,
      code: 'SPRING2024',
      name: 'Весенняя акция',
      description: '20% скидка на инвестиции',
      discount: 20,
      discount_amount: 20,
      project_name: 'Ветровая станция "Ветер"',
      used_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      investment_amount: 5000,
      discount_amount: 1000,
      status: 'used',
      type: 'promo'
    },
    {
      id: 4,
      code: 'EXPIRED2024',
      name: 'Просроченный купон',
      description: '10% скидка',
      discount: 10,
      discount_amount: 10,
      project_name: 'Все проекты',
      valid_to: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'expired',
      type: 'promo'
    },
    {
      id: 5,
      code: 'BONUS15',
      name: 'Бонус 15%',
      description: '15% скидка на первую инвестицию',
      discount: 15,
      discount_amount: 15,
      project_name: 'Солнечные панели',
      used_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
      investment_amount: 2000,
      discount_amount: 300,
      status: 'used',
      type: 'bonus'
    }
  ];
  
  res.json(historyCoupons);
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

// Simple error handler for prototype
app.use((err, req, res, next) => {
  res.status(500).json({ error: 'Server error' });
});

// Export for Vercel
module.exports = app;
