# Play-to-Earn Crypto Game

A blockchain-based play-to-earn game where players mint resources, create NFTs, and compete on leaderboards.

## Features

- **Resource Minting**: Mint in-game resources (0.001 ETH fee)
- **NFT Creation**: Create game NFTs with metadata (0.01 ETH fee)
- **Game Actions**: Perform score-based actions (0.0005 ETH fee)
- **Leaderboard**: Track top players and rankings
- **Fee Collection**: All fees automatically routed to designated wallet

## Smart Contract

The `CryptoGameP2E.sol` contract implements:

- Immutable owner wallet: `0x13B87B819252A81381C3Ce35e3Bd33199F4c6650`
- Resource tracking for each player
- NFT ownership and metadata
- Player statistics and scores
- Event emissions for all actions

## Backend API

The game backend (`game-backend.js`) provides:

### Endpoints

- `GET /api/leaderboard` - Get top 100 players
- `GET /api/player/:address/rank` - Get player rank
- `GET /api/stats` - Get game statistics

### Running

```bash
# Install dependencies
npm install express

# Start server
node game/game-backend.js

# Server runs on http://localhost:3001
```

## Frontend Integration

The game requires a Web3-enabled frontend with:

1. MetaMask or compatible wallet
2. Ethers.js v6 for blockchain interaction
3. Contract ABI and address
4. UI components for game actions

### Example Usage

```javascript
import { ethers } from 'ethers';

// Connect to contract
const provider = new ethers.BrowserProvider(window.ethereum);
const signer = await provider.getSigner();
const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);

// Mint resources
const tx = await contract.mintResources(100, {
  value: ethers.parseEther('0.001')
});
await tx.wait();

// Create NFT
const nftTx = await contract.mintNFT('ipfs://metadata', {
  value: ethers.parseEther('0.01')
});
await nftTx.wait();

// Perform game action
const actionTx = await contract.performGameAction(50, {
  value: ethers.parseEther('0.0005')
});
await actionTx.wait();
```

## Testing

The contract includes comprehensive tests:

```bash
# Run tests
npx hardhat test test/CryptoGame.test.js

# With coverage
npx hardhat coverage
```

## Deployment

```bash
# Deploy to local network
npx hardhat run scripts/deploy.js --network localhost

# Deploy to testnet
npx hardhat run scripts/deploy.js --network sepolia

# Verify on Etherscan
npx hardhat verify --network sepolia CONTRACT_ADDRESS
```

## Game Mechanics

### Resource System
- Players mint resources using ETH
- Resources used for game actions
- Tracked on-chain per player

### NFT System
- Create unique game NFTs
- Store metadata on IPFS
- Trade and showcase NFTs

### Scoring System
- Gain score through actions
- Compete on leaderboards
- Win rewards based on rank

## Security

- All functions follow checks-effects-interactions pattern
- State updates before external calls
- Fee transfers use low-level call with validation
- ReentrancyGuard on state-changing functions
- Immutable owner wallet prevents rug pulls

## Revenue

All fees collected from:
- Resource minting: 0.001 ETH per transaction
- NFT creation: 0.01 ETH per NFT
- Game actions: 0.0005 ETH per action

Fees automatically transferred to owner wallet on each transaction.

## Future Enhancements

- [ ] Multiplayer battles
- [ ] Resource trading marketplace
- [ ] Guild system
- [ ] Tournaments with prize pools
- [ ] Mobile app integration
- [ ] Cross-chain support

## Support

For issues or questions:
- Open a GitHub issue
- Check the main project documentation
- Review the smart contract code
