const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("CryptoGame", function () {
  let cryptoGame;
  let owner;
  let player1;
  let player2;
  let feeWallet;
  const FEE_WALLET_ADDRESS = "0x13B87B819252A81381C3Ce35e3Bd33199F4c6650";

  beforeEach(async function () {
    [owner, player1, player2] = await ethers.getSigners();
    
    const CryptoGame = await ethers.getContractFactory("CryptoGame");
    cryptoGame = await CryptoGame.deploy();
    await cryptoGame.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should set the correct fee wallet address", async function () {
      expect(await cryptoGame.FEE_WALLET()).to.equal(FEE_WALLET_ADDRESS);
    });

    it("Should set the correct initial fee percentage", async function () {
      expect(await cryptoGame.feePercentage()).to.equal(500); // 5%
    });

    it("Should set the deployer as owner", async function () {
      expect(await cryptoGame.owner()).to.equal(owner.address);
    });
  });

  describe("makePayment", function () {
    it("Should accept payment and calculate fee correctly", async function () {
      const paymentAmount = ethers.parseEther("1.0");
      const expectedFee = paymentAmount * 500n / 10000n; // 5% fee
      const expectedBalance = paymentAmount - expectedFee;

      await expect(cryptoGame.connect(player1).makePayment({ value: paymentAmount }))
        .to.emit(cryptoGame, "PaymentReceived")
        .withArgs(player1.address, expectedBalance, expectedFee);

      expect(await cryptoGame.getBalance(player1.address)).to.equal(expectedBalance);
      expect(await cryptoGame.totalFeesCollected()).to.equal(expectedFee);
    });

    it("Should reject zero payment", async function () {
      await expect(
        cryptoGame.connect(player1).makePayment({ value: 0 })
      ).to.be.revertedWith("Payment must be greater than 0");
    });
  });

  describe("transferToPlayer", function () {
    beforeEach(async function () {
      // Give player1 some balance
      const paymentAmount = ethers.parseEther("1.0");
      await cryptoGame.connect(player1).makePayment({ value: paymentAmount });
    });

    it("Should transfer funds between players with fee", async function () {
      const player1BalanceBefore = await cryptoGame.getBalance(player1.address);
      const transferAmount = ethers.parseEther("0.5");
      const expectedFee = transferAmount * 500n / 10000n;
      const expectedReceived = transferAmount - expectedFee;

      await cryptoGame.connect(player1).transferToPlayer(player2.address, transferAmount);

      expect(await cryptoGame.getBalance(player1.address)).to.equal(
        player1BalanceBefore - transferAmount
      );
      expect(await cryptoGame.getBalance(player2.address)).to.equal(expectedReceived);
    });

    it("Should reject transfer to self", async function () {
      await expect(
        cryptoGame.connect(player1).transferToPlayer(player1.address, ethers.parseEther("0.1"))
      ).to.be.revertedWith("Cannot transfer to yourself");
    });

    it("Should reject transfer with insufficient balance", async function () {
      await expect(
        cryptoGame.connect(player1).transferToPlayer(player2.address, ethers.parseEther("10.0"))
      ).to.be.revertedWith("Insufficient balance");
    });
  });

  describe("withdraw", function () {
    beforeEach(async function () {
      // Give player1 some balance
      const paymentAmount = ethers.parseEther("1.0");
      await cryptoGame.connect(player1).makePayment({ value: paymentAmount });
    });

    it("Should allow player to withdraw balance", async function () {
      const balanceBefore = await cryptoGame.getBalance(player1.address);
      const withdrawAmount = ethers.parseEther("0.5");

      await expect(cryptoGame.connect(player1).withdraw(withdrawAmount))
        .to.emit(cryptoGame, "BalanceWithdrawn")
        .withArgs(player1.address, withdrawAmount);

      expect(await cryptoGame.getBalance(player1.address)).to.equal(
        balanceBefore - withdrawAmount
      );
    });

    it("Should reject withdrawal with insufficient balance", async function () {
      await expect(
        cryptoGame.connect(player1).withdraw(ethers.parseEther("10.0"))
      ).to.be.revertedWith("Insufficient balance");
    });
  });

  describe("setFeePercentage", function () {
    it("Should allow owner to update fee percentage", async function () {
      await cryptoGame.connect(owner).setFeePercentage(300); // 3%
      expect(await cryptoGame.feePercentage()).to.equal(300);
    });

    it("Should reject fee percentage above 10%", async function () {
      await expect(
        cryptoGame.connect(owner).setFeePercentage(1100) // 11%
      ).to.be.revertedWith("Fee cannot exceed 10%");
    });

    it("Should reject non-owner trying to update fee", async function () {
      await expect(
        cryptoGame.connect(player1).setFeePercentage(300)
      ).to.be.reverted;
    });
  });

  describe("receive", function () {
    it("Should accept direct ETH transfers", async function () {
      const paymentAmount = ethers.parseEther("1.0");
      const expectedFee = paymentAmount * 500n / 10000n;
      const expectedBalance = paymentAmount - expectedFee;

      await player1.sendTransaction({
        to: await cryptoGame.getAddress(),
        value: paymentAmount
      });

      expect(await cryptoGame.getBalance(player1.address)).to.equal(expectedBalance);
    });
  });
});
