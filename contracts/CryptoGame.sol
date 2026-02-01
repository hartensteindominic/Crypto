// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title CryptoGame
 * @dev Main game contract handling Ethereum payments and game logic
 */
contract CryptoGame is Ownable, ReentrancyGuard {
    // Fee wallet address
    address payable public constant FEE_WALLET = payable(0x13B87B819252A81381C3Ce35e3Bd33199F4c6650);
    
    // Fee percentage (in basis points, 100 = 1%)
    uint256 public feePercentage = 500; // 5% fee
    
    // Player balances
    mapping(address => uint256) public playerBalances;
    
    // Total fees collected
    uint256 public totalFeesCollected;
    
    // Events
    event PaymentReceived(address indexed from, uint256 amount, uint256 fee);
    event BalanceWithdrawn(address indexed player, uint256 amount);
    event FeeTransferred(address indexed to, uint256 amount);
    
    constructor() Ownable(msg.sender) {}
    
    /**
     * @dev Make a payment to the game with fee routing
     */
    function makePayment() public payable nonReentrant {
        require(msg.value > 0, "Payment must be greater than 0");
        
        // Calculate fee
        uint256 fee = (msg.value * feePercentage) / 10000;
        uint256 playerAmount = msg.value - fee;
        
        // Transfer fee to fee wallet
        (bool feeSuccess, ) = FEE_WALLET.call{value: fee}("");
        require(feeSuccess, "Fee transfer failed");
        
        // Add to player balance
        playerBalances[msg.sender] += playerAmount;
        totalFeesCollected += fee;
        
        emit PaymentReceived(msg.sender, playerAmount, fee);
        emit FeeTransferred(FEE_WALLET, fee);
    }
    
    /**
     * @dev Transfer funds between players with fee
     * @param to Recipient address
     * @param amount Amount to transfer
     */
    function transferToPlayer(address to, uint256 amount) public nonReentrant {
        require(to != address(0), "Invalid recipient address");
        require(to != msg.sender, "Cannot transfer to yourself");
        require(playerBalances[msg.sender] >= amount, "Insufficient balance");
        require(amount > 0, "Amount must be greater than 0");
        
        // Calculate fee
        uint256 fee = (amount * feePercentage) / 10000;
        uint256 transferAmount = amount - fee;
        
        // Deduct from sender
        playerBalances[msg.sender] -= amount;
        
        // Add to recipient
        playerBalances[to] += transferAmount;
        
        // Update total fees collected
        totalFeesCollected += fee;
        
        // Transfer fee to fee wallet (interactions last)
        (bool feeSuccess, ) = FEE_WALLET.call{value: fee}("");
        require(feeSuccess, "Fee transfer failed");
        
        emit FeeTransferred(FEE_WALLET, fee);
    }
    
    /**
     * @dev Withdraw player balance
     * @param amount Amount to withdraw
     */
    function withdraw(uint256 amount) public nonReentrant {
        require(playerBalances[msg.sender] >= amount, "Insufficient balance");
        require(amount > 0, "Amount must be greater than 0");
        
        playerBalances[msg.sender] -= amount;
        
        (bool success, ) = payable(msg.sender).call{value: amount}("");
        require(success, "Withdrawal failed");
        
        emit BalanceWithdrawn(msg.sender, amount);
    }
    
    /**
     * @dev Get player balance
     * @param player Player address
     */
    function getBalance(address player) public view returns (uint256) {
        return playerBalances[player];
    }
    
    /**
     * @dev Update fee percentage (only owner)
     * @param newFeePercentage New fee percentage in basis points
     */
    function setFeePercentage(uint256 newFeePercentage) public onlyOwner {
        require(newFeePercentage <= 1000, "Fee cannot exceed 10%");
        feePercentage = newFeePercentage;
    }
    
    /**
     * @dev Receive function to accept direct ETH transfers
     */
    receive() external payable {
        // Calculate fee
        uint256 fee = (msg.value * feePercentage) / 10000;
        uint256 playerAmount = msg.value - fee;
        
        // Transfer fee to fee wallet
        (bool feeSuccess, ) = FEE_WALLET.call{value: fee}("");
        require(feeSuccess, "Fee transfer failed");
        
        // Add to player balance
        playerBalances[msg.sender] += playerAmount;
        totalFeesCollected += fee;
        
        emit PaymentReceived(msg.sender, playerAmount, fee);
        emit FeeTransferred(FEE_WALLET, fee);
    }
}
