// Example usage script for the CryptoGame contracts
// This demonstrates how to interact with the deployed contracts

const { ethers } = require("hardhat");

async function main() {
  // Get signers
  const [owner, player1, player2] = await ethers.getSigners();

  console.log("=== Deploying Contracts ===");
  
  // Deploy CryptoGame
  const CryptoGame = await ethers.getContractFactory("CryptoGame");
  const cryptoGame = await CryptoGame.deploy();
  await cryptoGame.waitForDeployment();
  const cryptoGameAddress = await cryptoGame.getAddress();
  console.log("CryptoGame deployed to:", cryptoGameAddress);

  // Deploy ArtworkNFT
  const ArtworkNFT = await ethers.getContractFactory("ArtworkNFT");
  const artworkNFT = await ArtworkNFT.deploy();
  await artworkNFT.waitForDeployment();
  const artworkNFTAddress = await artworkNFT.getAddress();
  console.log("ArtworkNFT deployed to:", artworkNFTAddress);

  console.log("\n=== Example: Making a Payment ===");
  const paymentAmount = ethers.parseEther("1.0");
  const tx1 = await cryptoGame.connect(player1).makePayment({ value: paymentAmount });
  await tx1.wait();
  const balance1 = await cryptoGame.getBalance(player1.address);
  console.log(`Player 1 made payment of 1 ETH, balance: ${ethers.formatEther(balance1)} ETH`);

  console.log("\n=== Example: Minting Artwork NFT ===");
  const mintPrice = ethers.parseEther("0.5");
  const tx2 = await artworkNFT.connect(player1).mintArtwork(
    player1.address,
    "ipfs://QmExample123",
    3, // 3 layers
    { value: mintPrice }
  );
  await tx2.wait();
  console.log("Player 1 minted artwork NFT with 3 layers");
  const layers = await artworkNFT.getArtworkLayers(0);
  console.log(`Artwork token 0 has ${layers} layers`);

  console.log("\n=== Example: Listing Artwork for Sale ===");
  const salePrice = ethers.parseEther("1.5");
  const tx3 = await artworkNFT.connect(player1).listForSale(0, salePrice);
  await tx3.wait();
  console.log(`Artwork token 0 listed for sale at ${ethers.formatEther(salePrice)} ETH`);

  console.log("\n=== Example: Purchasing Artwork ===");
  const tx4 = await artworkNFT.connect(player2).purchaseArtwork(0, { value: salePrice });
  await tx4.wait();
  const newOwner = await artworkNFT.ownerOf(0);
  console.log(`Artwork token 0 purchased by: ${newOwner}`);

  console.log("\n=== Example: Adding Layer to Artwork ===");
  const layerPrice = ethers.parseEther("0.3");
  const tx5 = await artworkNFT.connect(player2).addLayer(0, { value: layerPrice });
  await tx5.wait();
  const newLayerCount = await artworkNFT.getArtworkLayers(0);
  console.log(`Artwork token 0 now has ${newLayerCount} layers`);

  console.log("\n=== Summary ===");
  console.log("Fee Wallet:", await cryptoGame.FEE_WALLET());
  console.log("Total fees collected:", ethers.formatEther(await cryptoGame.totalFeesCollected()), "ETH");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
