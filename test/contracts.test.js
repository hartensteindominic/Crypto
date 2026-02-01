const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Crypto Exchange Platform Contracts", function () {
  let excToken;
  let tokenStaking;
  let tokenSwap;
  let lendingPool;
  let daoGovernance;
  let owner;
  let addr1;
  let addr2;

  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();

    // Deploy EXC Token
    const EXCToken = await ethers.getContractFactory("EXCToken");
    excToken = await EXCToken.deploy();
    await excToken.waitForDeployment();

    // Deploy Token Staking
    const TokenStaking = await ethers.getContractFactory("TokenStaking");
    tokenStaking = await TokenStaking.deploy(
      await excToken.getAddress(),
      await excToken.getAddress()
    );
    await tokenStaking.waitForDeployment();

    // Deploy Token Swap
    const TokenSwap = await ethers.getContractFactory("TokenSwap");
    tokenSwap = await TokenSwap.deploy();
    await tokenSwap.waitForDeployment();

    // Deploy Lending Pool
    const LendingPool = await ethers.getContractFactory("LendingPool");
    lendingPool = await LendingPool.deploy(await excToken.getAddress());
    await lendingPool.waitForDeployment();

    // Deploy DAO Governance
    const DAOGovernance = await ethers.getContractFactory("DAOGovernance");
    daoGovernance = await DAOGovernance.deploy(await excToken.getAddress());
    await daoGovernance.waitForDeployment();

    // Setup: Transfer tokens to test accounts
    await excToken.transfer(addr1.address, ethers.parseEther("100000"));
    await excToken.transfer(addr2.address, ethers.parseEther("100000"));
  });

  describe("EXC Token", function () {
    it("Should have correct initial supply", async function () {
      const totalSupply = await excToken.totalSupply();
      expect(totalSupply).to.equal(ethers.parseEther("1000000000"));
    });

    it("Should allow owner to add minters", async function () {
      await excToken.addMinter(addr1.address);
      expect(await excToken.minters(addr1.address)).to.be.true;
    });

    it("Should allow minters to mint tokens", async function () {
      await excToken.addMinter(addr1.address);
      await excToken.connect(addr1).mint(addr2.address, ethers.parseEther("1000"));
      
      const balance = await excToken.balanceOf(addr2.address);
      expect(balance).to.equal(ethers.parseEther("101000"));
    });

    it("Should allow users to burn tokens", async function () {
      const initialBalance = await excToken.balanceOf(addr1.address);
      await excToken.connect(addr1).burn(ethers.parseEther("1000"));
      
      const newBalance = await excToken.balanceOf(addr1.address);
      expect(newBalance).to.equal(initialBalance - ethers.parseEther("1000"));
    });
  });

  describe("Token Staking", function () {
    it("Should allow users to stake tokens", async function () {
      const stakeAmount = ethers.parseEther("1000");
      
      await excToken.connect(addr1).approve(await tokenStaking.getAddress(), stakeAmount);
      await tokenStaking.connect(addr1).stake(stakeAmount);
      
      const stakedBalance = await tokenStaking.stakedBalance(addr1.address);
      expect(stakedBalance).to.equal(stakeAmount);
    });

    it("Should reject stakes below minimum", async function () {
      const stakeAmount = ethers.parseEther("50"); // Below 100 minimum
      
      await excToken.connect(addr1).approve(await tokenStaking.getAddress(), stakeAmount);
      await expect(
        tokenStaking.connect(addr1).stake(stakeAmount)
      ).to.be.revertedWith("Amount below minimum");
    });

    it("Should allow users to unstake tokens", async function () {
      const stakeAmount = ethers.parseEther("1000");
      
      // Stake
      await excToken.connect(addr1).approve(await tokenStaking.getAddress(), stakeAmount);
      await tokenStaking.connect(addr1).stake(stakeAmount);
      
      // Unstake
      await tokenStaking.connect(addr1).unstake(stakeAmount);
      
      const stakedBalance = await tokenStaking.stakedBalance(addr1.address);
      expect(stakedBalance).to.equal(0);
    });
  });

  describe("Token Swap", function () {
    it("Should create a new pool", async function () {
      const token1 = await excToken.getAddress();
      const token2 = addr1.address; // Using address as mock token
      
      await tokenSwap.createPool(token1, token2);
      
      const poolId = await tokenSwap.getPoolId(token1, token2);
      const pool = await tokenSwap.pools(poolId);
      expect(pool.tokenA).to.not.equal(ethers.ZeroAddress);
    });

    it("Should reject creating duplicate pools", async function () {
      const token1 = await excToken.getAddress();
      const token2 = addr1.address;
      
      await tokenSwap.createPool(token1, token2);
      
      await expect(
        tokenSwap.createPool(token1, token2)
      ).to.be.revertedWith("Pool exists");
    });
  });

  describe("Lending Pool", function () {
    it("Should allow users to lend tokens", async function () {
      const lendAmount = ethers.parseEther("1000");
      
      await excToken.connect(addr1).approve(await lendingPool.getAddress(), lendAmount);
      await lendingPool.connect(addr1).lend(await excToken.getAddress(), lendAmount);
      
      const totalLent = await lendingPool.totalLent(await excToken.getAddress());
      expect(totalLent).to.equal(lendAmount);
    });

    it("Should reject insufficient collateral for borrowing", async function () {
      const collateralAmount = ethers.parseEther("100");
      const borrowAmount = ethers.parseEther("100"); // Should require 150
      
      await excToken.connect(addr1).approve(await lendingPool.getAddress(), collateralAmount);
      
      await expect(
        lendingPool.connect(addr1).borrow(
          await excToken.getAddress(),
          await excToken.getAddress(),
          collateralAmount,
          borrowAmount
        )
      ).to.be.revertedWith("Insufficient collateral");
    });
  });

  describe("DAO Governance", function () {
    it("Should allow users with enough tokens to create proposals", async function () {
      // Give addr1 enough tokens
      await excToken.transfer(addr1.address, ethers.parseEther("10000"));
      
      await daoGovernance.connect(addr1).propose("Test Proposal");
      
      const proposal = await daoGovernance.getProposal(0);
      expect(proposal.description).to.equal("Test Proposal");
    });

    it("Should reject proposals from users without enough tokens", async function () {
      // addr2 only has 100k tokens, needs 10k minimum but let's test with less
      const balance = await excToken.balanceOf(addr2.address);
      
      // Transfer away most tokens
      await excToken.connect(addr2).transfer(owner.address, balance - ethers.parseEther("100"));
      
      await expect(
        daoGovernance.connect(addr2).propose("Test Proposal")
      ).to.be.revertedWith("Insufficient tokens to propose");
    });

    it("Should allow users to vote on proposals", async function () {
      await excToken.transfer(addr1.address, ethers.parseEther("10000"));
      await daoGovernance.connect(addr1).propose("Test Proposal");
      
      await daoGovernance.connect(addr1).castVote(0, 1); // Vote for
      
      const proposal = await daoGovernance.getProposal(0);
      expect(proposal.forVotes).to.be.gt(0);
    });
  });
});
