# Decentralized Exchange - Smart Contracts

This project now includes Solidity smart contracts for a fully functional DEX with:

## 🎯 Smart Contracts

### 1. **MockToken.sol** 
- ERC20 token implementation
- Built-in faucet functionality (1000 tokens every 24 hours)
- Used for WETH, USDC, USDT, DAI, WBTC

### 2. **LiquidityPool.sol**
- AMM-based DEX using constant product formula (x * y = k)
- Add/remove liquidity functionality
- LP token minting for liquidity providers
- Token swapping with 0.3% fee
- Price calculation and quotes

### 3. **StakingPool.sol**
- Stake tokens to earn rewards
- 10% APY on staked tokens
- Claim rewards without unstaking
- Emergency withdraw functionality

## 🚀 Quick Start

### Install Dependencies
```bash
npm install
```

### Compile Contracts
```bash
npm run compile
```

### Start Local Blockchain
```bash
npm run node
```

### Deploy Contracts (in a new terminal)
```bash
npm run deploy
```

### Run Frontend
```bash
npm run dev
```

## 📦 Deployment

The deployment script will:
1. Deploy 5 mock tokens (WETH, USDC, USDT, DAI, WBTC)
2. Create 4 liquidity pools (ETH-USDC, ETH-DAI, WBTC-USDC, USDC-USDT)
3. Deploy 3 staking pools (ETH, USDC, WBTC)
4. Fund staking pools with rewards
5. Save all addresses to `deployment-addresses.json`

## 🔧 Available Scripts

- `npm run compile` - Compile smart contracts
- `npm run node` - Start local Hardhat blockchain
- `npm run deploy` - Deploy to local network
- `npm run deploy:sepolia` - Deploy to Sepolia testnet
- `npm run test` - Run contract tests
- `npm run dev` - Start frontend development server

## 🌐 Network Configuration

### Local Development
- Network: Hardhat Local
- Chain ID: 1337
- RPC: http://127.0.0.1:8545

### Testnet Deployment
To deploy to Sepolia or other testnets:
1. Copy `.env.example` to `.env`
2. Add your private key and RPC URLs
3. Run `npm run deploy:sepolia`

## 📝 Contract Features

### Token Faucet
```solidity
// Users can claim 1000 tokens every 24 hours
mockToken.claimFromFaucet();
```

### Swap Tokens
```solidity
// Get quote for swap
uint256 amountOut = pool.getAmountOut(tokenAddress, amountIn);

// Execute swap
pool.swap(tokenInAddress, amountIn, minAmountOut);
```

### Add Liquidity
```solidity
// Add liquidity and receive LP tokens
pool.addLiquidity(amount0, amount1, minAmount0, minAmount1);
```

### Remove Liquidity
```solidity
// Remove liquidity and burn LP tokens
pool.removeLiquidity(lpTokenAmount, minAmount0, minAmount1);
```

### Stake Tokens
```solidity
// Stake tokens to earn rewards
stakingPool.stake(amount);

// Calculate pending rewards
uint256 rewards = stakingPool.calculateReward(userAddress);

// Claim rewards
stakingPool.claimReward();

// Unstake and claim rewards
stakingPool.unstake(amount);
```

## 🔐 Security Features

- ReentrancyGuard protection on all state-changing functions
- Ownable pattern for admin functions
- Minimum liquidity lock to prevent pool manipulation
- Slippage protection on swaps and liquidity operations
- Safe math with Solidity 0.8.20+ overflow protection

## 📊 Frontend Integration

The frontend will need to be updated to interact with these contracts using ethers.js:

```javascript
import { ethers } from 'ethers';
import addresses from './deployment-addresses.json';

// Connect to contract
const provider = new ethers.BrowserProvider(window.ethereum);
const signer = await provider.getSigner();
const pool = new ethers.Contract(addresses.pools['ETH-USDC'], poolABI, signer);

// Execute swap
const tx = await pool.swap(tokenIn, amountIn, minAmountOut);
await tx.wait();
```

## 🎨 Architecture

```
DEX System
├── MockToken (x5)
│   └── ERC20 + Faucet
├── LiquidityPool (x4)
│   ├── AMM Swaps
│   ├── Liquidity Management
│   └── LP Token Rewards
└── StakingPool (x3)
    ├── Token Staking
    └── Reward Distribution
```

## ⚠️ Important Notes

1. These contracts are for educational/testing purposes
2. Audit contracts before mainnet deployment
3. Use proper key management for production
4. Test thoroughly on testnets first
5. Consider gas optimization for production

## 📄 License

MIT
