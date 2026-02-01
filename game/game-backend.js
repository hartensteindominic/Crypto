const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// In-memory storage for leaderboard
// ⚠️ WARNING: This is NOT suitable for production use!
// - All data will be LOST when the server restarts
// - No data persistence between deployments
// - Limited scalability for large player bases
// 
// For production, replace with a database solution:
// - PostgreSQL: Relational database with excellent performance
// - MongoDB: Document database for flexible schema
// - Redis: Fast in-memory database with persistence
let leaderboard = [];

// Routes

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Crypto Game Backend is running' });
});

// Get leaderboard
app.get('/api/leaderboard', (req, res) => {
  // Sort by score descending
  const sortedLeaderboard = [...leaderboard].sort((a, b) => b.score - a.score).slice(0, 100);
  res.json(sortedLeaderboard);
});

// Update player score
app.post('/api/leaderboard/update', (req, res) => {
  const { address, score, resources, nftCount } = req.body;
  
  if (!address || score === undefined) {
    return res.status(400).json({ error: 'Address and score are required' });
  }

  // Find existing player or create new entry
  const existingIndex = leaderboard.findIndex(p => p.address.toLowerCase() === address.toLowerCase());
  
  const playerData = {
    address,
    score: parseInt(score),
    resources: parseInt(resources) || 0,
    nftCount: parseInt(nftCount) || 0,
    lastUpdated: new Date().toISOString()
  };

  if (existingIndex >= 0) {
    // Update existing player
    leaderboard[existingIndex] = playerData;
  } else {
    // Add new player
    leaderboard.push(playerData);
  }

  res.json({ success: true, player: playerData });
});

// Get player rank
app.get('/api/player/:address/rank', (req, res) => {
  const { address } = req.params;
  
  const sortedLeaderboard = [...leaderboard].sort((a, b) => b.score - a.score);
  const rank = sortedLeaderboard.findIndex(p => p.address.toLowerCase() === address.toLowerCase());
  
  if (rank === -1) {
    return res.json({ rank: null, message: 'Player not found in leaderboard' });
  }
  
  res.json({
    rank: rank + 1,
    totalPlayers: leaderboard.length,
    player: sortedLeaderboard[rank]
  });
});

// Get game statistics
app.get('/api/stats', (req, res) => {
  const totalPlayers = leaderboard.length;
  const totalScore = leaderboard.reduce((sum, p) => sum + p.score, 0);
  const totalResources = leaderboard.reduce((sum, p) => sum + p.resources, 0);
  const totalNFTs = leaderboard.reduce((sum, p) => sum + p.nftCount, 0);
  
  res.json({
    totalPlayers,
    totalScore,
    totalResources,
    totalNFTs,
    averageScore: totalPlayers > 0 ? Math.floor(totalScore / totalPlayers) : 0
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Crypto Game Backend running on port ${PORT}`);
  console.log(`📊 API endpoints:`);
  console.log(`   GET  /api/health - Health check`);
  console.log(`   GET  /api/leaderboard - Get top 100 players`);
  console.log(`   POST /api/leaderboard/update - Update player score`);
  console.log(`   GET  /api/player/:address/rank - Get player rank`);
  console.log(`   GET  /api/stats - Get game statistics`);
});
