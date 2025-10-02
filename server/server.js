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

app.get('/index.html', (req, res) => {
  res.sendFile(path.join(__dirname, '../index.html'));
});

app.get('/coupons', (req, res) => {
  res.sendFile(path.join(__dirname, '../coupons.html'));
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

// Страница купонов и промокодов
app.get('/coupons.html', (req, res) => {
  res.sendFile(path.join(__dirname, '../coupons.html'));
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});