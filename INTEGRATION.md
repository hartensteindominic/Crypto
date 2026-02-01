# Integration Guide

This guide explains how all the components of the Crypto Platform work together.

## Overview

The platform consists of four major components:
1. **DeFi Exchange** - Token trading, staking, lending, and DAO governance
2. **Play-to-Earn Game** - Blockchain gaming with resource minting and NFTs
3. **NFT Marketplace** - Artwork NFT creation and trading
4. **AI Agent System** - Autonomous agents for market analysis and automation

## Component Integration

### 1. DeFi Exchange Platform

**Contracts**: `EXCToken.sol`, `TokenStaking.sol`, `TokenSwap.sol`, `LendingPool.sol`, `DAOGovernance.sol`

**Backend**: `backend/server.js` with routes:
- `/api/auth/*` - Authentication
- `/api/trading/*` - Token swaps
- `/api/staking/*` - Staking operations
- `/api/lending/*` - Lending/borrowing
- `/api/governance/*` - DAO voting
- `/api/analytics/*` - Portfolio tracking

**Frontend**: `frontend/index.html` - Web UI for all DeFi operations

**Port**: 3000 (configurable in `.env`)

### 2. Play-to-Earn Game

**Contract**: `contracts/CryptoGameP2E.sol`

**Backend**: `game/game-backend.js` with endpoints:
- `GET /api/leaderboard` - Top players
- `GET /api/player/:address/rank` - Player ranking
- `GET /api/stats` - Game statistics

**Frontend**: Requires integration with main DeFi frontend or separate game UI

**Port**: 3001 (default)

**Integration Points**:
- Uses same wallet authentication as DeFi platform
- Game NFTs can be traded on the NFT marketplace
- Game rewards can be staked in the DeFi platform

### 3. NFT Marketplace

**Contract**: `contracts/ArtworkNFT.sol`

**Integration**:
- NFTs created in the game become tradeable artwork
- Marketplace uses same fee routing as game (5%)
- Layer system allows NFT enhancement
- Can integrate with DeFi frontend for trading UI

### 4. AI Agent System

**Files**: `ai-agent/*`

**Standalone Operation**:
- Runs entirely in browser
- No server required
- Independent of other components

**Integration Potential**:
```javascript
// Connect agents to platform API
aiSystem.connectToPlatform({
  apiUrl: 'http://localhost:3000/api',
  authToken: jwt_token
});

// Agents can then:
// - Fetch market data
// - Execute trades
// - Monitor portfolio
// - Analyze trends
```

## Deployment Architecture

### Development Setup

```
┌─────────────────────────────────────────────┐
│         Local Blockchain (Hardhat)          │
│              Port: 8545                     │
└─────────────────┬───────────────────────────┘
                  │
        ┌─────────┴─────────┐
        │                   │
┌───────▼────────┐  ┌──────▼───────┐
│  DeFi Backend  │  │ Game Backend │
│   Port: 3000   │  │  Port: 3001  │
└───────┬────────┘  └──────┬───────┘
        │                   │
        └─────────┬─────────┘
                  │
        ┌─────────▼─────────┐
        │   Web Frontends   │
        │ - DeFi UI         │
        │ - AI Agents UI    │
        └───────────────────┘
```

### Production Setup

```
┌─────────────────────────────────────────────┐
│    Ethereum Mainnet / L2 (Polygon, etc.)   │
└─────────────────┬───────────────────────────┘
                  │
        ┌─────────┴─────────┐
        │                   │
┌───────▼────────┐  ┌──────▼───────┐
│   API Server   │  │ Game Server  │
│  (Load Bal.)   │  │ (Scaled)     │
│     HTTPS      │  │    HTTPS     │
└───────┬────────┘  └──────┬───────┘
        │                   │
        └─────────┬─────────┘
                  │
        ┌─────────▼─────────┐
        │    CDN (Static)   │
        │ - Web Frontends   │
        │ - AI Agent UI     │
        └───────────────────┘
```

