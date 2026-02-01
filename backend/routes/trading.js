const express = require('express');
const router = express.Router();
const { getDatabase } = require('../database/init');

const TRADING_FEE_PERCENT = parseFloat(process.env.TRADING_FEE_PERCENT || '0.25');

/**
 * Get available tokens
 */
router.get('/tokens', (req, res) => {
  // In production, fetch from blockchain and price oracles
  const tokens = [
    {
      symbol: 'EXC',
      name: 'Exchange Token',
      address: '0x...',
      price: 1.5,
      change24h: 5.2,
      volume24h: 1500000
    },
    {
      symbol: 'ETH',
      name: 'Ethereum',
      address: '0x...',
      price: 2500.00,
      change24h: -2.1,
      volume24h: 50000000
    },
    {
      symbol: 'USDC',
      name: 'USD Coin',
      address: '0x...',
      price: 1.00,
      change24h: 0.01,
      volume24h: 25000000
    }
  ];

  res.json({ tokens });
});

/**
 * Execute token swap
 */
router.post('/swap', (req, res) => {
  const { tokenIn, tokenOut, amountIn, walletAddress } = req.body;

  if (!tokenIn || !tokenOut || !amountIn || !walletAddress) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  // Validate Ethereum address format
  if (!/^0x[a-fA-F0-9]{40}$/.test(walletAddress)) {
    return res.status(400).json({ error: 'Invalid wallet address format' });
  }

  // Calculate output amount (simplified)
  const exchangeRate = 1.0; // In production, use real exchange rates
  const amountOut = amountIn * exchangeRate;
  const fee = amountIn * (TRADING_FEE_PERCENT / 100);

  // Store transaction
  const db = getDatabase();
  
  db.get(
    'SELECT id FROM users WHERE wallet_address = ?',
    [walletAddress.toLowerCase()],
    (err, user) => {
      if (err || !user) {
        db.close();
        return res.status(404).json({ error: 'User not found' });
      }

      db.run(
        `INSERT INTO transactions (user_id, type, token_in, token_out, amount_in, amount_out, fee, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [user.id, 'swap', tokenIn, tokenOut, amountIn, amountOut, fee, 'completed'],
        function(err) {
          if (err) {
            db.close();
            return res.status(500).json({ error: 'Database error' });
          }

          res.json({
            transactionId: this.lastID,
            tokenIn,
            tokenOut,
            amountIn,
            amountOut,
            fee,
            status: 'completed',
            message: 'Swap executed successfully'
          });

          db.close();
        }
      );
    }
  );
});

/**
 * Get user orders/transactions
 */
router.get('/orders/:walletAddress', (req, res) => {
  const { walletAddress } = req.params;

  const db = getDatabase();
  
  db.get(
    'SELECT id FROM users WHERE wallet_address = ?',
    [walletAddress.toLowerCase()],
    (err, user) => {
      if (err || !user) {
        db.close();
        return res.status(404).json({ error: 'User not found' });
      }

      db.all(
        `SELECT * FROM transactions WHERE user_id = ? ORDER BY created_at DESC LIMIT 100`,
        [user.id],
        (err, transactions) => {
          if (err) {
            db.close();
            return res.status(500).json({ error: 'Database error' });
          }

          res.json({ transactions });
          db.close();
        }
      );
    }
  );
});

/**
 * Create buy/sell order
 */
router.post('/orders', (req, res) => {
  const { type, token, amount, price, walletAddress } = req.body;

  if (!type || !token || !amount || !price || !walletAddress) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  if (type !== 'buy' && type !== 'sell') {
    return res.status(400).json({ error: 'Type must be buy or sell' });
  }

  const fee = amount * price * (TRADING_FEE_PERCENT / 100);

  const db = getDatabase();
  
  db.get(
    'SELECT id FROM users WHERE wallet_address = ?',
    [walletAddress.toLowerCase()],
    (err, user) => {
      if (err || !user) {
        db.close();
        return res.status(404).json({ error: 'User not found' });
      }

      db.run(
        `INSERT INTO transactions (user_id, type, token_in, amount_in, fee, status)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [user.id, type, token, amount, fee, 'completed'],
        function(err) {
          if (err) {
            db.close();
            return res.status(500).json({ error: 'Database error' });
          }

          res.json({
            orderId: this.lastID,
            type,
            token,
            amount,
            price,
            fee,
            status: 'completed',
            message: `${type} order placed successfully`
          });

          db.close();
        }
      );
    }
  );
});

module.exports = router;
