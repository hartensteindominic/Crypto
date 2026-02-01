const hre = require("hardhat");

async function main() {
  console.log("Deploying Crypto Exchange Platform contracts...");

  // Get deployer account
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying with account:", deployer.address);

  // Deploy EXC Token
  console.log("\n1. Deploying EXC Token...");
  const EXCToken = await hre.ethers.getContractFactory("EXCToken");
  const excToken = await EXCToken.deploy();
  await excToken.waitForDeployment();
  const excTokenAddress = await excToken.getAddress();
  console.log("EXC Token deployed to:", excTokenAddress);

  // Deploy Token Staking
  console.log("\n2. Deploying Token Staking...");
  const TokenStaking = await hre.ethers.getContractFactory("TokenStaking");
  const tokenStaking = await TokenStaking.deploy(excTokenAddress, excTokenAddress);
  await tokenStaking.waitForDeployment();
  const tokenStakingAddress = await tokenStaking.getAddress();
  console.log("Token Staking deployed to:", tokenStakingAddress);

  // Deploy Token Swap
  console.log("\n3. Deploying Token Swap...");
  const TokenSwap = await hre.ethers.getContractFactory("TokenSwap");
  const tokenSwap = await TokenSwap.deploy();
  await tokenSwap.waitForDeployment();
  const tokenSwapAddress = await tokenSwap.getAddress();
  console.log("Token Swap deployed to:", tokenSwapAddress);

  // Deploy Lending Pool
  console.log("\n4. Deploying Lending Pool...");
  const LendingPool = await hre.ethers.getContractFactory("LendingPool");
  const lendingPool = await LendingPool.deploy(excTokenAddress);
  await lendingPool.waitForDeployment();
  const lendingPoolAddress = await lendingPool.getAddress();
  console.log("Lending Pool deployed to:", lendingPoolAddress);

  // Deploy DAO Governance
  console.log("\n5. Deploying DAO Governance...");
  const DAOGovernance = await hre.ethers.getContractFactory("DAOGovernance");
  const daoGovernance = await DAOGovernance.deploy(excTokenAddress);
  await daoGovernance.waitForDeployment();
  const daoGovernanceAddress = await daoGovernance.getAddress();
  console.log("DAO Governance deployed to:", daoGovernanceAddress);

  // Configure contracts
  console.log("\n6. Configuring contracts...");
  
  // Add Token Staking as a minter for rewards
  await excToken.addMinter(tokenStakingAddress);
  console.log("Added Token Staking as minter");

  // Transfer some tokens to Lending Pool for liquidity
  const transferAmount = hre.ethers.parseEther("10000000"); // 10 million tokens
  await excToken.transfer(lendingPoolAddress, transferAmount);
  console.log("Transferred tokens to Lending Pool");

  // Summary
  console.log("\n=== Deployment Summary ===");
  console.log("EXC Token:", excTokenAddress);
  console.log("Token Staking:", tokenStakingAddress);
  console.log("Token Swap:", tokenSwapAddress);
  console.log("Lending Pool:", lendingPoolAddress);
  console.log("DAO Governance:", daoGovernanceAddress);
  console.log("\nDeployment completed successfully!");

  // Save deployment info
  const fs = require("fs");
  const deploymentInfo = {
    network: hre.network.name,
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
    contracts: {
      EXCToken: excTokenAddress,
      TokenStaking: tokenStakingAddress,
      TokenSwap: tokenSwapAddress,
      LendingPool: lendingPoolAddress,
      DAOGovernance: daoGovernanceAddress
    }
  };
  
  fs.writeFileSync(
    "deployments.json",
    JSON.stringify(deploymentInfo, null, 2)
  );
  console.log("\nDeployment info saved to deployments.json");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
