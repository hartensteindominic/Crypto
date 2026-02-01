# Deployment Guide

## Prerequisites

- Node.js v16 or higher
- npm or yarn
- MetaMask or compatible Web3 wallet (for blockchain interaction)
- Git

## Local Development Setup

### 1. Clone and Install

```bash
git clone https://github.com/hartensteindominic/Crypto.git
cd Crypto
npm install
```

### 2. Environment Configuration

Copy the example environment file and configure it:

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# JWT Secret (CHANGE THIS!)
JWT_SECRET=your_secure_random_string_here

# Database
DB_PATH=./data/exchange.db

# Blockchain
NETWORK=localhost
PRIVATE_KEY=your_private_key_here

# Fee Configuration
TRADING_FEE_PERCENT=0.25
PREMIUM_ACCOUNT_FEE=9.99
```

### 3. Smart Contract Compilation

Compile the Solidity smart contracts:

```bash
npm run compile
```

This will create artifacts in the `artifacts/` directory.

### 4. Local Blockchain Setup

Start a local Hardhat blockchain in a separate terminal:

```bash
npx hardhat node
```

This starts a local Ethereum blockchain at `http://127.0.0.1:8545`.

### 5. Deploy Contracts

Deploy the smart contracts to your local blockchain:

```bash
npm run deploy
```

This will:
- Deploy EXC Token
- Deploy Token Staking
- Deploy Token Swap
- Deploy Lending Pool
- Deploy DAO Governance
- Configure contracts
- Save deployment addresses to `deployments.json`

### 6. Start Backend Server

Start the Express backend server:

```bash
npm start
```

For development with auto-reload:

```bash
npm run dev
```

The API will be available at `http://localhost:3000`.

### 7. Open Frontend

Open the frontend in your browser:

```bash
# On macOS
open frontend/index.html

# On Linux
xdg-open frontend/index.html

# Or manually open in browser
# Navigate to: file:///path/to/Crypto/frontend/index.html
```

## Testing

### Run Smart Contract Tests

```bash
npm run test:contracts
```

This runs all Hardhat tests in the `test/` directory.

### Run Backend Tests

```bash
npm test
```

## API Testing with curl

### Register a User

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "walletAddress": "0x1234567890123456789012345678901234567890",
    "email": "user@example.com",
    "username": "testuser"
  }'
```

### Login

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "walletAddress": "0x1234567890123456789012345678901234567890"
  }'
```

### Get Available Tokens

```bash
curl http://localhost:3000/api/trading/tokens
```

### Execute a Swap

```bash
curl -X POST http://localhost:3000/api/trading/swap \
  -H "Content-Type: application/json" \
  -d '{
    "tokenIn": "EXC",
    "tokenOut": "USDC",
    "amountIn": 100,
    "walletAddress": "0x1234567890123456789012345678901234567890"
  }'
```

### Stake Tokens

```bash
curl -X POST http://localhost:3000/api/staking/stake \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 1000,
    "walletAddress": "0x1234567890123456789012345678901234567890"
  }'
```

### Get Staking Rewards

```bash
curl http://localhost:3000/api/staking/rewards/0x1234567890123456789012345678901234567890
```

## Testnet Deployment

### 1. Configure Network

Add testnet configuration to `hardhat.config.js`:

```javascript
networks: {
  sepolia: {
    url: `https://sepolia.infura.io/v3/${INFURA_API_KEY}`,
    accounts: [PRIVATE_KEY]
  }
}
```

### 2. Get Test ETH

Get test ETH from a faucet:
- Sepolia: https://sepoliafaucet.com/
- Goerli: https://goerlifaucet.com/

### 3. Deploy to Testnet

```bash
npx hardhat run scripts/deploy.js --network sepolia
```

### 4. Verify Contracts

```bash
npx hardhat verify --network sepolia DEPLOYED_CONTRACT_ADDRESS
```

## Production Deployment

### Backend (Node.js)

#### Option 1: Traditional VPS (DigitalOcean, AWS EC2)

1. Set up a VPS with Ubuntu 22.04
2. Install Node.js, npm, and PM2
3. Clone repository
4. Configure environment variables
5. Start with PM2:

```bash
pm2 start backend/server.js --name crypto-exchange
pm2 save
pm2 startup
```

#### Option 2: Docker

```dockerfile
# Dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3000
CMD ["node", "backend/server.js"]
```

Build and run:

```bash
docker build -t crypto-exchange .
docker run -p 3000:3000 --env-file .env crypto-exchange
```

#### Option 3: Cloud Platform (Heroku, Railway, Render)

1. Connect GitHub repository
2. Set environment variables in dashboard
3. Deploy automatically on push

### Smart Contracts (Mainnet)

⚠️ **CRITICAL**: Do NOT deploy to mainnet without:
- [ ] Complete security audit
- [ ] Comprehensive testing
- [ ] Bug bounty program
- [ ] Insurance fund
- [ ] Legal compliance review

```bash
# Example mainnet deployment (USE WITH CAUTION)
npx hardhat run scripts/deploy.js --network mainnet
```

### Frontend

#### Option 1: Static Hosting (Netlify, Vercel, GitHub Pages)

1. Build production bundle
2. Deploy `frontend/` directory
3. Configure custom domain

#### Option 2: CDN (CloudFlare, AWS CloudFront)

1. Upload files to S3/storage
2. Configure CDN
3. Set caching rules

## Monitoring

### Backend Monitoring

Use PM2 monitoring:

```bash
pm2 monit
```

Or integrate with services like:
- DataDog
- New Relic
- Sentry

### Blockchain Monitoring

Monitor contract events using:
- Etherscan
- Tenderly
- Alchemy Notify

## Maintenance

### Database Backups

```bash
# Backup SQLite database
cp data/exchange.db data/backups/exchange-$(date +%Y%m%d).db
```

### Log Rotation

Configure logrotate for production logs.

### Updates

```bash
git pull origin main
npm install
npm run compile
pm2 restart crypto-exchange
```

## Troubleshooting

### Contract Compilation Fails

```bash
# Clear cache and retry
rm -rf cache/ artifacts/
npm run compile
```

### Backend Won't Start

1. Check if port 3000 is available
2. Verify database path exists
3. Check environment variables

### Tests Failing

1. Ensure local blockchain is running
2. Check contract addresses in tests
3. Verify OpenZeppelin dependencies

## Support

- Documentation: `docs/` directory
- Issues: GitHub Issues
- Email: support@example.com

## Security Reminders

1. Never commit `.env` file
2. Use strong JWT secrets in production
3. Enable HTTPS for all production deployments
4. Regular security updates
5. Monitor for unusual activity

## Next Steps

After successful deployment:

1. Run security audit
2. Implement monitoring
3. Set up CI/CD pipeline
4. Create backup strategy
5. Launch marketing campaign
