const express = require('express');
const router = express.Router();
const { getDatabase } = require('../database/init');

/**
 * Lend tokens
 */
router.post('/lend', (req, res) => {
  const { token, amount, walletAddress } = req.body;

  if (!token || !amount || !walletAddress) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const interestRate = 5.0; // 5% annual interest

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
        `INSERT INTO lending_positions (user_id, type, token, amount, interest_rate, status)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [user.id, 'lend', token, amount, interestRate, 'active'],
        function(err) {
          if (err) {
            db.close();
            return res.status(500).json({ error: 'Database error' });
          }

          res.json({
            positionId: this.lastID,
            type: 'lend',
            token,
            amount,
            interestRate,
            status: 'active',
            message: 'Lending position created successfully'
          });

          db.close();
        }
      );
    }
  );
});

/**
 * Borrow tokens
 */
router.post('/borrow', (req, res) => {
  const { collateralToken, borrowToken, collateralAmount, borrowAmount, walletAddress } = req.body;

  if (!collateralToken || !borrowToken || !collateralAmount || !borrowAmount || !walletAddress) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  // Check collateralization ratio (150%)
  const requiredCollateral = borrowAmount * 1.5;
  if (collateralAmount < requiredCollateral) {
    return res.status(400).json({ 
      error: 'Insufficient collateral',
      required: requiredCollateral,
      provided: collateralAmount
    });
  }

  const interestRate = 8.0; // 8% annual interest for borrowing

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
        `INSERT INTO lending_positions (user_id, type, token, amount, interest_rate, status)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [user.id, 'borrow', borrowToken, borrowAmount, interestRate, 'active'],
        function(err) {
          if (err) {
            db.close();
            return res.status(500).json({ error: 'Database error' });
          }

          res.json({
            loanId: this.lastID,
            type: 'borrow',
            collateralToken,
            borrowToken,
            collateralAmount,
            borrowAmount,
            interestRate,
            status: 'active',
            message: 'Loan created successfully'
          });

          db.close();
        }
      );
    }
  );
});

/**
 * Get lending positions
 */
router.get('/positions/:walletAddress', (req, res) => {
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
        `SELECT * FROM lending_positions WHERE user_id = ? ORDER BY created_at DESC`,
        [user.id],
        (err, positions) => {
          if (err) {
            db.close();
            return res.status(500).json({ error: 'Database error' });
          }

          // Calculate interest for each position
          const positionsWithInterest = positions.map(pos => {
            const duration = Date.now() - new Date(pos.start_date).getTime();
            const years = duration / (1000 * 60 * 60 * 24 * 365);
            const interest = pos.amount * (pos.interest_rate / 100) * years;

            return {
              ...pos,
              interestAccrued: interest,
              totalValue: pos.amount + (pos.type === 'lend' ? interest : 0)
            };
          });

          res.json({ positions: positionsWithInterest });
          db.close();
        }
      );
    }
  );
});

/**
 * Repay loan
 */
router.post('/repay', (req, res) => {
  const { loanId, walletAddress } = req.body;

  if (!loanId || !walletAddress) {
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
        `SELECT * FROM lending_positions WHERE id = ? AND user_id = ? AND type = 'borrow' AND status = 'active'`,
        [loanId, user.id],
        (err, loan) => {
          if (err || !loan) {
            db.close();
            return res.status(404).json({ error: 'Loan not found' });
          }

          // Calculate total repayment
          const duration = Date.now() - new Date(loan.start_date).getTime();
          const years = duration / (1000 * 60 * 60 * 24 * 365);
          const interest = loan.amount * (loan.interest_rate / 100) * years;
          const totalRepayment = loan.amount + interest;

          db.run(
            `UPDATE lending_positions SET status = 'completed' WHERE id = ?`,
            [loanId],
            function(err) {
              if (err) {
                db.close();
                return res.status(500).json({ error: 'Database error' });
              }

              res.json({
                loanId,
                principal: loan.amount,
                interest,
                totalRepayment,
                status: 'completed',
                message: 'Loan repaid successfully'
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
 * Get lending info
 */
router.get('/info', (req, res) => {
  res.json({
    collateralRatio: '150%',
    liquidationThreshold: '120%',
    lendingAPR: '5%',
    borrowingAPR: '8%',
    availableLiquidity: '25,000,000 EXC',
    totalBorrowed: '15,000,000 EXC'
  });
});

module.exports = router;
