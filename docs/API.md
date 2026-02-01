# API Documentation

## Authentication Endpoints

### POST /api/auth/register
Register a new user.

**Request Body:**
```json
{
  "walletAddress": "0x...",
  "email": "user@example.com",
  "username": "username"
}
```

**Response:**
```json
{
  "message": "User registered successfully",
  "userId": 1,
  "token": "jwt_token..."
}
```

### POST /api/auth/login
Login with wallet address.

**Request Body:**
```json
{
  "walletAddress": "0x..."
}
```

**Response:**
```json
{
  "message": "Login successful",
  "user": {
    "id": 1,
    "walletAddress": "0x...",
    "kycStatus": "verified"
  },
  "token": "jwt_token..."
}
```

### POST /api/auth/kyc
Submit KYC information (requires authentication).

**Headers:**
```
Authorization: Bearer {token}
```

**Request Body:**
```json
{
  "fullName": "John Doe",
  "dateOfBirth": "1990-01-01",
  "country": "US",
  "idDocument": "..."
}
```

## Trading Endpoints

### GET /api/trading/tokens
Get list of available tokens with prices.

**Response:**
```json
{
  "tokens": [
    {
      "symbol": "EXC",
      "name": "Exchange Token",
      "price": 1.5,
      "change24h": 5.2,
      "volume24h": 1500000
    }
  ]
}
```

### POST /api/trading/swap
Execute a token swap.

**Request Body:**
```json
{
  "tokenIn": "EXC",
  "tokenOut": "USDC",
  "amountIn": 100,
  "walletAddress": "0x..."
}
```

**Response:**
```json
{
  "transactionId": 123,
  "amountOut": 150,
  "fee": 0.25,
  "status": "completed"
}
```

### POST /api/trading/orders
Place a buy/sell order.

**Request Body:**
```json
{
  "type": "buy",
  "token": "EXC",
  "amount": 100,
  "price": 1.5,
  "walletAddress": "0x..."
}
```

## Staking Endpoints

### POST /api/staking/stake
Stake tokens.

**Request Body:**
```json
{
  "amount": 1000,
  "walletAddress": "0x..."
}
```

**Response:**
```json
{
  "positionId": 1,
  "amount": 1000,
  "status": "active"
}
```

### POST /api/staking/unstake
Unstake tokens.

**Request Body:**
```json
{
  "positionId": 1,
  "walletAddress": "0x..."
}
```

### GET /api/staking/rewards/:walletAddress
Get staking rewards for a user.

**Response:**
```json
{
  "totalStaked": 5000,
  "totalRewards": 250,
  "activePositions": 2
}
```

## Lending Endpoints

### POST /api/lending/lend
Lend tokens to the pool.

**Request Body:**
```json
{
  "token": "EXC",
  "amount": 1000,
  "walletAddress": "0x..."
}
```

### POST /api/lending/borrow
Borrow tokens with collateral.

**Request Body:**
```json
{
  "collateralToken": "EXC",
  "borrowToken": "USDC",
  "collateralAmount": 1500,
  "borrowAmount": 1000,
  "walletAddress": "0x..."
}
```

### GET /api/lending/positions/:walletAddress
Get user's lending positions.

## Governance Endpoints

### GET /api/governance/proposals
Get all governance proposals.

**Response:**
```json
{
  "proposals": [
    {
      "id": 1,
      "title": "Reduce Trading Fees",
      "description": "...",
      "forVotes": 50000,
      "againstVotes": 10000,
      "status": "active"
    }
  ]
}
```

### POST /api/governance/propose
Create a new proposal.

**Request Body:**
```json
{
  "title": "Proposal Title",
  "description": "Detailed description...",
  "walletAddress": "0x..."
}
```

### POST /api/governance/vote
Vote on a proposal.

**Request Body:**
```json
{
  "proposalId": 1,
  "support": 1,
  "voteWeight": 1000,
  "walletAddress": "0x..."
}
```

## Analytics Endpoints

### GET /api/analytics/portfolio/:walletAddress
Get user portfolio overview.

**Response:**
```json
{
  "portfolio": {
    "totalStaked": 5000,
    "totalLent": 3000,
    "totalBorrowed": 1000,
    "totalValue": 7000
  }
}
```

### GET /api/analytics/transactions/:walletAddress
Get transaction history with pagination.

**Query Parameters:**
- `limit`: Number of transactions (default: 50)
- `offset`: Starting position (default: 0)

### GET /api/analytics/performance/:walletAddress
Get performance metrics.

**Response:**
```json
{
  "performance": {
    "totalTransactions": 150,
    "totalFeesPaid": 37.5,
    "stakingRewards": 250,
    "profitLoss": 212.5
  }
}
```

### GET /api/analytics/platform
Get platform-wide statistics.

## Error Responses

All endpoints may return error responses:

```json
{
  "error": "Error message"
}
```

Common HTTP status codes:
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 500: Internal Server Error
