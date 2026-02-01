# Architecture Overview

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                          User Browser                            │
│                                                                   │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                  React Frontend (Port 3000)                │  │
│  │                                                             │  │
│  │  - WalletConnect Component                                 │  │
│  │  - PlayerStats Component                                   │  │
│  │  - GameActions Component                                   │  │
│  │  - Ethers.js Integration                                   │  │
│  └───────────────────────────────────────────────────────────┘  │
│                              │                                    │
└──────────────────────────────┼────────────────────────────────────┘
                               │
                ┌──────────────┴──────────────┐
                │                             │
                ▼                             ▼
    ┌───────────────────┐         ┌─────────────────────┐
    │   MetaMask        │         │  Backend API        │
    │   (Web3 Provider) │         │  (Port 3001)        │
    └─────────┬─────────┘         │                     │
              │                    │  - Leaderboard      │
              │                    │  - Player Stats     │
              │                    │  - Game Analytics   │
              │                    └─────────────────────┘
              │
              ▼
    ┌──────────────────────────────────────────┐
    │     Ethereum Blockchain Network           │
    │                                            │
    │  ┌──────────────────────────────────┐    │
    │  │   CryptoGame Smart Contract      │    │
    │  │                                   │    │
    │  │  - mintResources()               │    │
    │  │  - mintNFT()                     │    │
    │  │  - performGameAction()           │    │
    │  │  - useResources()                │    │
    │  │  - getPlayerStats()              │    │
    │  │                                   │    │
    │  │  Owner Wallet: 0x13B87...6650    │    │
    │  └──────────────────────────────────┘    │
    │                                            │
    └──────────────────────────────────────────┘
                      │
                      │ (All fees automatically transferred)
                      ▼
              ┌───────────────┐
              │  Owner Wallet │
              │  0x13B87B...  │
              └───────────────┘
```

## Data Flow

### 1. Wallet Connection Flow
```
User → Click "Connect Wallet" → MetaMask Popup → Approve → 
Connected → Load Player Stats → Display UI
```

### 2. Mint Resources Flow
```
User → Enter Amount → Click "Mint Resources" → 
MetaMask Confirm → Transaction to Contract → 
Fee Sent to Owner → Resources Added → Stats Updated
```

### 3. Mint NFT Flow
```
User → Enter Name & Power → Click "Mint NFT" → 
MetaMask Confirm → Transaction to Contract → 
Fee Sent to Owner → NFT Created → Stats Updated
```

### 4. Game Action Flow
```
User → Select Action → Click Action Button → 
MetaMask Confirm → Transaction to Contract → 
Fee Sent to Owner → Score Updated → Stats Refreshed
```

### 5. Use Resources Flow
```
User → Enter Resource Amount → Click "Use Resources" → 
MetaMask Confirm → Transaction to Contract → 
Resources Consumed → Score Increased → Stats Updated
```

## Component Breakdown

### Smart Contract Layer
- **CryptoGame.sol**: Main game contract
  - Resource management
  - NFT minting and storage
  - Game action processing
  - Fee collection and transfer
  - Player statistics tracking

### Frontend Layer
- **App.tsx**: Main application component
  - State management
  - Contract interaction
  - Event handling

- **WalletConnect.tsx**: Wallet connection UI
  - MetaMask integration
  - Account display

- **PlayerStats.tsx**: Statistics display
  - Resources, NFTs, Score, Actions
  - NFT collection display
  - Stats refresh functionality

- **GameActions.tsx**: Game interaction UI
  - Resource minting
  - NFT creation
  - Quick actions
  - Resource usage

### Backend Layer
- **server.js**: Express API server
  - Leaderboard endpoints
  - Player ranking
  - Game statistics
  - In-memory data storage

## Technology Stack

### Smart Contracts
- **Language**: Solidity 0.8.19
- **Framework**: Hardhat
- **Testing**: Hardhat/Chai
- **Networks**: EVM-compatible (Ethereum, Polygon, BSC, etc.)

### Frontend
- **Framework**: React 18
- **Language**: TypeScript
- **Web3 Library**: Ethers.js v6
- **Styling**: CSS3 with gradients
- **Build Tool**: React Scripts (Create React App)

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Middleware**: CORS, dotenv
- **Storage**: In-memory (upgradeable to database)

## Security Features

1. **Smart Contract Security**
   - Automatic fee transfer (no manual withdrawal)
   - Input validation on all functions
   - Solidity best practices
   - Events for transparency

2. **Frontend Security**
   - Read-only contract interactions where appropriate
   - MetaMask transaction confirmation
   - Error handling and user feedback

3. **Backend Security**
   - CORS enabled
   - Input validation
   - Environment variables for configuration

## Scalability Considerations

### Current Architecture
- In-memory leaderboard (suitable for prototype/demo)
- Direct contract calls (gas intensive)

### Production Recommendations
1. **Database**: Add PostgreSQL/MongoDB for leaderboard
2. **Caching**: Implement Redis for stats caching
3. **Indexing**: Use The Graph for blockchain event indexing
4. **IPFS**: Store NFT metadata on IPFS
5. **Layer 2**: Deploy on L2 solutions (Polygon, Arbitrum) for lower fees
6. **Load Balancing**: Add load balancer for backend API

## Fee Structure

| Action | Fee (ETH) | Recipient |
|--------|-----------|-----------|
| Mint Resources | 0.001 | Owner Wallet |
| Mint NFT | 0.01 | Owner Wallet |
| Game Action | 0.0005 | Owner Wallet |
| Use Resources | 0.0005 | Owner Wallet |

All fees are transferred atomically during contract execution.

## Deployment Environments

### Development
- **Network**: Hardhat Local
- **Purpose**: Local testing
- **Cost**: Free (local)

### Testnet
- **Network**: Sepolia, Mumbai, etc.
- **Purpose**: Integration testing
- **Cost**: Free (testnet ETH)

### Production
- **Network**: Mainnet (Ethereum, Polygon, etc.)
- **Purpose**: Live game
- **Cost**: Real ETH for gas

## Future Enhancements

1. **Gameplay**
   - PvP battles
   - Tournaments
   - Staking mechanisms
   - Resource crafting

2. **NFTs**
   - NFT marketplace
   - NFT upgrades
   - Rarity system
   - Visual assets

3. **Tokenomics**
   - Governance token
   - Reward pools
   - Referral system

4. **Social Features**
   - Guilds/Clans
   - Chat system
   - Social sharing

5. **Technical**
   - Mobile app
   - Layer 2 deployment
   - IPFS integration
   - The Graph indexing