## Wallet Integration

All components use the same wallet connection:

```javascript
// User connects wallet once
const provider = new ethers.BrowserProvider(window.ethereum);
const signer = await provider.getSigner();
const address = await signer.getAddress();

// Address used for:
// 1. DeFi platform authentication
// 2. Game player identification
// 3. NFT ownership
// 4. AI agent personalization
```

## Data Flow

### Trading Flow

1. User connects wallet → Frontend
2. Frontend authenticates → Backend API (JWT)
3. User initiates swap → Frontend
4. Frontend calls contract → TokenSwap.sol
5. Transaction confirmed → Update backend database
6. UI updates → Show new balances

### Gaming Flow

1. User connects wallet → Game UI
2. User performs action → CryptoGameP2E.sol
3. Fee collected → Owner wallet (0x13B...650)
4. Event emitted → Game backend listening
5. Leaderboard updated → Database
6. Frontend polls → GET /api/leaderboard

### AI Agent Flow

1. User opens AI UI → Browser loads scripts
2. Parent AI evaluates → Create/remove agents
3. Agents fetch data → Platform API (optional)
4. Agents analyze → Local processing
5. Results displayed → UI updates
6. Actions logged → Activity log

## Cross-Component Features

### Unified Fee System

- **DeFi Platform**: 0.25% trading fee
- **Game**: 0.001-0.01 ETH per action
- **NFT Marketplace**: 5% transaction fee

All fees trackable via blockchain events.

### Unified User Profile

```javascript
// User profile spans all components
{
  address: "0x...",
  
  // DeFi data
  stakedAmount: 1000,
  portfolio: {...},
  governanceVotes: 5,
  
  // Game data
  resources: 500,
  nfts: [1, 2, 3],
  score: 1000,
  rank: 42,
  
  // AI data
  activeAgents: 3,
  preferences: {...}
}
```

### Token Interoperability

- EXC tokens can be:
  - Traded on DEX
  - Staked for rewards
  - Used for DAO voting
  - Earned in game (future)
  - Used to pay for AI agent features (future)

## Environment Configuration

### `.env` File

```bash
# Blockchain
NETWORK=localhost
RPC_URL=http://localhost:8545
CHAIN_ID=31337

# Contracts (after deployment)
EXC_TOKEN_ADDRESS=0x...
TOKEN_STAKING_ADDRESS=0x...
TOKEN_SWAP_ADDRESS=0x...
LENDING_POOL_ADDRESS=0x...
DAO_GOVERNANCE_ADDRESS=0x...
CRYPTO_GAME_ADDRESS=0x...
ARTWORK_NFT_ADDRESS=0x...

# Backend
PORT=3000
GAME_PORT=3001
DATABASE_URL=./data/exchange.db
JWT_SECRET=your-secret-key

# API Keys (for production)
ETHERSCAN_API_KEY=your-key
INFURA_API_KEY=your-key
ALCHEMY_API_KEY=your-key
```

## Testing Integration

### End-to-End Test Flow

```bash
# 1. Start blockchain
npx hardhat node

# 2. Deploy all contracts
npx hardhat run scripts/deploy.js --network localhost

# 3. Start backends
node backend/server.js &
node game/game-backend.js &

# 4. Test DeFi operations
curl http://localhost:3000/api/analytics/stats

# 5. Test game operations
curl http://localhost:3001/api/leaderboard

# 6. Open frontends
# - http://localhost:3000/frontend/index.html (DeFi)
# - http://localhost:3000/ai-agent/index.html (AI)
```

### Contract Interaction Test

