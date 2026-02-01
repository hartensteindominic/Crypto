// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title TokenSwap
 * @dev Decentralized exchange for token swaps with liquidity pools
 */
contract TokenSwap is ReentrancyGuard, Ownable {
    uint256 public constant FEE_PERCENT = 25; // 0.25% fee (25/10000)
    uint256 public constant FEE_DENOMINATOR = 10000;
    
    struct Pool {
        address tokenA;
        address tokenB;
        uint256 reserveA;
        uint256 reserveB;
        uint256 totalLiquidity;
    }
    
    mapping(bytes32 => Pool) public pools;
    mapping(bytes32 => mapping(address => uint256)) public liquidityProviders;
    
    event PoolCreated(bytes32 indexed poolId, address tokenA, address tokenB);
    event LiquidityAdded(bytes32 indexed poolId, address provider, uint256 amountA, uint256 amountB, uint256 liquidity);
    event LiquidityRemoved(bytes32 indexed poolId, address provider, uint256 amountA, uint256 amountB, uint256 liquidity);
    event TokensSwapped(bytes32 indexed poolId, address indexed user, address tokenIn, uint256 amountIn, uint256 amountOut);
    
    /**
     * @dev Get pool ID from token addresses
     */
    function getPoolId(address tokenA, address tokenB) public pure returns (bytes32) {
        return tokenA < tokenB 
            ? keccak256(abi.encodePacked(tokenA, tokenB))
            : keccak256(abi.encodePacked(tokenB, tokenA));
    }
    
    /**
     * @dev Create a new liquidity pool
     */
    function createPool(address tokenA, address tokenB) external {
        require(tokenA != tokenB, "Same tokens");
        require(tokenA != address(0) && tokenB != address(0), "Invalid addresses");
        
        bytes32 poolId = getPoolId(tokenA, tokenB);
        require(pools[poolId].tokenA == address(0), "Pool exists");
        
        if (tokenA < tokenB) {
            pools[poolId] = Pool(tokenA, tokenB, 0, 0, 0);
        } else {
            pools[poolId] = Pool(tokenB, tokenA, 0, 0, 0);
        }
        
        emit PoolCreated(poolId, tokenA, tokenB);
    }
    
    /**
     * @dev Add liquidity to a pool
     */
    function addLiquidity(
        address tokenA,
        address tokenB,
        uint256 amountA,
        uint256 amountB
    ) external nonReentrant returns (uint256 liquidity) {
        bytes32 poolId = getPoolId(tokenA, tokenB);
        Pool storage pool = pools[poolId];
        require(pool.tokenA != address(0), "Pool does not exist");
        
        // Ensure tokens are in the right order
        if (tokenA != pool.tokenA) {
            (tokenA, tokenB) = (tokenB, tokenA);
            (amountA, amountB) = (amountB, amountA);
        }
        
        // Calculate liquidity
        if (pool.totalLiquidity == 0) {
            liquidity = sqrt(amountA * amountB);
        } else {
            liquidity = min(
                (amountA * pool.totalLiquidity) / pool.reserveA,
                (amountB * pool.totalLiquidity) / pool.reserveB
            );
        }
        
        require(liquidity > 0, "Insufficient liquidity");
        
        // Transfer tokens
        IERC20(pool.tokenA).transferFrom(msg.sender, address(this), amountA);
        IERC20(pool.tokenB).transferFrom(msg.sender, address(this), amountB);
        
        // Update pool
        pool.reserveA += amountA;
        pool.reserveB += amountB;
        pool.totalLiquidity += liquidity;
        liquidityProviders[poolId][msg.sender] += liquidity;
        
        emit LiquidityAdded(poolId, msg.sender, amountA, amountB, liquidity);
    }
    
    /**
     * @dev Remove liquidity from a pool
     */
    function removeLiquidity(
        address tokenA,
        address tokenB,
        uint256 liquidity
    ) external nonReentrant returns (uint256 amountA, uint256 amountB) {
        bytes32 poolId = getPoolId(tokenA, tokenB);
        Pool storage pool = pools[poolId];
        require(liquidityProviders[poolId][msg.sender] >= liquidity, "Insufficient liquidity");
        
        // Ensure tokens are in the right order
        bool swapped = false;
        if (tokenA != pool.tokenA) {
            (tokenA, tokenB) = (tokenB, tokenA);
            swapped = true;
        }
        
        // Calculate amounts
        amountA = (liquidity * pool.reserveA) / pool.totalLiquidity;
        amountB = (liquidity * pool.reserveB) / pool.totalLiquidity;
        
        require(amountA > 0 && amountB > 0, "Insufficient amounts");
        
        // Update pool
        pool.reserveA -= amountA;
        pool.reserveB -= amountB;
        pool.totalLiquidity -= liquidity;
        liquidityProviders[poolId][msg.sender] -= liquidity;
        
        // Transfer tokens
        IERC20(pool.tokenA).transfer(msg.sender, amountA);
        IERC20(pool.tokenB).transfer(msg.sender, amountB);
        
        if (swapped) {
            (amountA, amountB) = (amountB, amountA);
        }
        
        emit LiquidityRemoved(poolId, msg.sender, amountA, amountB, liquidity);
    }
    
    /**
     * @dev Swap tokens
     */
    function swap(
        address tokenIn,
        address tokenOut,
        uint256 amountIn,
        uint256 minAmountOut
    ) external nonReentrant returns (uint256 amountOut) {
        bytes32 poolId = getPoolId(tokenIn, tokenOut);
        Pool storage pool = pools[poolId];
        require(pool.tokenA != address(0), "Pool does not exist");
        
        // Calculate output amount with fee
        uint256 amountInWithFee = amountIn * (FEE_DENOMINATOR - FEE_PERCENT);
        
        if (tokenIn == pool.tokenA) {
            amountOut = (amountInWithFee * pool.reserveB) / 
                       (pool.reserveA * FEE_DENOMINATOR + amountInWithFee);
            require(amountOut >= minAmountOut, "Slippage exceeded");
            
            // Transfer tokens
            IERC20(pool.tokenA).transferFrom(msg.sender, address(this), amountIn);
            IERC20(pool.tokenB).transfer(msg.sender, amountOut);
            
            // Update reserves
            pool.reserveA += amountIn;
            pool.reserveB -= amountOut;
        } else {
            amountOut = (amountInWithFee * pool.reserveA) / 
                       (pool.reserveB * FEE_DENOMINATOR + amountInWithFee);
            require(amountOut >= minAmountOut, "Slippage exceeded");
            
            // Transfer tokens
            IERC20(pool.tokenB).transferFrom(msg.sender, address(this), amountIn);
            IERC20(pool.tokenA).transfer(msg.sender, amountOut);
            
            // Update reserves
            pool.reserveB += amountIn;
            pool.reserveA -= amountOut;
        }
        
        emit TokensSwapped(poolId, msg.sender, tokenIn, amountIn, amountOut);
    }
    
    /**
     * @dev Get swap output amount (preview)
     */
    function getAmountOut(
        address tokenIn,
        address tokenOut,
        uint256 amountIn
    ) external view returns (uint256) {
        bytes32 poolId = getPoolId(tokenIn, tokenOut);
        Pool storage pool = pools[poolId];
        require(pool.tokenA != address(0), "Pool does not exist");
        
        uint256 amountInWithFee = amountIn * (FEE_DENOMINATOR - FEE_PERCENT);
        
        if (tokenIn == pool.tokenA) {
            return (amountInWithFee * pool.reserveB) / 
                   (pool.reserveA * FEE_DENOMINATOR + amountInWithFee);
        } else {
            return (amountInWithFee * pool.reserveA) / 
                   (pool.reserveB * FEE_DENOMINATOR + amountInWithFee);
        }
    }
    
    /**
     * @dev Square root function
     */
    function sqrt(uint256 y) internal pure returns (uint256 z) {
        if (y > 3) {
            z = y;
            uint256 x = y / 2 + 1;
            while (x < z) {
                z = x;
                x = (y / x + x) / 2;
            }
        } else if (y != 0) {
            z = 1;
        }
    }
    
    /**
     * @dev Min function
     */
    function min(uint256 a, uint256 b) internal pure returns (uint256) {
        return a < b ? a : b;
    }
}
