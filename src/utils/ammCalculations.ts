/**
 * AMM (Automated Market Maker) Calculations
 * Based on constant product formula: x * y = k
 */

export interface SwapCalculation {
  outputAmount: number;
  priceImpact: number;
  minimumReceived: number;
  fee: number;
  dynamicFeeRate: number;
  route: string[];
}

/**
 * Calculate dynamic fee based on volatility
 * Fee = baseFee + (volatilityFactor * volatilityMetric)
 */
export function calculateDynamicFee(
  reserve0: number,
  reserve1: number,
  inputAmount: number,
  baseFee: number = 0.003, // 0.3% base fee
  volatilityFactor: number = 0.002 // Additional 0-0.2% based on volatility
): number {
  // Calculate price impact as a proxy for volatility
  const priceImpact = inputAmount / reserve0;
  
  // Volatility metric: higher impact = higher volatility
  const volatilityMetric = Math.min(priceImpact * 10, 1); // Cap at 1
  
  // Dynamic fee calculation
  const dynamicFee = baseFee + (volatilityFactor * volatilityMetric);
  
  return Math.min(dynamicFee, 0.01); // Cap at 1%
}

/**
 * Calculate output amount for a swap using constant product formula
 * Formula: (x + Δx) * (y - Δy) = x * y
 * Solving for Δy: Δy = (y * Δx) / (x + Δx)
 * With fee: Δy = (y * Δx * (1 - fee)) / (x + Δx * (1 - fee))
 */
export function calculateSwapOutput(
  inputAmount: number,
  inputReserve: number,
  outputReserve: number,
  customFee?: number
): SwapCalculation {
  if (inputAmount <= 0 || inputReserve <= 0 || outputReserve <= 0) {
    return {
      outputAmount: 0,
      priceImpact: 0,
      minimumReceived: 0,
      fee: 0,
      dynamicFeeRate: 0,
      route: [],
    };
  }

  // Calculate dynamic fee
  const dynamicFeeRate = customFee ?? calculateDynamicFee(inputReserve, outputReserve, inputAmount);
  
  // Amount after fee
  const inputAmountAfterFee = inputAmount * (1 - dynamicFeeRate);
  
  // Calculate output using constant product formula
  const outputAmount = (outputReserve * inputAmountAfterFee) / (inputReserve + inputAmountAfterFee);
  
  // Calculate price impact
  const spotPrice = outputReserve / inputReserve;
  const executionPrice = outputAmount / inputAmount;
  const priceImpact = ((spotPrice - executionPrice) / spotPrice) * 100;
  
  // Minimum received with 0.5% slippage tolerance
  const minimumReceived = outputAmount * 0.995;
  
  // Fee in input token
  const fee = inputAmount * dynamicFeeRate;

  return {
    outputAmount,
    priceImpact,
    minimumReceived,
    fee,
    dynamicFeeRate: dynamicFeeRate * 100, // Convert to percentage
    route: ['Direct'],
  };
}

/**
 * Calculate liquidity provider tokens to mint
 * Formula: liquidity = sqrt(amount0 * amount1)
 */
export function calculateLiquidityMint(
  amount0: number,
  amount1: number,
  reserve0: number,
  reserve1: number,
  totalLiquidity: number
): number {
  if (totalLiquidity === 0) {
    // Initial liquidity
    return Math.sqrt(amount0 * amount1);
  }
  
  // Calculate based on ratio
  const liquidity0 = (amount0 * totalLiquidity) / reserve0;
  const liquidity1 = (amount1 * totalLiquidity) / reserve1;
  
  // Return the minimum to maintain ratio
  return Math.min(liquidity0, liquidity1);
}

/**
 * Calculate token amounts when removing liquidity
 */
export function calculateLiquidityBurn(
  liquidityAmount: number,
  totalLiquidity: number,
  reserve0: number,
  reserve1: number
): { amount0: number; amount1: number } {
  const amount0 = (liquidityAmount * reserve0) / totalLiquidity;
  const amount1 = (liquidityAmount * reserve1) / totalLiquidity;
  
  return { amount0, amount1 };
}

/**
 * Calculate impermanent loss
 * IL = 2 * sqrt(price_ratio) / (1 + price_ratio) - 1
 */
export function calculateImpermanentLoss(
  initialPrice: number,
  currentPrice: number
): number {
  const priceRatio = currentPrice / initialPrice;
  const il = (2 * Math.sqrt(priceRatio) / (1 + priceRatio)) - 1;
  return il * 100; // Return as percentage
}

/**
 * Calculate APR for liquidity provision
 */
export function calculateAPR(
  fees24h: number,
  totalLiquidityUSD: number
): number {
  if (totalLiquidityUSD === 0) return 0;
  
  const dailyReturn = fees24h / totalLiquidityUSD;
  const apr = dailyReturn * 365 * 100; // Annualized percentage
  
  return apr;
}
