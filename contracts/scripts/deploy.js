const hre = require("hardhat");

async function main() {
  console.log("Deploying CryptoGame contract...");

  const CryptoGame = await hre.ethers.getContractFactory("CryptoGame");
  const cryptoGame = await CryptoGame.deploy();

  await cryptoGame.waitForDeployment();

  const address = await cryptoGame.getAddress();
  console.log(`CryptoGame deployed to: ${address}`);
  console.log(`Owner wallet configured: 0x13B87B819252A81381C3Ce35e3Bd33199F4c6650`);
  
  // Log fee information
  const mintResourceFee = await cryptoGame.MINT_RESOURCE_FEE();
  const mintNFTFee = await cryptoGame.MINT_NFT_FEE();
  const gameActionFee = await cryptoGame.GAME_ACTION_FEE();
  
  console.log("\nFee Structure:");
  console.log(`- Mint Resource Fee: ${hre.ethers.formatEther(mintResourceFee)} ETH`);
  console.log(`- Mint NFT Fee: ${hre.ethers.formatEther(mintNFTFee)} ETH`);
  console.log(`- Game Action Fee: ${hre.ethers.formatEther(gameActionFee)} ETH`);
  
  console.log("\nSave this contract address for frontend configuration!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
