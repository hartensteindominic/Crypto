// Deploy script for CryptoGame contracts
const hre = require("hardhat");

async function main() {
  console.log("Deploying CryptoGame contracts...");

  // Deploy CryptoGame contract
  const CryptoGame = await hre.ethers.getContractFactory("CryptoGame");
  const cryptoGame = await CryptoGame.deploy();
  await cryptoGame.waitForDeployment();
  const cryptoGameAddress = await cryptoGame.getAddress();
  console.log("CryptoGame deployed to:", cryptoGameAddress);

  // Deploy ArtworkNFT contract
  const ArtworkNFT = await hre.ethers.getContractFactory("ArtworkNFT");
  const artworkNFT = await ArtworkNFT.deploy();
  await artworkNFT.waitForDeployment();
  const artworkNFTAddress = await artworkNFT.getAddress();
  console.log("ArtworkNFT deployed to:", artworkNFTAddress);

  console.log("\nDeployment complete!");
  console.log("Fee wallet address:", "0x13B87B819252A81381C3Ce35e3Bd33199F4c6650");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
