const express = require('express');
const path = require('path');
const cors = require('cors');
const db = require('./config/database');
const health = require('./health');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../')));

// Health check endpoint for Render
app.get('/health', health);

// API routes
app.use('/api/auth', require('./routes/auth'));
app.post('/login', (req, res) => {
    const { username, password } = req.body;

    // Простая проверка учетных данных (в реальном приложении используйте базу данных и безопасное сравнение паролей)
    if (username === 'user' && password === 'password') {
        res.json({ success: true, message: 'Authentication successful' });
    } else {
        res.status(401).json({ success: false, message: 'Authentication failed' });
    }
});
app.use('/api/users', require('./routes/users'));
app.use('/api/coupons', require('./routes/coupons'));
app.use('/api/investments', require('./routes/investments'));
app.use('/api/wallet', require('./routes/wallet'));
app.use('/api/projects', require('./routes/projects'));
app.use('/api/transactions', require('./routes/transactions'));

// Serve frontend
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../landing.html'));
});

app.get('/wallet', (req, res) => {
  res.sendFile(path.join(__dirname, '../wallet.html'));
});

app.get('/invest', (req, res) => {
  res.sendFile(path.join(__dirname, '../invest.html'));
});

// Новая страница регистрации
app.get('/register', (req, res) => {
  res.sendFile(path.join(__dirname, '../register.html'));
});

// Новая страница пополнения счета
app.get('/deposit', (req, res) => {
  res.sendFile(path.join(__dirname, '../deposit.html'));
});

// Новая страница проектов
app.get('/projects', (req, res) => {
  res.sendFile(path.join(__dirname, '../projects.html'));
});

// Новая страница моих инвестиций
app.get('/my-investments', (req, res) => {
  res.sendFile(path.join(__dirname, '../my-investments.html'));
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});