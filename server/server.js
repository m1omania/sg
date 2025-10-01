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
app.use('/api/users', require('./routes/users'));
app.use('/api/coupons', require('./routes/coupons'));
app.use('/api/investments', require('./routes/investments'));
app.use('/api/wallet', require('./routes/wallet'));

// Serve frontend
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../index.html'));
});

app.get('/wallet', (req, res) => {
  res.sendFile(path.join(__dirname, '../wallet.html'));
});

app.get('/invest', (req, res) => {
  res.sendFile(path.join(__dirname, '../invest.html'));
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});