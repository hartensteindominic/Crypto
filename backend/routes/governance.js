const express = require('express');
const router = express.Router();
const { getDatabase } = require('../database/init');

/**
 * Get all proposals
 */
router.get('/proposals', (req, res) => {
  const db = getDatabase();
  
  db.all(
    `SELECT p.*, u.username, u.wallet_address 
     FROM proposals p 
     LEFT JOIN users u ON p.proposer_id = u.id 
     ORDER BY p.created_at DESC`,
    [],
    (err, proposals) => {
      if (err) {
        db.close();
        return res.status(500).json({ error: 'Database error' });
      }

      res.json({ proposals });
      db.close();
    }
  );
});

/**
 * Get proposal by ID
 */
router.get('/proposals/:id', (req, res) => {
  const { id } = req.params;

  const db = getDatabase();
  
  db.get(
    `SELECT p.*, u.username, u.wallet_address 
     FROM proposals p 
     LEFT JOIN users u ON p.proposer_id = u.id 
     WHERE p.id = ?`,
    [id],
    (err, proposal) => {
      if (err) {
        db.close();
        return res.status(500).json({ error: 'Database error' });
      }

      if (!proposal) {
        db.close();
        return res.status(404).json({ error: 'Proposal not found' });
      }

      res.json({ proposal });
      db.close();
    }
  );
});

/**
 * Create new proposal
 */
router.post('/propose', (req, res) => {
  const { title, description, walletAddress } = req.body;

  if (!title || !description || !walletAddress) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  // Voting period: 3 days
  const endDate = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);

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
        `INSERT INTO proposals (proposer_id, title, description, status, end_date)
         VALUES (?, ?, ?, ?, ?)`,
        [user.id, title, description, 'active', endDate.toISOString()],
        function(err) {
          if (err) {
            db.close();
            return res.status(500).json({ error: 'Database error' });
          }

          res.json({
            proposalId: this.lastID,
            title,
            description,
            status: 'active',
            endDate,
            message: 'Proposal created successfully'
          });

          db.close();
        }
      );
    }
  );
});

/**
 * Vote on proposal
 */
router.post('/vote', (req, res) => {
  const { proposalId, support, voteWeight, walletAddress } = req.body;

  if (proposalId === undefined || support === undefined || !voteWeight || !walletAddress) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  if (support !== 0 && support !== 1) {
    return res.status(400).json({ error: 'Support must be 0 (against) or 1 (for)' });
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
        `SELECT * FROM proposals WHERE id = ? AND status = 'active'`,
        [proposalId],
        (err, proposal) => {
          if (err || !proposal) {
            db.close();
            return res.status(404).json({ error: 'Proposal not found or not active' });
          }

          // Check if voting period has ended
          if (new Date() > new Date(proposal.end_date)) {
            db.close();
            return res.status(400).json({ error: 'Voting period has ended' });
          }

          // Update vote counts safely without SQL injection
          if (support === 1) {
            db.run(
              `UPDATE proposals SET for_votes = ? WHERE id = ?`,
              [proposal.for_votes + voteWeight, proposalId],
              function(err) {
                if (err) {
                  db.close();
                  return res.status(500).json({ error: 'Database error' });
                }

                res.json({
                  proposalId,
                  support: 'for',
                  voteWeight,
                  message: 'Vote cast successfully'
                });

                db.close();
              }
            );
          } else {
            db.run(
              `UPDATE proposals SET against_votes = ? WHERE id = ?`,
              [proposal.against_votes + voteWeight, proposalId],
              function(err) {
                if (err) {
                  db.close();
                  return res.status(500).json({ error: 'Database error' });
                }

                res.json({
                  proposalId,
                  support: 'against',
                  voteWeight,
                  message: 'Vote cast successfully'
                });

                db.close();
              }
            );
          }
        }
      );
    }
  );
});

/**
 * Execute proposal
 */
router.post('/execute/:id', (req, res) => {
  const { id } = req.params;

  const db = getDatabase();
  
  db.get(
    `SELECT * FROM proposals WHERE id = ?`,
    [id],
    (err, proposal) => {
      if (err || !proposal) {
        db.close();
        return res.status(404).json({ error: 'Proposal not found' });
      }

      // Check if voting period has ended
      if (new Date() < new Date(proposal.end_date)) {
        db.close();
        return res.status(400).json({ error: 'Voting period has not ended' });
      }

      // Check if proposal passed (more for votes than against)
      const passed = proposal.for_votes > proposal.against_votes;
      const newStatus = passed ? 'executed' : 'defeated';

      db.run(
        `UPDATE proposals SET status = ? WHERE id = ?`,
        [newStatus, id],
        function(err) {
          if (err) {
            db.close();
            return res.status(500).json({ error: 'Database error' });
          }

          res.json({
            proposalId: id,
            status: newStatus,
            forVotes: proposal.for_votes,
            againstVotes: proposal.against_votes,
            passed,
            message: passed ? 'Proposal executed successfully' : 'Proposal defeated'
          });

          db.close();
        }
      );
    }
  );
});

/**
 * Get governance info
 */
router.get('/info', (req, res) => {
  res.json({
    proposalThreshold: '10,000 EXC',
    votingPeriod: '3 days',
    quorumPercent: '10%',
    totalProposals: 15,
    activeProposals: 3,
    executedProposals: 10
  });
});

module.exports = router;
