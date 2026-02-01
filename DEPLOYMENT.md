# Smart Contract Deployment Guide

## Prerequisites

1. Node.js installed (v16+)
2. A wallet with some ETH for gas fees
3. Access to an Ethereum node (local, testnet, or mainnet)

## Setup

1. Navigate to the contracts directory:
```bash
cd contracts
```

2. Install dependencies:
```bash
npm install
```

## Local Development

### Deploy to Hardhat Local Network

1. Start a local Hardhat node (in one terminal):
```bash
npx hardhat node
```

2. Deploy the contract (in another terminal):
```bash
npx hardhat run scripts/deploy.js --network localhost
```

3. Save the deployed contract address for frontend configuration.

## Testnet Deployment

### Example: Sepolia Testnet

1. Get testnet ETH from a faucet:
   - Sepolia: https://sepoliafaucet.com/

2. Create a `.env` file in the contracts directory:
```
PRIVATE_KEY=your_private_key_here
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_KEY
```

3. Update `hardhat.config.js` to include Sepolia network:
```javascript
sepolia: {
  url: process.env.SEPOLIA_RPC_URL || "",
  accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : []
}
```

4. Deploy to Sepolia:
```bash
npx hardhat run scripts/deploy.js --network sepolia
```

## Mainnet Deployment

⚠️ **IMPORTANT**: Deploying to mainnet costs real ETH. Ensure you've tested thoroughly on testnets first.

1. Prepare your deployment wallet with sufficient ETH for gas fees.

2. Update `.env` with mainnet credentials:
```
PRIVATE_KEY=your_mainnet_private_key
MAINNET_RPC_URL=https://mainnet.infura.io/v3/YOUR_INFURA_KEY
```

3. Add mainnet configuration to `hardhat.config.js`:
```javascript
mainnet: {
  url: process.env.MAINNET_RPC_URL || "",
  accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : []
}
```

4. Deploy to mainnet:
```bash
npx hardhat run scripts/deploy.js --network mainnet
```

## Post-Deployment

1. **Save the contract address**: You'll need this for the frontend.

2. **Verify the contract** (optional but recommended):
```bash
npx hardhat verify --network <network-name> <contract-address>
```

3. **Update frontend configuration**:
   - Create `frontend/.env` file
   - Add: `REACT_APP_CONTRACT_ADDRESS=<your-deployed-contract-address>`

4. **Test the contract**:
   - Interact with the contract through the frontend
   - Verify fees are being sent to the owner wallet

## Contract Features

- **Owner Wallet**: `0x13B87B819252A81381C3Ce35e3Bd33199F4c6650` (hardcoded)
- **Mint Resource Fee**: 0.001 ETH
- **Mint NFT Fee**: 0.01 ETH
- **Game Action Fee**: 0.0005 ETH

All fees are automatically transferred to the owner wallet upon each transaction.

## Troubleshooting

### "Insufficient funds" error
- Ensure your wallet has enough ETH for the transaction + gas fees

### "Nonce too high" error
- Reset your account in MetaMask: Settings > Advanced > Reset Account

### Contract not deploying
- Check your RPC URL is correct
- Verify your private key is properly formatted (without 0x prefix in .env)
- Ensure you have enough ETH for gas fees

## Security Notes

- **Never commit your `.env` file** - it contains your private key
- Use a separate deployment wallet, not your main wallet
- Test thoroughly on testnets before mainnet deployment
- Consider getting a professional audit before mainnet deployment
