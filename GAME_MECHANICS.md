# Game Mechanics Documentation

## Overview

Crypto Game is a play-to-earn blockchain game where players can mint resources, create NFTs, and perform various game actions to earn points and climb the leaderboard.

## Core Mechanics

### 1. Resources 💎

Resources are the basic in-game currency that players can mint and use.

**Minting Resources**:
- Cost: 0.001 ETH per transaction
- Players can mint any amount of resources per transaction
- Resources are stored on-chain in the player's balance

**Using Resources**:
- Cost: 0.0005 ETH per transaction
- Each resource used grants 10 score points
- Resources are consumed when used

**Strategy**: Mint resources when you have ETH, then use them strategically to boost your score.

### 2. NFTs 🎨

NFTs are unique collectible items with custom attributes.

**Minting NFTs**:
- Cost: 0.01 ETH per NFT
- Players can customize:
  - Name: Any string
  - Power: Integer between 1-100
- Each NFT is unique and owned by the minter
- NFTs are stored on-chain with metadata

**NFT Attributes**:
- ID: Unique identifier
- Name: Custom name
- Power: Power level (1-100)
- Owner: Wallet address
- Minted At: Block timestamp

**Use Cases**: NFTs can be collected, displayed, and potentially used in future game expansions.

### 3. Game Actions 🎮

Various actions players can perform to gain score points.

**Available Actions**:

1. **Battle** ⚔️
   - Cost: 0.0005 ETH
   - Reward: 50 score points
   - Quick action to gain points

2. **Complete Quest** 🗺️
   - Cost: 0.0005 ETH
   - Reward: 100 score points
   - Higher reward for more challenging content

3. **Find Treasure** 💰
   - Cost: 0.0005 ETH
   - Reward: 75 score points
   - Moderate risk/reward action

**Strategy**: Choose actions based on your ETH budget and score goals.

### 4. Scoring System ⭐

Players earn points through various activities:

- Game Actions: 50-100 points depending on action type
- Using Resources: 10 points per resource
- Total score is cumulative and tracked on-chain

**Leaderboard**:
- Backend tracks player rankings
- Updates in real-time based on on-chain data
- Top 100 players displayed

## Fee Structure

All fees collected are automatically transferred to the owner wallet: `0x13B87B819252A81381C3Ce35e3Bd33199F4c6650`

| Action | Fee (ETH) | Purpose |
|--------|-----------|---------|
| Mint Resources | 0.001 | Create resources |
| Mint NFT | 0.01 | Create unique NFT |
| Game Actions | 0.0005 | Perform in-game actions |
| Use Resources | 0.0005 | Convert resources to points |

## Player Statistics

The game tracks the following stats for each player:

1. **Resources**: Total resources owned
2. **NFT Count**: Number of NFTs owned
3. **Score**: Total points earned
4. **Total Actions**: Number of actions performed

## Smart Contract Integration

All game mechanics are enforced by the smart contract:

- **Immutable**: Game rules cannot be changed
- **Transparent**: All transactions visible on blockchain
- **Secure**: Fees automatically transferred to owner wallet
- **Decentralized**: No central authority can alter game state

## Gameplay Loop

1. **Connect Wallet**: Connect MetaMask or compatible wallet
2. **Mint Resources**: Purchase resources with ETH
3. **Take Actions**: Perform game actions or use resources
4. **Mint NFTs**: Create collectible NFTs
5. **Earn Points**: Build your score through various activities
6. **Compete**: Climb the leaderboard against other players

## Future Expansions

Potential future features:

- NFT trading marketplace
- PvP battles using NFTs
- Resource crafting system
- Staking mechanics
- Governance tokens
- Tournament system
- Achievement system

## Tips for Players

1. **Start Small**: Begin with a few resource mints to understand the game
2. **Plan Ahead**: Calculate your ETH budget before taking actions
3. **Collect NFTs**: Build a diverse NFT collection
4. **Use Resources Wisely**: Resources give good point value
5. **Complete Quests**: Highest point reward per action
6. **Check Leaderboard**: See how you rank against others

## Technical Details

- **Blockchain**: EVM-compatible (Ethereum, Polygon, etc.)
- **Smart Contract**: Solidity 0.8.19
- **Frontend**: React + TypeScript + ethers.js
- **Backend**: Node.js + Express (for leaderboard)

## Security

- All fees automatically transferred on-chain
- No backend custody of funds
- Player data stored securely on blockchain
- Open source and auditable code
