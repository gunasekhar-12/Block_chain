import { BrowserProvider, Contract, formatUnits, parseUnits } from 'ethers';
import { MockTokenABI, LiquidityPoolABI, StakingPoolABI } from './abis';
import { loadDeployedAddresses, contractAddresses as defaultAddresses } from './addresses';

let provider: BrowserProvider | null = null;
let signer: any = null;
let currentAddresses = defaultAddresses;

// Initialize Web3 connection
export async function initWeb3() {
  if (typeof window.ethereum === 'undefined') {
    throw new Error('MetaMask is not installed. Please install MetaMask to use this dApp.');
  }

  provider = new BrowserProvider(window.ethereum);
  signer = await provider.getSigner();

  // Try to load deployed contract addresses
  const deployedAddresses = await loadDeployedAddresses();
  if (deployedAddresses) {
    currentAddresses = deployedAddresses;
  }

  return { provider, signer };
}

// Get contract instances
export function getTokenContract(tokenSymbol: string) {
  if (!signer) throw new Error('Web3 not initialized');
  const address = currentAddresses.tokens[tokenSymbol as keyof typeof currentAddresses.tokens];
  return new Contract(address, MockTokenABI, signer);
}

export function getPoolContract(poolName: string) {
  if (!signer) throw new Error('Web3 not initialized');
  const address = currentAddresses.pools[poolName as keyof typeof currentAddresses.pools];
  return new Contract(address, LiquidityPoolABI, signer);
}

export function getStakingContract(tokenSymbol: string) {
  if (!signer) throw new Error('Web3 not initialized');
  const address = currentAddresses.staking[tokenSymbol as keyof typeof currentAddresses.staking];
  return new Contract(address, StakingPoolABI, signer);
}

// Token operations
export async function getTokenBalance(tokenSymbol: string, userAddress: string): Promise<string> {
  const contract = getTokenContract(tokenSymbol);
  const balance = await contract.balanceOf(userAddress);
  return formatUnits(balance, 18);
}

export async function approveToken(tokenSymbol: string, spenderAddress: string, amount: string) {
  const contract = getTokenContract(tokenSymbol);
  const tx = await contract.approve(spenderAddress, parseUnits(amount, 18));
  await tx.wait();
  return tx;
}

export async function claimFromFaucet(tokenSymbol: string) {
  const contract = getTokenContract(tokenSymbol);
  const tx = await contract.claimFromFaucet();
  await tx.wait();
  return tx;
}

export async function getTimeUntilNextClaim(tokenSymbol: string, userAddress: string): Promise<number> {
  const contract = getTokenContract(tokenSymbol);
  const time = await contract.timeUntilNextClaim(userAddress);
  return Number(time);
}

// Swap operations
export async function swapTokens(
  poolName: string,
  tokenInAddress: string,
  amountIn: string,
  minAmountOut: string
) {
  const contract = getPoolContract(poolName);
  const tx = await contract.swap(
    tokenInAddress,
    parseUnits(amountIn, 18),
    parseUnits(minAmountOut, 18)
  );
  await tx.wait();
  return tx;
}

export async function getSwapQuote(
  poolName: string,
  tokenInAddress: string,
  amountIn: string
): Promise<string> {
  const contract = getPoolContract(poolName);
  const amountOut = await contract.getAmountOut(tokenInAddress, parseUnits(amountIn, 18));
  return formatUnits(amountOut, 18);
}

// Liquidity operations
export async function addLiquidity(
  poolName: string,
  amount0: string,
  amount1: string,
  slippage: number = 0.5
) {
  const contract = getPoolContract(poolName);
  
  const amount0Parsed = parseUnits(amount0, 18);
  const amount1Parsed = parseUnits(amount1, 18);
  const minAmount0 = (amount0Parsed * BigInt(Math.floor((100 - slippage) * 100))) / BigInt(10000);
  const minAmount1 = (amount1Parsed * BigInt(Math.floor((100 - slippage) * 100))) / BigInt(10000);
  
  const tx = await contract.addLiquidity(amount0Parsed, amount1Parsed, minAmount0, minAmount1);
  await tx.wait();
  return tx;
}

