const express = require('express');
const router = express.Router();
const { getDatabase } = require('../database/init');

/**
 * Stake tokens
 */
router.post('/stake', (req, res) => {
  const { amount, walletAddress } = req.body;

  if (!amount || !walletAddress) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  if (amount < 100) {
    return res.status(400).json({ error: 'Minimum stake amount is 100 tokens' });
  }

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
        `INSERT INTO staking_positions (user_id, amount, status)
         VALUES (?, ?, ?)`,
        [user.id, amount, 'active'],
        function(err) {
          if (err) {
            db.close();
            return res.status(500).json({ error: 'Database error' });
          }

          res.json({
            positionId: this.lastID,
            amount,
            status: 'active',
            message: 'Tokens staked successfully'
          });

          db.close();
        }
      );
    }
  );
});

/**
 * Unstake tokens
 */
router.post('/unstake', (req, res) => {
  const { positionId, walletAddress } = req.body;

  if (!positionId || !walletAddress) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const db = getDatabase();
  
  db.get(
    'SELECT id FROM users WHERE wallet_address = ?',
    [walletAddress.toLowerCase()],
    (err, user) => {
      if (err || !user) {
        db.close();
        return res.status(404).json({ error: 'User not found' });
      }

      db.get(
        `SELECT * FROM staking_positions WHERE id = ? AND user_id = ? AND status = 'active'`,
        [positionId, user.id],
        (err, position) => {
          if (err || !position) {
            db.close();
            return res.status(404).json({ error: 'Staking position not found' });
          }

          // Calculate rewards (simplified)
          const stakingDuration = Date.now() - new Date(position.start_date).getTime();
          const daysStaked = stakingDuration / (1000 * 60 * 60 * 24);
          const rewards = position.amount * 0.0005 * daysStaked; // 0.05% per day

          db.run(
            `UPDATE staking_positions SET status = 'completed', rewards = ? WHERE id = ?`,
            [rewards, positionId],
            function(err) {
              if (err) {
                db.close();
                return res.status(500).json({ error: 'Database error' });
              }

              res.json({
                positionId,
                amount: position.amount,
                rewards,
                status: 'completed',
                message: 'Tokens unstaked successfully'
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
 * Get staking rewards
 */
router.get('/rewards/:walletAddress', (req, res) => {
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
        `SELECT * FROM staking_positions WHERE user_id = ?`,
        [user.id],
        (err, positions) => {
          if (err) {
            db.close();
            return res.status(500).json({ error: 'Database error' });
          }

          let totalStaked = 0;
          let totalRewards = 0;
          let activePositions = 0;

          positions.forEach(pos => {
            if (pos.status === 'active') {
              totalStaked += pos.amount;
              activePositions++;
              
              // Calculate pending rewards
              const stakingDuration = Date.now() - new Date(pos.start_date).getTime();
              const daysStaked = stakingDuration / (1000 * 60 * 60 * 24);
              totalRewards += pos.amount * 0.0005 * daysStaked;
            } else {
              totalRewards += pos.rewards;
            }
          });

          res.json({
            totalStaked,
            totalRewards,
            activePositions,
            positions
          });

          db.close();
        }
      );
    }
  );
});

/**
 * Get staking info
 */
router.get('/info', (req, res) => {
  res.json({
    minStakeAmount: 100,
    rewardRate: '0.05% per day',
    earlyUnstakeFee: '10%',
    minStakeDuration: '7 days',
    totalStaked: '50,000,000 EXC',
    apr: '18.25%'
  });
});

module.exports = router;
