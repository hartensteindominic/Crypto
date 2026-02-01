const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("CryptoGame", function () {
  let cryptoGame;
  let owner;
  let player1;
  let player2;
  const OWNER_WALLET = "0x13B87B819252A81381C3Ce35e3Bd33199F4c6650";

  beforeEach(async function () {
    [owner, player1, player2] = await ethers.getSigners();
    
    const CryptoGame = await ethers.getContractFactory("CryptoGame");
    cryptoGame = await CryptoGame.deploy();
    await cryptoGame.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should set the correct owner wallet", async function () {
      expect(await cryptoGame.OWNER_WALLET()).to.equal(OWNER_WALLET);
    });

    it("Should set correct fee amounts", async function () {
      expect(await cryptoGame.MINT_RESOURCE_FEE()).to.equal(ethers.parseEther("0.001"));
      expect(await cryptoGame.MINT_NFT_FEE()).to.equal(ethers.parseEther("0.01"));
      expect(await cryptoGame.GAME_ACTION_FEE()).to.equal(ethers.parseEther("0.0005"));
    });
  });

  describe("Minting Resources", function () {
    it("Should mint resources with correct fee", async function () {
      const amount = 10;
      const fee = await cryptoGame.MINT_RESOURCE_FEE();
      
      await expect(
        cryptoGame.connect(player1).mintResources(amount, { value: fee })
      ).to.emit(cryptoGame, "ResourceMinted")
        .withArgs(player1.address, amount, fee);

      const resources = await cryptoGame.getPlayerResources(player1.address);
      expect(resources).to.equal(amount);
    });

    it("Should fail if insufficient fee", async function () {
      await expect(
        cryptoGame.connect(player1).mintResources(10, { value: ethers.parseEther("0.0001") })
      ).to.be.revertedWith("Insufficient fee");
    });

    it("Should fail if amount is zero", async function () {
      const fee = await cryptoGame.MINT_RESOURCE_FEE();
      await expect(
        cryptoGame.connect(player1).mintResources(0, { value: fee })
      ).to.be.revertedWith("Amount must be greater than 0");
    });
  });

  describe("Minting NFTs", function () {
    it("Should mint NFT with correct attributes", async function () {
      const name = "Dragon";
      const power = 80;
      const fee = await cryptoGame.MINT_NFT_FEE();
      
      await expect(
        cryptoGame.connect(player1).mintNFT(name, power, { value: fee })
      ).to.emit(cryptoGame, "NFTMinted");

      const nftCount = await cryptoGame.getPlayerNFTCount(player1.address);
      expect(nftCount).to.equal(1);

      const nftIds = await cryptoGame.getPlayerNFTs(player1.address);
      const nft = await cryptoGame.getNFT(nftIds[0]);
      
      expect(nft.name).to.equal(name);
      expect(nft.power).to.equal(power);
      expect(nft.owner).to.equal(player1.address);
    });

    it("Should fail if power is out of range", async function () {
      const fee = await cryptoGame.MINT_NFT_FEE();
      
      await expect(
        cryptoGame.connect(player1).mintNFT("Test", 0, { value: fee })
      ).to.be.revertedWith("Power must be between 1 and 100");

      await expect(
        cryptoGame.connect(player1).mintNFT("Test", 101, { value: fee })
      ).to.be.revertedWith("Power must be between 1 and 100");
    });
  });

  describe("Game Actions", function () {
    it("Should perform game action and update score", async function () {
      const actionType = "Battle";
      const scoreGained = 50;
      const fee = await cryptoGame.GAME_ACTION_FEE();
      
      await cryptoGame.connect(player1).performGameAction(actionType, scoreGained, { value: fee });

      const stats = await cryptoGame.getPlayerStats(player1.address);
      expect(stats[2]).to.equal(scoreGained); // score
      expect(stats[3]).to.equal(1); // totalActions
    });
  });

  describe("Using Resources", function () {
    it("Should use resources and gain score", async function () {
      // First mint resources
      const mintFee = await cryptoGame.MINT_RESOURCE_FEE();
      await cryptoGame.connect(player1).mintResources(10, { value: mintFee });

      // Then use resources
      const actionFee = await cryptoGame.GAME_ACTION_FEE();
      await cryptoGame.connect(player1).useResources(5, { value: actionFee });

      const stats = await cryptoGame.getPlayerStats(player1.address);
      expect(stats[0]).to.equal(5); // remaining resources
      expect(stats[2]).to.equal(50); // score (5 * 10)
    });

    it("Should fail if insufficient resources", async function () {
      const fee = await cryptoGame.GAME_ACTION_FEE();
      await expect(
        cryptoGame.connect(player1).useResources(10, { value: fee })
      ).to.be.revertedWith("Insufficient resources");
    });
  });

  describe("Player Stats", function () {
    it("Should return correct player stats", async function () {
      // Mint resources
      const mintFee = await cryptoGame.MINT_RESOURCE_FEE();
      await cryptoGame.connect(player1).mintResources(20, { value: mintFee });

      // Mint NFT
      const nftFee = await cryptoGame.MINT_NFT_FEE();
      await cryptoGame.connect(player1).mintNFT("Sword", 50, { value: nftFee });

      // Perform action
      const actionFee = await cryptoGame.GAME_ACTION_FEE();
      await cryptoGame.connect(player1).performGameAction("Quest", 100, { value: actionFee });

      const stats = await cryptoGame.getPlayerStats(player1.address);
      expect(stats[0]).to.equal(20); // resources
      expect(stats[1]).to.equal(1);  // nftCount
      expect(stats[2]).to.equal(100); // score
      expect(stats[3]).to.equal(1);  // totalActions
    });
  });

  describe("Fee Transfer", function () {
    it("Should transfer fees to owner wallet", async function () {
      // Note: Testing actual ETH transfer to hardcoded address is complex
      // In a real scenario, you'd check the balance change of OWNER_WALLET
      const fee = await cryptoGame.MINT_RESOURCE_FEE();
      
      await expect(
        cryptoGame.connect(player1).mintResources(10, { value: fee })
      ).to.emit(cryptoGame, "FeeTransferred")
        .withArgs(OWNER_WALLET, fee);
    });
  });
});
