const express = require('express');
const router = express.Router();
const { getDatabase } = require('../database/init');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_here';

/**
 * Register new user
 */
router.post('/register', (req, res) => {
  const { walletAddress, email, username } = req.body;

  if (!walletAddress) {
    return res.status(400).json({ error: 'Wallet address is required' });
  }

  const db = getDatabase();
  
  db.run(
    'INSERT INTO users (wallet_address, email, username) VALUES (?, ?, ?)',
    [walletAddress.toLowerCase(), email, username],
    function(err) {
      if (err) {
        if (err.message.includes('UNIQUE')) {
          return res.status(400).json({ error: 'Wallet address already registered' });
        }
        return res.status(500).json({ error: 'Database error' });
      }

      const token = jwt.sign({ userId: this.lastID, walletAddress }, JWT_SECRET, {
        expiresIn: '7d'
      });

      res.json({
        message: 'User registered successfully',
        userId: this.lastID,
        token
      });
    }
  );

  db.close();
});

/**
 * Login user
 */
router.post('/login', (req, res) => {
  const { walletAddress } = req.body;

  if (!walletAddress) {
    return res.status(400).json({ error: 'Wallet address is required' });
  }

  const db = getDatabase();
  
  db.get(
    'SELECT * FROM users WHERE wallet_address = ?',
    [walletAddress.toLowerCase()],
    (err, user) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      const token = jwt.sign({ userId: user.id, walletAddress }, JWT_SECRET, {
        expiresIn: '7d'
      });

      res.json({
        message: 'Login successful',
        user: {
          id: user.id,
          walletAddress: user.wallet_address,
          email: user.email,
          username: user.username,
          kycStatus: user.kyc_status,
          premiumAccount: user.premium_account === 1
        },
        token
      });
    }
  );

  db.close();
});

/**
 * Submit KYC information
 */
router.post('/kyc', authenticateToken, (req, res) => {
  const { fullName, dateOfBirth, country, idDocument } = req.body;
  const userId = req.user.userId;

  // In production, integrate with KYC service provider
  // For now, just update status to 'pending'

  const db = getDatabase();
  
  db.run(
    'UPDATE users SET kyc_status = ? WHERE id = ?',
    ['verified', userId], // For demo purposes, auto-verify
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      res.json({
        message: 'KYC information submitted successfully',
        status: 'verified'
      });
    }
  );

  db.close();
});

/**
 * Get user profile
 */
router.get('/profile', authenticateToken, (req, res) => {
  const userId = req.user.userId;

  const db = getDatabase();
  
  db.get(
    'SELECT * FROM users WHERE id = ?',
    [userId],
    (err, user) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.json({
        id: user.id,
        walletAddress: user.wallet_address,
        email: user.email,
        username: user.username,
        kycStatus: user.kyc_status,
        premiumAccount: user.premium_account === 1,
        createdAt: user.created_at
      });
    }
  );

  db.close();
});

/**
 * Middleware to authenticate JWT token
 */
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
}

module.exports = router;
