// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title LendingPool
 * @dev Lending and borrowing platform with collateralized loans
 */
contract LendingPool is ReentrancyGuard, Ownable {
    IERC20 public platformToken;
    
    uint256 public constant COLLATERAL_RATIO = 150; // 150% collateralization required
    uint256 public constant LIQUIDATION_THRESHOLD = 120; // 120% threshold for liquidation
    uint256 public constant BASE_INTEREST_RATE = 5; // 5% annual interest
    uint256 public constant RATE_DENOMINATOR = 100;
    
    struct Loan {
        address borrower;
        address collateralToken;
        address borrowToken;
        uint256 collateralAmount;
        uint256 borrowedAmount;
        uint256 interestRate;
        uint256 startTime;
        bool active;
    }
    
    struct LendingPosition {
        address lender;
        address token;
        uint256 amount;
        uint256 startTime;
    }
    
    mapping(uint256 => Loan) public loans;
    mapping(uint256 => LendingPosition) public lendingPositions;
    mapping(address => uint256) public totalBorrowed;
    mapping(address => uint256) public totalLent;
    
    uint256 public loanCounter;
    uint256 public lendingCounter;
    
    event LoanCreated(uint256 indexed loanId, address borrower, uint256 collateral, uint256 borrowed);
    event LoanRepaid(uint256 indexed loanId, address borrower, uint256 amount);
    event LoanLiquidated(uint256 indexed loanId, address liquidator);
    event TokensLent(uint256 indexed positionId, address lender, address token, uint256 amount);
    event TokensWithdrawn(uint256 indexed positionId, address lender, uint256 amount);
    
    constructor(address _platformToken) {
        platformToken = IERC20(_platformToken);
    }
    
    /**
     * @dev Lend tokens to the pool
     */
    function lend(address token, uint256 amount) external nonReentrant returns (uint256) {
        require(amount > 0, "Amount must be positive");
        
        IERC20(token).transferFrom(msg.sender, address(this), amount);
        
        uint256 positionId = lendingCounter++;
        lendingPositions[positionId] = LendingPosition({
            lender: msg.sender,
            token: token,
            amount: amount,
            startTime: block.timestamp
        });
        
        totalLent[token] += amount;
        
        emit TokensLent(positionId, msg.sender, token, amount);
        return positionId;
    }
    
    /**
     * @dev Withdraw lent tokens with interest
     */
    function withdraw(uint256 positionId) external nonReentrant {
        LendingPosition storage position = lendingPositions[positionId];
        require(position.lender == msg.sender, "Not position owner");
        require(position.amount > 0, "Position closed");
        
        // Calculate interest
        uint256 duration = block.timestamp - position.startTime;
        uint256 interest = (position.amount * BASE_INTEREST_RATE * duration) / 
                          (365 days * RATE_DENOMINATOR);
        uint256 totalAmount = position.amount + interest;
        
        // Update state
        totalLent[position.token] -= position.amount;
        position.amount = 0;
        
        // Transfer tokens
        IERC20(position.token).transfer(msg.sender, totalAmount);
        
        emit TokensWithdrawn(positionId, msg.sender, totalAmount);
    }
    
    /**
     * @dev Borrow tokens with collateral
     */
    function borrow(
        address collateralToken,
        address borrowToken,
        uint256 collateralAmount,
        uint256 borrowAmount
    ) external nonReentrant returns (uint256) {
        require(collateralAmount > 0 && borrowAmount > 0, "Invalid amounts");
        
        // Check collateralization ratio
        // In production, use oracles for price feeds
        uint256 requiredCollateral = (borrowAmount * COLLATERAL_RATIO) / 100;
        require(collateralAmount >= requiredCollateral, "Insufficient collateral");
        
        // Check available liquidity
        require(
            IERC20(borrowToken).balanceOf(address(this)) >= borrowAmount,
            "Insufficient liquidity"
        );
        
        // Transfer collateral
        IERC20(collateralToken).transferFrom(msg.sender, address(this), collateralAmount);
        
        // Create loan
        uint256 loanId = loanCounter++;
        loans[loanId] = Loan({
            borrower: msg.sender,
            collateralToken: collateralToken,
            borrowToken: borrowToken,
            collateralAmount: collateralAmount,
            borrowedAmount: borrowAmount,
            interestRate: BASE_INTEREST_RATE,
            startTime: block.timestamp,
            active: true
        });
        
        totalBorrowed[borrowToken] += borrowAmount;
        
        // Transfer borrowed tokens
        IERC20(borrowToken).transfer(msg.sender, borrowAmount);
        
        emit LoanCreated(loanId, msg.sender, collateralAmount, borrowAmount);
        return loanId;
    }
    
    /**
     * @dev Repay loan
     */
    function repay(uint256 loanId) external nonReentrant {
        Loan storage loan = loans[loanId];
        require(loan.active, "Loan not active");
        require(loan.borrower == msg.sender, "Not loan owner");
        
        // Calculate total repayment with interest
        uint256 duration = block.timestamp - loan.startTime;
        uint256 interest = (loan.borrowedAmount * loan.interestRate * duration) / 
                          (365 days * RATE_DENOMINATOR);
        uint256 totalRepayment = loan.borrowedAmount + interest;
        
        // Transfer repayment
        IERC20(loan.borrowToken).transferFrom(msg.sender, address(this), totalRepayment);
        
        // Return collateral
        IERC20(loan.collateralToken).transfer(msg.sender, loan.collateralAmount);
        
        // Update state
        totalBorrowed[loan.borrowToken] -= loan.borrowedAmount;
        loan.active = false;
        
        emit LoanRepaid(loanId, msg.sender, totalRepayment);
    }
    
    /**
     * @dev Liquidate undercollateralized loan
     */
    function liquidate(uint256 loanId) external nonReentrant {
        Loan storage loan = loans[loanId];
        require(loan.active, "Loan not active");
        
        // Check if loan is undercollateralized
        // In production, use oracles for accurate price feeds
        uint256 currentCollateralValue = loan.collateralAmount;
        uint256 liquidationThreshold = (loan.borrowedAmount * LIQUIDATION_THRESHOLD) / 100;
        
        require(
            currentCollateralValue < liquidationThreshold,
            "Loan is sufficiently collateralized"
        );
        
        // Calculate repayment
        uint256 duration = block.timestamp - loan.startTime;
        uint256 interest = (loan.borrowedAmount * loan.interestRate * duration) / 
                          (365 days * RATE_DENOMINATOR);
        uint256 totalRepayment = loan.borrowedAmount + interest;
        
        // Transfer repayment from liquidator
        IERC20(loan.borrowToken).transferFrom(msg.sender, address(this), totalRepayment);
        
        // Transfer collateral to liquidator (with bonus)
        IERC20(loan.collateralToken).transfer(msg.sender, loan.collateralAmount);
        
        // Update state
        totalBorrowed[loan.borrowToken] -= loan.borrowedAmount;
        loan.active = false;
        
        emit LoanLiquidated(loanId, msg.sender);
    }
    
    /**
     * @dev Get loan details
     */
    function getLoanInfo(uint256 loanId) external view returns (
        address borrower,
        uint256 collateral,
        uint256 borrowed,
        uint256 interestDue,
        bool active
    ) {
        Loan storage loan = loans[loanId];
        uint256 duration = block.timestamp - loan.startTime;
        uint256 interest = (loan.borrowedAmount * loan.interestRate * duration) / 
                          (365 days * RATE_DENOMINATOR);
        
        return (
            loan.borrower,
            loan.collateralAmount,
            loan.borrowedAmount,
            interest,
            loan.active
        );
    }
    
    /**
     * @dev Check if loan can be liquidated
     */
    function canLiquidate(uint256 loanId) external view returns (bool) {
        Loan storage loan = loans[loanId];
        if (!loan.active) return false;
        
        uint256 currentCollateralValue = loan.collateralAmount;
        uint256 liquidationThreshold = (loan.borrowedAmount * LIQUIDATION_THRESHOLD) / 100;
        
        return currentCollateralValue < liquidationThreshold;
    }
}
