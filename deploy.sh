#!/bin/bash

# Configuration for Base Mainnet
RPC_URL="https://mainnet.base.org"
CONTRACT_PATH="src/ArtPool.sol:ArtLiquidityPool"
OWNER_ADDRESS="0x02f93c7547309ca50EEAB446DaEBE8ce8E694cBb"

echo "🚀 Starting deployment to Base..."

# forge create will compile and deploy the contract
forge create --rpc-url $RPC_URL \
  --constructor-args $OWNER_ADDRESS \
  --private-key $PRIVATE_KEY \
  --verify \
  --etherscan-api-key $BASESCAN_API_KEY \
  $CONTRACT_PATH

echo "✅ Deployment complete!"