export async function removeLiquidity(
  poolName: string,
  lpAmount: string,
  slippage: number = 0.5
) {
  const contract = getPoolContract(poolName);
  
  const lpAmountParsed = parseUnits(lpAmount, 18);
  
  // Get reserves to calculate expected amounts
  const reserve0 = await contract.reserve0();
  const reserve1 = await contract.reserve1();
  const totalSupply = await contract.totalSupply();
  
  const amount0Expected = (lpAmountParsed * reserve0) / totalSupply;
  const amount1Expected = (lpAmountParsed * reserve1) / totalSupply;
  
  const minAmount0 = (amount0Expected * BigInt(Math.floor((100 - slippage) * 100))) / BigInt(10000);
  const minAmount1 = (amount1Expected * BigInt(Math.floor((100 - slippage) * 100))) / BigInt(10000);
  
  const tx = await contract.removeLiquidity(lpAmountParsed, minAmount0, minAmount1);
  await tx.wait();
  return tx;
}

export async function getLPTokenBalance(poolName: string, userAddress: string): Promise<string> {
  const contract = getPoolContract(poolName);
  const balance = await contract.balanceOf(userAddress);
  return formatUnits(balance, 18);
}

export async function getPoolReserves(poolName: string): Promise<{ reserve0: string; reserve1: string }> {
  const contract = getPoolContract(poolName);
  const reserve0 = await contract.reserve0();
  const reserve1 = await contract.reserve1();
  return {
    reserve0: formatUnits(reserve0, 18),
    reserve1: formatUnits(reserve1, 18),
  };
}

// Staking operations
export async function stakeTokens(tokenSymbol: string, amount: string) {
  const contract = getStakingContract(tokenSymbol);
  const tx = await contract.stake(parseUnits(amount, 18));
  await tx.wait();
  return tx;
}

export async function unstakeTokens(tokenSymbol: string, amount: string) {
  const contract = getStakingContract(tokenSymbol);
  const tx = await contract.unstake(parseUnits(amount, 18));
  await tx.wait();
  return tx;
}

export async function claimStakingReward(tokenSymbol: string) {
  const contract = getStakingContract(tokenSymbol);
  const tx = await contract.claimReward();
  await tx.wait();
  return tx;
}

export async function getStakingInfo(tokenSymbol: string, userAddress: string) {
  const contract = getStakingContract(tokenSymbol);
  const [amount, startTime, pendingReward, apy] = await contract.getStakeInfo(userAddress);
  return {
    stakedAmount: formatUnits(amount, 18),
    startTime: Number(startTime),
    pendingReward: formatUnits(pendingReward, 18),
    apy: Number(apy),
  };
}

export async function getTotalStaked(tokenSymbol: string): Promise<string> {
  const contract = getStakingContract(tokenSymbol);
  const total = await contract.totalStaked();
  return formatUnits(total, 18);
}

// Network and account management
export async function getCurrentNetwork(): Promise<string> {
  if (!provider) throw new Error('Web3 not initialized');
  const network = await provider.getNetwork();
  return network.name;
}

export async function getCurrentAccount(): Promise<string> {
  if (!signer) throw new Error('Web3 not initialized');
  return await signer.getAddress();
}

export async function switchNetwork(chainId: number) {
  if (typeof window.ethereum === 'undefined') return;
  
  try {
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: `0x${chainId.toString(16)}` }],
    });
  } catch (error: any) {
    // This error code indicates that the chain has not been added to MetaMask
    if (error.code === 4902) {
      throw new Error('Please add this network to MetaMask');
    }
    throw error;
  }
}

// Event listeners
export function onAccountsChanged(callback: (accounts: string[]) => void) {
  if (typeof window.ethereum !== 'undefined') {
    window.ethereum.on('accountsChanged', callback);
  }
}

export function onChainChanged(callback: (chainId: string) => void) {
  if (typeof window.ethereum !== 'undefined') {
    window.ethereum.on('chainChanged', callback);
  }
}

// Utility functions
export function formatAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export { parseUnits, formatUnits };

// Export addresses for component access
export function getContractAddresses() {
  return currentAddresses;
}
