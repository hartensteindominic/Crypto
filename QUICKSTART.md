# Quick Start Guide

## Prerequisites
- Node.js v16 or higher
- MetaMask browser extension
- Some ETH for gas fees (testnet or mainnet)

## Installation

### 1. Install Dependencies

```bash
# Install all dependencies for all components
npm run install-all
```

Or install individually:

```bash
# Contracts
cd contracts && npm install

# Frontend
cd frontend && npm install

# Backend
cd backend && npm install
```

## Running the Application

### Step 1: Deploy Smart Contract

```bash
# Navigate to contracts directory
cd contracts

# For local development (Hardhat network)
npx hardhat node  # In terminal 1
npx hardhat run scripts/deploy.js --network localhost  # In terminal 2

# For testnet (e.g., Sepolia)
# 1. Configure .env with your private key
# 2. Update hardhat.config.js with network details
npx hardhat run scripts/deploy.js --network sepolia
```

**Important**: Save the deployed contract address!

### Step 2: Configure Frontend

```bash
cd frontend

# Copy environment template
cp .env.example .env

# Edit .env and add your contract address
# REACT_APP_CONTRACT_ADDRESS=0xYourContractAddressHere
```

### Step 3: Start Backend (Optional)

The backend provides leaderboard functionality.

```bash
cd backend
npm start
```

Backend will run on `http://localhost:3001`

### Step 4: Start Frontend

```bash
cd frontend
npm start
```

Frontend will open in your browser at `http://localhost:3000`

## Using the Application

1. **Connect Wallet**: Click "Connect Wallet" and approve MetaMask connection
2. **Mint Resources**: Purchase resources with ETH
3. **Create NFTs**: Mint unique NFTs with custom names and power
4. **Play Actions**: Perform game actions to earn points
5. **Use Resources**: Convert resources to score points
6. **Check Stats**: View your resources, NFTs, score, and actions

## Testing

### Smart Contract Tests

```bash
cd contracts
npx hardhat test
```

## Troubleshooting

### MetaMask Issues
- **Wrong Network**: Make sure MetaMask is on the same network as your deployed contract
- **Transaction Fails**: Check you have enough ETH for gas + fees
- **Contract Not Found**: Verify the contract address in `.env` is correct

### Frontend Issues
- **"Please install MetaMask"**: Install MetaMask browser extension
- **Contract Address Not Set**: Check `.env` file has correct address
- **Build Errors**: Delete `node_modules` and run `npm install` again

### Backend Issues
- **Port Already in Use**: Change PORT in `backend/.env`
- **CORS Errors**: Backend includes CORS middleware by default

## Network Configuration

### Local Development
- Network: Hardhat Local
- Chain ID: 1337
- RPC URL: http://localhost:8545

### Sepolia Testnet
- Network: Sepolia
- Chain ID: 11155111
- RPC URL: https://sepolia.infura.io/v3/YOUR_KEY
- Faucet: https://sepoliafaucet.com/

### Mainnet
- Network: Ethereum Mainnet
- Chain ID: 1
- RPC URL: https://mainnet.infura.io/v3/YOUR_KEY

## Project Structure

```
crypto-game/
├── contracts/          # Solidity smart contracts
│   ├── contracts/     # Contract source files
│   ├── scripts/       # Deployment scripts
│   └── test/          # Contract tests
├── frontend/          # React frontend
│   ├── public/        # Static assets
│   └── src/           # React components and logic
├── backend/           # Node.js backend
│   └── src/           # Server and API endpoints
├── README.md          # Main documentation
├── DEPLOYMENT.md      # Deployment guide
└── GAME_MECHANICS.md  # Game mechanics documentation
```

## Next Steps

1. Read `DEPLOYMENT.md` for detailed deployment instructions
2. Read `GAME_MECHANICS.md` to understand game mechanics
3. Customize the game mechanics in the smart contract
4. Enhance the frontend UI/UX
5. Add more game features
6. Deploy to mainnet (after thorough testing!)

## Support

For issues or questions:
1. Check the documentation files
2. Review the contract code comments
3. Test on testnet before mainnet
4. Consider a security audit before mainnet deployment

## Security Reminders

- ⚠️ Never commit your `.env` file with private keys
- ⚠️ Test thoroughly on testnet first
- ⚠️ Consider a professional audit before mainnet
- ⚠️ The owner wallet is hardcoded in the contract
