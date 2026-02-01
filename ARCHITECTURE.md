# System Architecture

## Transaction Flow Diagrams

### Payment Flow (CryptoGame)
```
Player
  │
  ├─► makePayment() ──────────────────────────┐
  │                                            │
  │                    ┌───────────────────────▼──────┐
  │                    │  Calculate Fee (5%)          │
  │                    │  Payment = 1.0 ETH           │
  │                    │  Fee = 0.05 ETH              │
  │                    │  Player Gets = 0.95 ETH      │
  │                    └───────────┬──────────────────┘
  │                                │
  ├──────────────────┬─────────────┴───────────────────┐
  │                  │                                 │
  ▼                  ▼                                 ▼
Fee Wallet    Player Balance                    Contract State
0x13B8...     += 0.95 ETH                      totalFeesCollected += 0.05
(+0.05 ETH)
```

### Artwork NFT Minting Flow
```
Player
  │
  ├─► mintArtwork(layers=3) ──────────────────┐
  │   Payment: 1.0 ETH                        │
  │                                            │
  │                    ┌───────────────────────▼──────┐
  │                    │  Calculate Fee (5%)          │
  │                    │  Payment = 1.0 ETH           │
  │                    │  Fee = 0.05 ETH              │
  │                    │  Owner Gets = 0.95 ETH       │
  │                    └───────────┬──────────────────┘
  │                                │
  ├──────────────────┬─────────────┴───────────┬──────────┐
  │                  │                         │          │
  ▼                  ▼                         ▼          ▼
Fee Wallet    Contract Owner            NFT Minted    Metadata
0x13B8...     (+0.95 ETH)               Token ID: 0   Layers: 3
(+0.05 ETH)                             Owner: Player URI: ipfs://...
```

### Artwork Purchase Flow
```
Buyer                              Seller
  │                                  │
  ├─► purchaseArtwork(tokenId=0) ───┤
  │   Payment: 2.0 ETH               │
  │                                  │
  │   ┌──────────────────────────────▼───────────┐
  │   │  Calculate Fee (5%)                      │
  │   │  Sale Price = 2.0 ETH                    │
  │   │  Fee = 0.1 ETH                           │
  │   │  Seller Gets = 1.9 ETH                   │
  │   └──────────────┬───────────────────────────┘
  │                  │
  ├──────────────────┼────────────────┬─────────────┬────────────┐
  │                  │                │             │            │
  ▼                  ▼                ▼             ▼            ▼
NFT Transfer    Fee Wallet      Seller Wallet  Token State  Marketplace
Token 0:        0x13B8...       (+1.9 ETH)     Price = 0    Delisted
Buyer ← Seller  (+0.1 ETH)                     (no longer
                                                for sale)
```

### Add Layer Flow
```
Owner
  │
  ├─► addLayer(tokenId=0) ────────────────────┐
  │   Payment: 0.5 ETH                        │
  │                                            │
  │                    ┌───────────────────────▼──────┐
  │                    │  Calculate Fee (5%)          │
  │                    │  Payment = 0.5 ETH           │
  │                    │  Fee = 0.025 ETH             │
  │                    │  Owner Gets = 0.475 ETH      │
  │                    └───────────┬──────────────────┘
  │                                │
  ├──────────────────┬─────────────┴───────────────────┐
  │                  │                                 │
  ▼                  ▼                                 ▼
Fee Wallet    Contract Owner                   Token Metadata
0x13B8...     (+0.475 ETH)                     Token 0 Layers:
(+0.025 ETH)                                   3 → 4 (incremented)
```

## Contract Interactions

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend/DApp                         │
│                    (Web3.js/Ethers.js)                      │
└───────────┬────────────────────────────────┬────────────────┘
            │                                │
            │                                │
            ▼                                ▼
┌───────────────────────┐      ┌─────────────────────────────┐
│   CryptoGame.sol      │      │      ArtworkNFT.sol         │
│                       │      │                             │
│  - makePayment()      │      │  - mintArtwork()            │
│  - transferToPlayer() │      │  - purchaseArtwork()        │
│  - withdraw()         │      │  - listForSale()            │
│  - getBalance()       │      │  - addLayer()               │
│                       │      │  - ERC721 functions         │
└───────────┬───────────┘      └─────────────┬───────────────┘
            │                                │
            │  5% Fee on all transactions    │
            │                                │
            └────────────┬───────────────────┘
                         │
                         ▼
            ┌────────────────────────────┐
            │  Fee Wallet (constant)     │
            │  0x13B87B819252A81...650   │
            │                            │
            │  Receives 5% of all ETH    │
            │  transactions              │
            └────────────────────────────┘
```

## Smart Contract Dependencies

```
CryptoGame.sol
├── @openzeppelin/contracts/access/Ownable.sol
│   └── Context.sol
└── @openzeppelin/contracts/utils/ReentrancyGuard.sol

ArtworkNFT.sol
├── @openzeppelin/contracts/token/ERC721/ERC721.sol
│   ├── IERC721.sol
│   ├── IERC721Receiver.sol
│   └── ERC721Utils.sol
├── @openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol
├── @openzeppelin/contracts/access/Ownable.sol
│   └── Context.sol
└── @openzeppelin/contracts/utils/ReentrancyGuard.sol
```

## Fee Distribution Formula

For any transaction with value `V`:
- Fee = `V × feePercentage / 10000`
- Default feePercentage = 500 (5%)
- Fee goes to: `0x13B87B819252A81381C3Ce35e3Bd33199F4c6650`
- Recipient gets: `V - Fee`

Example with 1 ETH:
- Fee = 1 ETH × 500 / 10000 = 0.05 ETH
- Recipient = 1 ETH - 0.05 ETH = 0.95 ETH

## Key Contract Addresses

### Fee Wallet (Hardcoded)
```
0x13B87B819252A81381C3Ce35e3Bd33199F4c6650
```

This address receives all fees from:
- Game payments
- NFT minting
- NFT purchases
- Layer additions
- Player-to-player transfers
