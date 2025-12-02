// Contract ABIs for frontend integration
export const MockTokenABI = [
  "function balanceOf(address account) view returns (uint256)",
  "function approve(address spender, uint256 amount) returns (bool)",
  "function allowance(address owner, address spender) view returns (uint256)",
  "function transfer(address to, uint256 amount) returns (bool)",
  "function claimFromFaucet()",
  "function timeUntilNextClaim(address user) view returns (uint256)",
  "function decimals() view returns (uint8)",
  "function symbol() view returns (string)",
  "function name() view returns (string)",
  "event Transfer(address indexed from, address indexed to, uint256 value)",
  "event FaucetClaimed(address indexed user, uint256 amount)"
];

export const LiquidityPoolABI = [
  "function addLiquidity(uint256 amount0Desired, uint256 amount1Desired, uint256 amount0Min, uint256 amount1Min) returns (uint256 liquidity)",
  "function removeLiquidity(uint256 liquidity, uint256 amount0Min, uint256 amount1Min) returns (uint256 amount0, uint256 amount1)",
  "function swap(address tokenIn, uint256 amountIn, uint256 amountOutMin) returns (uint256 amountOut)",
  "function getAmountOut(address tokenIn, uint256 amountIn) view returns (uint256 amountOut)",
  "function getPrice() view returns (uint256 price0, uint256 price1)",
  "function reserve0() view returns (uint256)",
  "function reserve1() view returns (uint256)",
  "function token0() view returns (address)",
  "function token1() view returns (address)",
  "function balanceOf(address account) view returns (uint256)",
  "function totalSupply() view returns (uint256)",
  "event LiquidityAdded(address indexed provider, uint256 amount0, uint256 amount1, uint256 liquidity)",
  "event LiquidityRemoved(address indexed provider, uint256 amount0, uint256 amount1, uint256 liquidity)",
  "event Swap(address indexed user, address indexed tokenIn, uint256 amountIn, uint256 amountOut)"
];

export const StakingPoolABI = [
  "function stake(uint256 amount)",
  "function unstake(uint256 amount)",
  "function claimReward()",
  "function calculateReward(address user) view returns (uint256)",
  "function getStakeInfo(address user) view returns (uint256 amount, uint256 startTime, uint256 pendingReward, uint256 apy)",
  "function totalStaked() view returns (uint256)",
  "function stakingToken() view returns (address)",
  "function rewardToken() view returns (address)",
  "event Staked(address indexed user, uint256 amount)",
  "event Unstaked(address indexed user, uint256 amount, uint256 reward)",
  "event RewardClaimed(address indexed user, uint256 reward)"
];
