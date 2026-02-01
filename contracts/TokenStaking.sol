// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title TokenStaking
 * @dev Staking contract for EXC tokens with reward distribution
 */
contract TokenStaking is ReentrancyGuard, Ownable {
    IERC20 public stakingToken;
    IERC20 public rewardToken;
    
    uint256 public rewardRate = 100; // 100 tokens per block per total staked
    uint256 public lastUpdateBlock;
    uint256 public rewardPerTokenStored;
    uint256 public totalStaked;
    
    mapping(address => uint256) public stakedBalance;
    mapping(address => uint256) public rewards;
    mapping(address => uint256) public userRewardPerTokenPaid;
    mapping(address => uint256) public stakingTimestamp;
    
    uint256 public constant MIN_STAKE_AMOUNT = 100 * 10**18; // 100 tokens minimum
    uint256 public constant EARLY_UNSTAKE_FEE = 10; // 10% fee for early unstaking
    uint256 public constant MIN_STAKE_DURATION = 7 days;
    
    event Staked(address indexed user, uint256 amount);
    event Unstaked(address indexed user, uint256 amount);
    event RewardClaimed(address indexed user, uint256 reward);
    event RewardRateUpdated(uint256 newRate);
    
    constructor(address _stakingToken, address _rewardToken) {
        stakingToken = IERC20(_stakingToken);
        rewardToken = IERC20(_rewardToken);
        lastUpdateBlock = block.number;
    }
    
    /**
     * @dev Update reward variables
     */
    modifier updateReward(address account) {
        rewardPerTokenStored = rewardPerToken();
        lastUpdateBlock = block.number;
        if (account != address(0)) {
            rewards[account] = earned(account);
            userRewardPerTokenPaid[account] = rewardPerTokenStored;
        }
        _;
    }
    
    /**
     * @dev Calculate reward per token
     */
    function rewardPerToken() public view returns (uint256) {
        if (totalStaked == 0) {
            return rewardPerTokenStored;
        }
        return rewardPerTokenStored + 
            (((block.number - lastUpdateBlock) * rewardRate * 1e18) / totalStaked);
    }
    
    /**
     * @dev Calculate earned rewards for an account
     */
    function earned(address account) public view returns (uint256) {
        return ((stakedBalance[account] * 
            (rewardPerToken() - userRewardPerTokenPaid[account])) / 1e18) + 
            rewards[account];
    }
    
    /**
     * @dev Stake tokens
     */
    function stake(uint256 amount) external nonReentrant updateReward(msg.sender) {
        require(amount >= MIN_STAKE_AMOUNT, "Amount below minimum");
        
        stakingToken.transferFrom(msg.sender, address(this), amount);
        stakedBalance[msg.sender] += amount;
        totalStaked += amount;
        stakingTimestamp[msg.sender] = block.timestamp;
        
        emit Staked(msg.sender, amount);
    }
    
    /**
     * @dev Unstake tokens
     */
    function unstake(uint256 amount) external nonReentrant updateReward(msg.sender) {
        require(amount > 0, "Cannot unstake 0");
        require(stakedBalance[msg.sender] >= amount, "Insufficient staked balance");
        
        uint256 actualAmount = amount;
        
        // Apply early unstaking fee if applicable
        if (block.timestamp < stakingTimestamp[msg.sender] + MIN_STAKE_DURATION) {
            uint256 fee = (amount * EARLY_UNSTAKE_FEE) / 100;
            actualAmount = amount - fee;
            // Fee transferred to contract owner
            rewardToken.transfer(owner(), fee);
        }
        
        stakedBalance[msg.sender] -= amount;
        totalStaked -= amount;
        stakingToken.transfer(msg.sender, actualAmount);
        
        emit Unstaked(msg.sender, actualAmount);
    }
    
    /**
     * @dev Claim rewards
     */
    function claimReward() external nonReentrant updateReward(msg.sender) {
        uint256 reward = rewards[msg.sender];
        require(reward > 0, "No rewards to claim");
        
        rewards[msg.sender] = 0;
        rewardToken.transfer(msg.sender, reward);
        
        emit RewardClaimed(msg.sender, reward);
    }
    
    /**
     * @dev Update reward rate (owner only)
     */
    function setRewardRate(uint256 _rewardRate) external onlyOwner updateReward(address(0)) {
        rewardRate = _rewardRate;
        emit RewardRateUpdated(_rewardRate);
    }
    
    /**
     * @dev Get user staking info
     */
    function getUserInfo(address user) external view returns (
        uint256 staked,
        uint256 reward,
        uint256 stakedSince
    ) {
        return (
            stakedBalance[user],
            earned(user),
            stakingTimestamp[user]
        );
    }
}
