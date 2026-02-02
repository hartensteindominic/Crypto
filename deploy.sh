#!/bin/bash

# Load environment variables
source .env

echo "Deploying Art Liquidity Pool to Base..."

# Deploy command using Forge (Foundry)
forge create --rpc-url https://mainnet.base.org \
  --constructor-args "0x02f93c7547309ca50EEAB446DaEBE8ce8E694cBb" \
  --private-key $PRIVATE_KEY \
  --etherscan-api-key $BASESCAN_API_KEY \
  --verify \
  src/ArtPool.sol:ArtLiquidityPool
