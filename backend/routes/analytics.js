const express = require('express');
const router = express.Router();
const { getDatabase } = require('../database/init');

/**
 * Get user portfolio
 */
router.get('/portfolio/:walletAddress', (req, res) => {
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

      // Get staking positions
      db.all(
        `SELECT * FROM staking_positions WHERE user_id = ? AND status = 'active'`,
        [user.id],
        (err, stakingPositions) => {
          if (err) {
            db.close();
            return res.status(500).json({ error: 'Database error' });
          }

          // Get lending positions
          db.all(
            `SELECT * FROM lending_positions WHERE user_id = ? AND status = 'active'`,
            [user.id],
            (err, lendingPositions) => {
              if (err) {
                db.close();
                return res.status(500).json({ error: 'Database error' });
              }

              // Calculate totals
              const totalStaked = stakingPositions.reduce((sum, pos) => sum + pos.amount, 0);
              const totalLent = lendingPositions
                .filter(pos => pos.type === 'lend')
                .reduce((sum, pos) => sum + pos.amount, 0);
              const totalBorrowed = lendingPositions
                .filter(pos => pos.type === 'borrow')
                .reduce((sum, pos) => sum + pos.amount, 0);

              res.json({
                portfolio: {
                  totalStaked,
                  totalLent,
                  totalBorrowed,
                  totalValue: totalStaked + totalLent - totalBorrowed,
                  stakingPositions: stakingPositions.length,
                  lendingPositions: lendingPositions.length
                }
              });

              db.close();
            }
          );
        }
      );
    }
  );
});

/**
 * Get transaction history
 */
router.get('/transactions/:walletAddress', (req, res) => {
  const { walletAddress } = req.params;
  const { limit = 50, offset = 0 } = req.query;

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
        `SELECT * FROM transactions WHERE user_id = ? 
         ORDER BY created_at DESC LIMIT ? OFFSET ?`,
        [user.id, parseInt(limit), parseInt(offset)],
        (err, transactions) => {
          if (err) {
            db.close();
            return res.status(500).json({ error: 'Database error' });
          }

          // Get total count
          db.get(
            `SELECT COUNT(*) as total FROM transactions WHERE user_id = ?`,
            [user.id],
            (err, countResult) => {
              if (err) {
                db.close();
                return res.status(500).json({ error: 'Database error' });
              }

              res.json({
                transactions,
                pagination: {
                  total: countResult.total,
                  limit: parseInt(limit),
                  offset: parseInt(offset)
                }
              });

              db.close();
            }
          );
        }
      );
    }
  );
});

/**
 * Get performance metrics
 */
router.get('/performance/:walletAddress', (req, res) => {
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

      // Get transaction stats
      db.all(
        `SELECT 
           COUNT(*) as totalTransactions,
           SUM(fee) as totalFees,
           SUM(CASE WHEN type = 'swap' THEN 1 ELSE 0 END) as swaps,
           SUM(CASE WHEN type = 'buy' THEN 1 ELSE 0 END) as buys,
           SUM(CASE WHEN type = 'sell' THEN 1 ELSE 0 END) as sells
         FROM transactions 
         WHERE user_id = ?`,
        [user.id],
        (err, stats) => {
          if (err) {
            db.close();
            return res.status(500).json({ error: 'Database error' });
          }

          // Get staking rewards
          db.all(
            `SELECT SUM(rewards) as totalRewards FROM staking_positions WHERE user_id = ?`,
            [user.id],
            (err, stakingStats) => {
              if (err) {
                db.close();
                return res.status(500).json({ error: 'Database error' });
              }

              res.json({
                performance: {
                  totalTransactions: stats[0].totalTransactions || 0,
                  totalFeesPaid: stats[0].totalFees || 0,
                  swaps: stats[0].swaps || 0,
                  buys: stats[0].buys || 0,
                  sells: stats[0].sells || 0,
                  stakingRewards: stakingStats[0].totalRewards || 0,
                  profitLoss: (stakingStats[0].totalRewards || 0) - (stats[0].totalFees || 0)
                }
              });

              db.close();
            }
          );
        }
      );
    }
  );
});

/**
 * Get platform statistics
 */
router.get('/platform', (req, res) => {
  const db = getDatabase();
  
  db.get(
    `SELECT 
       COUNT(DISTINCT user_id) as totalUsers,
       COUNT(*) as totalTransactions,
       SUM(fee) as totalFees
     FROM transactions`,
    [],
    (err, stats) => {
      if (err) {
        db.close();
        return res.status(500).json({ error: 'Database error' });
      }

      db.get(
        `SELECT 
           SUM(amount) as totalStaked,
           COUNT(*) as totalStakers
         FROM staking_positions 
         WHERE status = 'active'`,
        [],
        (err, stakingStats) => {
          if (err) {
            db.close();
            return res.status(500).json({ error: 'Database error' });
          }

          res.json({
            platform: {
              totalUsers: stats.totalUsers || 0,
              totalTransactions: stats.totalTransactions || 0,
              totalVolume: '$50,000,000',
              totalFees: stats.totalFees || 0,
              totalStaked: stakingStats.totalStaked || 0,
              totalStakers: stakingStats.totalStakers || 0,
              tvl: '$75,000,000'
            }
          });

          db.close();
        }
      );
    }
  );
});

module.exports = router;
