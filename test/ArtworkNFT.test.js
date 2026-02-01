const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("ArtworkNFT", function () {
  let artworkNFT;
  let owner;
  let player1;
  let player2;
  const FEE_WALLET_ADDRESS = "0x13B87B819252A81381C3Ce35e3Bd33199F4c6650";

  beforeEach(async function () {
    [owner, player1, player2] = await ethers.getSigners();
    
    const ArtworkNFT = await ethers.getContractFactory("ArtworkNFT");
    artworkNFT = await ArtworkNFT.deploy();
    await artworkNFT.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should set the correct fee wallet address", async function () {
      expect(await artworkNFT.FEE_WALLET()).to.equal(FEE_WALLET_ADDRESS);
    });

    it("Should set the correct initial fee percentage", async function () {
      expect(await artworkNFT.feePercentage()).to.equal(500); // 5%
    });

    it("Should set the deployer as owner", async function () {
      expect(await artworkNFT.owner()).to.equal(owner.address);
    });
  });

  describe("mintArtwork", function () {
    it("Should mint artwork with payment and fee routing", async function () {
      const mintPrice = ethers.parseEther("1.0");
      const layers = 3;
      const uri = "ipfs://test-metadata";

      await expect(
        artworkNFT.connect(player1).mintArtwork(player1.address, uri, layers, { value: mintPrice })
      ).to.emit(artworkNFT, "ArtworkMinted")
        .withArgs(player1.address, 0, layers);

      expect(await artworkNFT.ownerOf(0)).to.equal(player1.address);
      expect(await artworkNFT.getArtworkLayers(0)).to.equal(layers);
      expect(await artworkNFT.tokenURI(0)).to.equal(uri);
    });

    it("Should reject minting without payment", async function () {
      await expect(
        artworkNFT.connect(player1).mintArtwork(player1.address, "ipfs://test", 1, { value: 0 })
      ).to.be.revertedWith("Payment required to mint artwork");
    });

    it("Should reject minting with zero layers", async function () {
      await expect(
        artworkNFT.connect(player1).mintArtwork(player1.address, "ipfs://test", 0, { value: ethers.parseEther("0.1") })
      ).to.be.revertedWith("Must have at least one layer");
    });
  });

  describe("listForSale and purchaseArtwork", function () {
    beforeEach(async function () {
      // Mint an artwork for player1
      const mintPrice = ethers.parseEther("1.0");
      await artworkNFT.connect(player1).mintArtwork(player1.address, "ipfs://test", 2, { value: mintPrice });
    });

    it("Should allow owner to list artwork for sale", async function () {
      const salePrice = ethers.parseEther("2.0");
      await artworkNFT.connect(player1).listForSale(0, salePrice);
      expect(await artworkNFT.tokenPrices(0)).to.equal(salePrice);
    });

    it("Should allow purchase of listed artwork with fee routing", async function () {
      const salePrice = ethers.parseEther("2.0");
      await artworkNFT.connect(player1).listForSale(0, salePrice);

      const expectedFee = salePrice * 500n / 10000n;

      await expect(
        artworkNFT.connect(player2).purchaseArtwork(0, { value: salePrice })
      ).to.emit(artworkNFT, "ArtworkPurchased")
        .withArgs(player1.address, player2.address, 0, salePrice);

      expect(await artworkNFT.ownerOf(0)).to.equal(player2.address);
      expect(await artworkNFT.tokenPrices(0)).to.equal(0); // Should be removed from sale
    });

    it("Should reject purchase of unlisted artwork", async function () {
      await expect(
        artworkNFT.connect(player2).purchaseArtwork(0, { value: ethers.parseEther("1.0") })
      ).to.be.revertedWith("Token not for sale");
    });

    it("Should reject purchase with insufficient payment", async function () {
      const salePrice = ethers.parseEther("2.0");
      await artworkNFT.connect(player1).listForSale(0, salePrice);

      await expect(
        artworkNFT.connect(player2).purchaseArtwork(0, { value: ethers.parseEther("1.0") })
      ).to.be.revertedWith("Insufficient payment");
    });

    it("Should reject self-purchase", async function () {
      const salePrice = ethers.parseEther("2.0");
      await artworkNFT.connect(player1).listForSale(0, salePrice);

      await expect(
        artworkNFT.connect(player1).purchaseArtwork(0, { value: salePrice })
      ).to.be.revertedWith("Cannot buy your own token");
    });
  });

  describe("addLayer", function () {
    beforeEach(async function () {
      // Mint an artwork for player1
      const mintPrice = ethers.parseEther("1.0");
      await artworkNFT.connect(player1).mintArtwork(player1.address, "ipfs://test", 2, { value: mintPrice });
    });

    it("Should allow owner to add layer with payment", async function () {
      const layerPrice = ethers.parseEther("0.5");
      
      await expect(
        artworkNFT.connect(player1).addLayer(0, { value: layerPrice })
      ).to.emit(artworkNFT, "LayerAdded")
        .withArgs(0, 3);

      expect(await artworkNFT.getArtworkLayers(0)).to.equal(3);
    });

    it("Should reject adding layer without payment", async function () {
      await expect(
        artworkNFT.connect(player1).addLayer(0, { value: 0 })
      ).to.be.revertedWith("Payment required to add layer");
    });

    it("Should reject non-owner adding layer", async function () {
      await expect(
        artworkNFT.connect(player2).addLayer(0, { value: ethers.parseEther("0.5") })
      ).to.be.revertedWith("Not the token owner");
    });
  });

  describe("removeFromSale", function () {
    beforeEach(async function () {
      // Mint and list an artwork
      const mintPrice = ethers.parseEther("1.0");
      await artworkNFT.connect(player1).mintArtwork(player1.address, "ipfs://test", 2, { value: mintPrice });
      await artworkNFT.connect(player1).listForSale(0, ethers.parseEther("2.0"));
    });

    it("Should allow owner to remove artwork from sale", async function () {
      await artworkNFT.connect(player1).removeFromSale(0);
      expect(await artworkNFT.tokenPrices(0)).to.equal(0);
    });

    it("Should reject non-owner removing from sale", async function () {
      await expect(
        artworkNFT.connect(player2).removeFromSale(0)
      ).to.be.revertedWith("Not the token owner");
    });
  });

  describe("setFeePercentage", function () {
    it("Should allow owner to update fee percentage", async function () {
      await artworkNFT.connect(owner).setFeePercentage(300); // 3%
      expect(await artworkNFT.feePercentage()).to.equal(300);
    });

    it("Should reject fee percentage above 10%", async function () {
      await expect(
        artworkNFT.connect(owner).setFeePercentage(1100) // 11%
      ).to.be.revertedWith("Fee cannot exceed 10%");
    });

    it("Should reject non-owner trying to update fee", async function () {
      await expect(
        artworkNFT.connect(player1).setFeePercentage(300)
      ).to.be.reverted;
    });
  });
});
