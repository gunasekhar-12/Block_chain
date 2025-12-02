export interface Token {
  symbol: string;
  name: string;
  address: string;
  decimals: number;
  logoUrl: string;
  balance: number;
}

export const MOCK_TOKENS: Token[] = [
  {
    symbol: 'ETH',
    name: 'Ethereum',
    address: '0x0000000000000000000000000000000000000000',
    decimals: 18,
    logoUrl: '⟠',
    balance: 5.5,
  },
  {
    symbol: 'USDC',
    name: 'USD Coin',
    address: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
    decimals: 6,
    logoUrl: '💵',
    balance: 10000,
  },
  {
    symbol: 'DAI',
    name: 'Dai Stablecoin',
    address: '0x6b175474e89094c44da98b954eedeac495271d0f',
    decimals: 18,
    logoUrl: '◈',
    balance: 5000,
  },
  {
    symbol: 'WBTC',
    name: 'Wrapped Bitcoin',
    address: '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599',
    decimals: 8,
    logoUrl: '₿',
    balance: 0.25,
  },
  {
    symbol: 'LINK',
    name: 'Chainlink',
    address: '0x514910771af9ca656af840dff83e8264ecf986ca',
    decimals: 18,
    logoUrl: '🔗',
    balance: 500,
  },
  {
    symbol: 'UNI',
    name: 'Uniswap',
    address: '0x1f9840a85d5af5bf1d1762f925bdaddc4201f984',
    decimals: 18,
    logoUrl: '🦄',
    balance: 200,
  },
];

export const GOVERNANCE_TOKEN: Token = {
  symbol: 'DFX',
  name: 'DeFi Exchange Token',
  address: '0xgovernance123456789',
  decimals: 18,
  logoUrl: '💎',
  balance: 0,
};

export interface LiquidityPair {
  token0: Token;
  token1: Token;
  reserve0: number;
  reserve1: number;
  totalLiquidity: number;
  userLiquidity: number;
  apr: number;
  volume24h: number;
  fees24h: number;
}

export const MOCK_LIQUIDITY_PAIRS: LiquidityPair[] = [
  {
    token0: MOCK_TOKENS[0], // ETH
    token1: MOCK_TOKENS[1], // USDC
    reserve0: 1250.5,
    reserve1: 2500000,
    totalLiquidity: 2500,
    userLiquidity: 0,
    apr: 24.5,
    volume24h: 5400000,
    fees24h: 16200,
  },
  {
    token0: MOCK_TOKENS[2], // DAI
    token1: MOCK_TOKENS[1], // USDC
    reserve0: 1000000,
    reserve1: 1000000,
    totalLiquidity: 1000,
    userLiquidity: 0,
    apr: 12.3,
    volume24h: 2100000,
    fees24h: 6300,
  },
  {
    token0: MOCK_TOKENS[3], // WBTC
    token1: MOCK_TOKENS[0], // ETH
    reserve0: 45.8,
    reserve1: 750.2,
    totalLiquidity: 890,
    userLiquidity: 0,
    apr: 18.7,
    volume24h: 3200000,
    fees24h: 9600,
  },
];