```javascript
// Test complete user journey
const provider = new ethers.JsonRpcProvider('http://localhost:8545');
const wallet = new ethers.Wallet(privateKey, provider);

// 1. Get EXC tokens
const excToken = new ethers.Contract(EXC_TOKEN_ADDRESS, ABI, wallet);

// 2. Stake tokens
const staking = new ethers.Contract(STAKING_ADDRESS, ABI, wallet);
await excToken.approve(STAKING_ADDRESS, amount);
await staking.stake(amount);

// 3. Play game
const game = new ethers.Contract(GAME_ADDRESS, ABI, wallet);
await game.mintResources(100, { value: ethers.parseEther('0.001') });

// 4. Create NFT
const nft = new ethers.Contract(NFT_ADDRESS, ABI, wallet);
await nft.mintArtwork(wallet.address, 'ipfs://...', 3, {
  value: ethers.parseEther('0.05')
});
```

## API Integration

### Backend API Authentication

```javascript
// Login with wallet signature
const message = `Login to Crypto Platform\nTimestamp: ${Date.now()}`;
const signature = await signer.signMessage(message);

const response = await fetch('http://localhost:3000/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ address, signature, message })
});

const { token } = await response.json();

// Use token for authenticated requests
const tradingHistory = await fetch('http://localhost:3000/api/trading/history', {
  headers: { 'Authorization': `Bearer ${token}` }
});
```

### AI Agent Integration

```javascript
// Configure agents with platform access
const aiSystem = {
  platform: {
    apiUrl: 'http://localhost:3000/api',
    gameUrl: 'http://localhost:3001/api',
    authToken: token
  }
};

// Agents can now fetch data
async function fetchMarketData() {
  const response = await fetch(
    `${aiSystem.platform.apiUrl}/analytics/stats`,
    { headers: { 'Authorization': `Bearer ${aiSystem.platform.authToken}` }}
  );
  return response.json();
}
```

## Monitoring & Maintenance

### Health Checks

```bash
# Check all services
curl http://localhost:3000/health  # DeFi backend
curl http://localhost:3001/health  # Game backend

# Check blockchain
curl -X POST http://localhost:8545 \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}'
```

### Logs

```bash
# Backend logs
tail -f backend/logs/server.log

# Game backend logs
tail -f game/logs/game.log

# Blockchain logs
tail -f hardhat-node.log
```

### Database Maintenance

```bash
# Backup database
cp data/exchange.db data/exchange-backup-$(date +%Y%m%d).db

# Check database size
du -h data/exchange.db

# Vacuum database (optimize)
sqlite3 data/exchange.db "VACUUM;"
```

## Security Considerations

### Inter-Component Security

1. **API Authentication**: All backends use JWT with wallet verification
2. **Rate Limiting**: Applied across all API endpoints
3. **Input Validation**: Wallet addresses verified before database operations
4. **Contract Verification**: All contracts should be verified on Etherscan
5. **HTTPS**: Required in production for all API endpoints

### Wallet Security

- Private keys never leave user's browser
- All transactions require explicit user confirmation
- Smart contracts audited before mainnet deployment

## Troubleshooting

### Common Issues

**Contracts not compiling**:
- Firewall blocks `binaries.soliditylang.org`
- Solution: Use GitHub Actions or pre-compiled contracts

**Backend not starting**:
- Check database file permissions
- Verify all environment variables set
- Check port availability

**Frontend not connecting**:
- Verify MetaMask connected to correct network
- Check contract addresses in frontend code
- Ensure backend is running

**AI agents not working**:
- Check browser console for errors
- Verify all JS files loaded correctly
- Ensure browser supports Canvas API

## Future Enhancements

### Planned Integrations

1. **Unified Dashboard**: Single UI for all components
2. **Cross-Component Rewards**: Earn EXC tokens in game, use in DeFi
3. **AI Trading**: Agents execute trades automatically
4. **Social Features**: User profiles, friends, chat
5. **Mobile Apps**: Native iOS/Android apps
6. **Layer 2**: Deploy to Polygon, Arbitrum for lower fees

### Architecture Evolution

```
Current: Separate components with loose integration
Future: Unified platform with shared user accounts
```

## Support

For integration issues:
1. Check component-specific README files
2. Review logs for error messages
3. Test individual components in isolation
4. Open GitHub issue with detailed description

---

Last Updated: 2026-02-01
