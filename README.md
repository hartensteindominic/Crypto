# Crypto Game - Play-to-Earn Blockchain Game

A decentralized play-to-earn game built on EVM-compatible blockchains with smart contract fee collection and NFT mechanics.

## Features

- **Smart Contract Integration**: Automated fee collection on every game action
- **Play-to-Earn Mechanics**: Resource minting and token-based gameplay
- **NFT Support**: Mintable in-game assets
- **Web3 Integration**: Connect with MetaMask and other wallets
- **Leaderboard System**: Track top players

## Project Structure

```
├── contracts/          # Solidity smart contracts
├── frontend/          # React/TypeScript game interface
├── backend/           # Node.js backend for off-chain data
└── README.md
```

## Setup Instructions

### Prerequisites

- Node.js v16+ 
- npm or yarn
- MetaMask or compatible Web3 wallet

### Installation

1. Install all dependencies:
```bash
npm run install-all
```

### Smart Contract Deployment

1. Navigate to contracts directory:
```bash
cd contracts
```

2. Configure your network in `hardhat.config.js`

3. Deploy contracts:
```bash
npx hardhat run scripts/deploy.js --network <your-network>
```

### Frontend

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Create `.env` file with contract address:
```
REACT_APP_CONTRACT_ADDRESS=<deployed-contract-address>
```

3. Start development server:
```bash
npm start
```

### Backend

1. Navigate to backend directory:
```bash
cd backend
```

2. Start server:
```bash
npm start
```

## Game Mechanics

- Players connect their wallet to the game
- Game actions cost a small fee in ETH/token
- Fees are automatically sent to the owner wallet
- Players can mint resources and NFTs
- Leaderboard tracks player achievements

## Smart Contract Details

- **Owner Wallet**: `0x13B87B819252A81381C3Ce35e3Bd33199F4c6650`
- All fees collected are automatically transferred to the owner wallet
- Contract supports resource minting and NFT creation

## License

MIT
