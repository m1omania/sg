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

// Simple auth check by cookie presence (auth or authToken)
function isAuthenticated(req) {
  const cookieHeader = req.headers.cookie || '';
  if (!cookieHeader) return false;
  const cookies = Object.fromEntries(
    cookieHeader
      .split(';')
      .map(c => c.trim())
      .filter(Boolean)
      .map(kv => {
        const i = kv.indexOf('=');
        if (i === -1) return [kv, ''];
        return [kv.slice(0, i), decodeURIComponent(kv.slice(i + 1))];
      })
  );
  return Boolean(cookies.auth || cookies.authToken);
}

// Serve frontend with auth gating
app.get('/', (req, res) => {
  if (isAuthenticated(req)) {
    return res.sendFile(path.join(__dirname, '../index.html'));
  }
  return res.sendFile(path.join(__dirname, '../landing.html'));
});

app.get('/index.html', (req, res) => {
  if (!isAuthenticated(req)) {
    return res.redirect('/landing.html');
  }
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

// Страница пакетов
app.get('/packages', (req, res) => {
  res.sendFile(path.join(__dirname, '../packages.html'));
});

// Страница оформления пакета
app.get('/checkout', (req, res) => {
  res.sendFile(path.join(__dirname, '../checkout.html'));
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});