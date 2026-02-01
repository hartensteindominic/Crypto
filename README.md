# Crypto Game - Ethereum-Based Gaming Platform

A blockchain-based gaming platform that enables actual Ethereum transactions with integrated fee routing and NFT artwork collectibles.

## Features

### 💰 Ethereum Payment System
- Direct Ethereum payments with automatic fee routing
- All transactions route 5% fee to the designated wallet: `0x13B87B819252A81381C3Ce35e3Bd33199F4c6650`
- Player balance tracking and management
- Secure peer-to-peer transfers between players

### 🎨 NFT Artwork System
- Mint unique artwork NFTs as game assets
- Layered artwork system - add additional layers to increase value
- Buy and sell artwork between players
- Each artwork tracks its layer count for enhanced gaming experience
- Marketplace functionality with listing and purchasing

## Smart Contracts

### CryptoGame.sol
Main game contract handling:
- Payment processing with fee routing
- Player balance management
- Inter-player transfers
- Withdrawal functionality
- Configurable fee percentage

### ArtworkNFT.sol
ERC721-based NFT contract for artwork:
- Mint artwork NFTs with payment
- Add layers to existing artwork
- List artwork for sale
- Purchase artwork from other players
- Automatic fee routing on all transactions

## Installation

### Prerequisites
- Node.js v16+ and npm
- Git

### Setup

1. Clone the repository:
```bash
git clone https://github.com/hartensteindominic/Crypto.git
cd Crypto
```

2. Install dependencies:
```bash
npm install
```

## Usage

### Compile Contracts
```bash
npm run compile
```

### Run Tests
```bash
npm test
```

### Deploy Contracts
```bash
npm run deploy
```

## Contract Interfaces

### CryptoGame Contract

#### Functions

**makePayment()**
- Make a payment to the game
- Automatically deducts 5% fee and routes to fee wallet
- Adds remaining balance to player account

**transferToPlayer(address to, uint256 amount)**
- Transfer funds to another player
- Deducts 5% fee on transfer
- Requires sufficient balance

**withdraw(uint256 amount)**
- Withdraw funds from player balance
- Transfers ETH directly to player wallet

**getBalance(address player)**
- View player's current balance

**setFeePercentage(uint256 newFeePercentage)** *(Owner only)*
- Update the fee percentage (max 10%)

### ArtworkNFT Contract

#### Functions

**mintArtwork(address to, string uri, uint256 layers)**
- Mint a new artwork NFT
- Requires payment (routes 5% fee)
- Specify number of layers at creation

**purchaseArtwork(uint256 tokenId)**
- Purchase a listed artwork from another player
- Deducts 5% fee from sale price
- Transfers NFT ownership

**listForSale(uint256 tokenId, uint256 price)**
- List your artwork for sale
- Set sale price in wei

**removeFromSale(uint256 tokenId)**
- Remove artwork from marketplace

**addLayer(uint256 tokenId)**
- Add an additional layer to your artwork
- Requires payment (routes 5% fee)

**getArtworkLayers(uint256 tokenId)**
- View number of layers in artwork

## Fee Structure

All transactions include a 5% fee that is automatically routed to the designated fee wallet:
```
Fee Wallet: 0x13B87B819252A81381C3Ce35e3Bd33199F4c6650
Default Fee: 5% (500 basis points)
Max Fee: 10% (1000 basis points)
```

## Testing

The project includes comprehensive tests covering:
- Payment processing and fee routing
- Player balance management
- NFT minting and transfers
- Artwork marketplace operations
- Layer management
- Access control and security

Run all tests:
```bash
npm test
```

## Security Features

- **ReentrancyGuard**: Protection against reentrancy attacks
- **Ownable**: Access control for administrative functions
- **Secure Transfers**: Uses call method with proper error handling
- **Balance Checks**: Prevents overdraft and invalid operations
- **Fee Limits**: Maximum 10% fee cap to protect users

## Development

### Project Structure
```
Crypto/
├── contracts/          # Solidity smart contracts
│   ├── CryptoGame.sol
│   └── ArtworkNFT.sol
├── scripts/           # Deployment scripts
│   └── deploy.js
├── test/             # Test files
│   ├── CryptoGame.test.js
│   └── ArtworkNFT.test.js
├── hardhat.config.js # Hardhat configuration
└── package.json      # Project dependencies
```

### Built With
- [Hardhat](https://hardhat.org/) - Ethereum development environment
- [OpenZeppelin](https://www.openzeppelin.com/) - Secure smart contract library
- [ethers.js](https://docs.ethers.org/) - Ethereum JavaScript library

## License

MIT License

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
