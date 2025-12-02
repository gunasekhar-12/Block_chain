// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title LiquidityPool
 * @dev AMM-based liquidity pool implementing constant product formula (x * y = k)
 * Issues LP tokens to liquidity providers
 */
contract LiquidityPool is ERC20, ReentrancyGuard {
    IERC20 public immutable token0;
    IERC20 public immutable token1;
    
    uint256 public reserve0;
    uint256 public reserve1;
    
    uint256 private constant MINIMUM_LIQUIDITY = 10**3;
    uint256 private constant FEE_DENOMINATOR = 1000;
    uint256 private constant BASE_SWAP_FEE = 3; // 0.3% base fee
    uint256 private constant MAX_SWAP_FEE = 10; // 1.0% max fee
    
    // Dynamic fee parameters for impermanent loss protection
    uint256 private lastPrice;
    uint256 private lastUpdateTime;
    uint256 private constant VOLATILITY_WINDOW = 1 hours;
    uint256 private constant HIGH_VOLATILITY_THRESHOLD = 5; // 5% price change = high volatility
    
    event LiquidityAdded(
        address indexed provider,
        uint256 amount0,
        uint256 amount1,
        uint256 liquidity
    );
    
    event LiquidityRemoved(
        address indexed provider,
        uint256 amount0,
        uint256 amount1,
        uint256 liquidity
    );
    
    event Swap(
        address indexed user,
        address indexed tokenIn,
        uint256 amountIn,
        uint256 amountOut
    );
    
    event FeeAdjusted(uint256 oldFee, uint256 newFee, uint256 volatility);
    
    constructor(
        address _token0,
        address _token1,
        string memory lpName,
        string memory lpSymbol
    ) ERC20(lpName, lpSymbol) {
        token0 = IERC20(_token0);
        token1 = IERC20(_token1);
        lastUpdateTime = block.timestamp;
    }
    
    /**
     * @dev Calculate dynamic swap fee based on price volatility
     * Higher volatility = higher fees to protect LPs from impermanent loss
     */
    function getCurrentSwapFee() public view returns (uint256) {
        if (reserve0 == 0 || reserve1 == 0) {
            return BASE_SWAP_FEE;
        }
        
        // Calculate current price
        uint256 currentPrice = (reserve1 * 1e18) / reserve0;
        
        if (lastPrice == 0) {
            return BASE_SWAP_FEE;
        }
        
        // Calculate price change percentage
        uint256 priceChange;
        if (currentPrice > lastPrice) {
            priceChange = ((currentPrice - lastPrice) * 100) / lastPrice;
        } else {
            priceChange = ((lastPrice - currentPrice) * 100) / lastPrice;
        }
        
        // If high volatility detected, increase fee proportionally
        if (priceChange >= HIGH_VOLATILITY_THRESHOLD) {
            uint256 extraFee = (priceChange * BASE_SWAP_FEE) / 100;
            uint256 newFee = BASE_SWAP_FEE + extraFee;
            return newFee > MAX_SWAP_FEE ? MAX_SWAP_FEE : newFee;
        }
        
        return BASE_SWAP_FEE;
    }
    
    /**
     * @dev Update price oracle for volatility tracking
     */
    function updatePriceOracle() internal {
        if (block.timestamp >= lastUpdateTime + VOLATILITY_WINDOW) {
            uint256 oldFee = getCurrentSwapFee();
            lastPrice = (reserve1 * 1e18) / reserve0;
            lastUpdateTime = block.timestamp;
            uint256 newFee = getCurrentSwapFee();
            
            if (oldFee != newFee) {
                emit FeeAdjusted(oldFee, newFee, 0);
            }
        }
    }
    
    /**
     * @dev Add liquidity to the pool
     */
    function addLiquidity(
        uint256 amount0Desired,
        uint256 amount1Desired,
        uint256 amount0Min,
        uint256 amount1Min
    ) external nonReentrant returns (uint256 liquidity) {
        require(amount0Desired > 0 && amount1Desired > 0, "Invalid amounts");
        
        uint256 amount0;
        uint256 amount1;
        
        if (reserve0 == 0 && reserve1 == 0) {
            // First liquidity provision
            amount0 = amount0Desired;
            amount1 = amount1Desired;
        } else {
            // Calculate optimal amounts based on current reserves
            uint256 amount1Optimal = (amount0Desired * reserve1) / reserve0;
            
            if (amount1Optimal <= amount1Desired) {
                require(amount1Optimal >= amount1Min, "Insufficient token1");
                amount0 = amount0Desired;
                amount1 = amount1Optimal;
            } else {
                uint256 amount0Optimal = (amount1Desired * reserve0) / reserve1;
                require(amount0Optimal <= amount0Desired && amount0Optimal >= amount0Min, "Insufficient token0");
                amount0 = amount0Optimal;
                amount1 = amount1Desired;
            }
        }
        
        // Transfer tokens from user
        token0.transferFrom(msg.sender, address(this), amount0);
        token1.transferFrom(msg.sender, address(this), amount1);
        
        // Calculate liquidity to mint
        uint256 totalSupply = totalSupply();
        if (totalSupply == 0) {
            liquidity = sqrt(amount0 * amount1) - MINIMUM_LIQUIDITY;
            _mint(address(1), MINIMUM_LIQUIDITY); // Lock minimum liquidity
        } else {
            liquidity = min(
                (amount0 * totalSupply) / reserve0,
                (amount1 * totalSupply) / reserve1
            );
        }
        
        require(liquidity > 0, "Insufficient liquidity minted");
        _mint(msg.sender, liquidity);
        
        // Update reserves
        reserve0 += amount0;
        reserve1 += amount1;
        
        // Update price oracle
        updatePriceOracle();
        
        emit LiquidityAdded(msg.sender, amount0, amount1, liquidity);
    }
    
    /**
     * @dev Remove liquidity from the pool
     */
    function removeLiquidity(
        uint256 liquidity,
        uint256 amount0Min,
        uint256 amount1Min
    ) external nonReentrant returns (uint256 amount0, uint256 amount1) {
        require(liquidity > 0, "Invalid liquidity amount");
        
        uint256 totalSupply = totalSupply();
        
        // Calculate amounts to return
        amount0 = (liquidity * reserve0) / totalSupply;
        amount1 = (liquidity * reserve1) / totalSupply;
        
        require(amount0 >= amount0Min && amount1 >= amount1Min, "Insufficient output");
        
        // Burn LP tokens
        _burn(msg.sender, liquidity);
        
        // Transfer tokens back to user
        token0.transfer(msg.sender, amount0);
        token1.transfer(msg.sender, amount1);
        
        // Update reserves
        reserve0 -= amount0;
        reserve1 -= amount1;
        
        // Update price oracle
        updatePriceOracle();
        
        emit LiquidityRemoved(msg.sender, amount0, amount1, liquidity);
    }
    
    /**
     * @dev Swap tokens using constant product formula
     */
    function swap(
        address tokenIn,
        uint256 amountIn,
        uint256 amountOutMin
    ) external nonReentrant returns (uint256 amountOut) {
        require(amountIn > 0, "Invalid input amount");
        require(
            tokenIn == address(token0) || tokenIn == address(token1),
            "Invalid token"
        );
        
        bool isToken0 = tokenIn == address(token0);
        (IERC20 tokenInContract, IERC20 tokenOutContract, uint256 reserveIn, uint256 reserveOut) = isToken0
            ? (token0, token1, reserve0, reserve1)
            : (token1, token0, reserve1, reserve0);
        
        // Transfer tokens in
        tokenInContract.transferFrom(msg.sender, address(this), amountIn);
        
        // Calculate amount out with dynamic fee for impermanent loss protection
        uint256 currentFee = getCurrentSwapFee();
        uint256 amountInWithFee = amountIn * (FEE_DENOMINATOR - currentFee);
        amountOut = (amountInWithFee * reserveOut) / (reserveIn * FEE_DENOMINATOR + amountInWithFee);
        
        require(amountOut >= amountOutMin, "Insufficient output amount");
        require(amountOut < reserveOut, "Insufficient liquidity");
        
        // Transfer tokens out
        tokenOutContract.transfer(msg.sender, amountOut);
        
        // Update reserves
        if (isToken0) {
            reserve0 += amountIn;
            reserve1 -= amountOut;
        } else {
            reserve1 += amountIn;
            reserve0 -= amountOut;
        }
        
        // Update price oracle for volatility tracking
        updatePriceOracle();
        
        emit Swap(msg.sender, tokenIn, amountIn, amountOut);
    }
    
    /**
     * @dev Get quote for swap
     */
    function getAmountOut(address tokenIn, uint256 amountIn) external view returns (uint256 amountOut) {
        require(amountIn > 0, "Invalid input amount");
        require(
            tokenIn == address(token0) || tokenIn == address(token1),
            "Invalid token"
        );
        
        bool isToken0 = tokenIn == address(token0);
        (uint256 reserveIn, uint256 reserveOut) = isToken0
            ? (reserve0, reserve1)
            : (reserve1, reserve0);
        
        require(reserveIn > 0 && reserveOut > 0, "Insufficient liquidity");
        
        // Use dynamic fee based on current volatility
        uint256 currentFee = getCurrentSwapFee();
        uint256 amountInWithFee = amountIn * (FEE_DENOMINATOR - currentFee);
        amountOut = (amountInWithFee * reserveOut) / (reserveIn * FEE_DENOMINATOR + amountInWithFee);
    }
    
    /**
     * @dev Get current price ratio
     */
    function getPrice() external view returns (uint256 price0, uint256 price1) {
        require(reserve0 > 0 && reserve1 > 0, "No liquidity");
        price0 = (reserve1 * 1e18) / reserve0; // Price of token0 in terms of token1
        price1 = (reserve0 * 1e18) / reserve1; // Price of token1 in terms of token0
    }
    
    // Utility functions
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
    
    function min(uint256 x, uint256 y) internal pure returns (uint256) {
        return x < y ? x : y;
    }
}
