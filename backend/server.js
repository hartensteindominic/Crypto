const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const authRoutes = require('./routes/auth');
const tradingRoutes = require('./routes/trading');
const stakingRoutes = require('./routes/staking');
const lendingRoutes = require('./routes/lending');
const governanceRoutes = require('./routes/governance');
const analyticsRoutes = require('./routes/analytics');
const { initDatabase } = require('./database/init');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize database
initDatabase();

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Crypto Exchange Platform API' });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/trading', tradingRoutes);
app.use('/api/staking', stakingRoutes);
app.use('/api/lending', lendingRoutes);
app.use('/api/governance', governanceRoutes);
app.use('/api/analytics', analyticsRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

app.listen(PORT, () => {
  console.log(`Crypto Exchange Platform API running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`\nAvailable endpoints:`);
  console.log(`  - POST /api/auth/register`);
  console.log(`  - POST /api/auth/login`);
  console.log(`  - POST /api/trading/swap`);
  console.log(`  - GET  /api/trading/tokens`);
  console.log(`  - POST /api/staking/stake`);
  console.log(`  - POST /api/staking/unstake`);
  console.log(`  - GET  /api/staking/rewards`);
  console.log(`  - POST /api/lending/borrow`);
  console.log(`  - POST /api/lending/lend`);
  console.log(`  - GET  /api/governance/proposals`);
  console.log(`  - POST /api/governance/propose`);
  console.log(`  - GET  /api/analytics/portfolio`);
});

module.exports = app;
