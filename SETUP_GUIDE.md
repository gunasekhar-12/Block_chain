# 🚀 Decentralized Exchange - Full Blockchain Implementation

A complete decentralized exchange (DEX) built with **Solidity smart contracts** and **React frontend**. This project features AMM-based token swapping, liquidity pools, and staking functionality.

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Running the Project](#running-the-project)
- [MetaMask Setup](#metamask-setup)
- [Project Structure](#project-structure)
- [Smart Contracts](#smart-contracts)
- [Testing](#testing)
- [Deployment](#deployment)

## ✨ Features

### Smart Contract Features
- ✅ **ERC20 Token Faucet** - Claim test tokens every 24 hours
- ✅ **AMM DEX** - Constant product formula (x * y = k)
- ✅ **Liquidity Pools** - Add/remove liquidity, earn LP tokens
- ✅ **Token Swapping** - 0.3% swap fee with slippage protection
- ✅ **Staking** - Stake tokens for 10% APY rewards
- ✅ **Real-time Blockchain Integration** - All operations on-chain

### Frontend Features
- ✅ Modern React UI with dark mode
- ✅ MetaMask integration
- ✅ Real-time balance updates
- ✅ Transaction notifications
- ✅ Portfolio tracking
- ✅ Analytics dashboard

## 🛠 Tech Stack

### Blockchain
- **Solidity ^0.8.20** - Smart contract language
- **Hardhat** - Development environment
- **OpenZeppelin** - Secure contract libraries
- **Ethers.js v6** - Web3 provider library

### Frontend
- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **TailwindCSS** - Styling
- **Shadcn/ui** - Component library

## 📦 Prerequisites

Before you begin, ensure you have installed:

- **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- **npm** (comes with Node.js)
- **MetaMask** browser extension - [Install](https://metamask.io/download/)
- **Git** - [Download](https://git-scm.com/)

## 🔧 Installation

1. **Clone or navigate to the project directory**
```bash
cd "c:\Users\Guna-Sekhar\OneDrive\Desktop\Decentralized Exchange Development"
```

2. **Install dependencies**
```bash
npm install
```

This will install:
- Hardhat and blockchain development tools
- React and frontend dependencies
- Ethers.js for Web3 integration
- OpenZeppelin contracts

## 🎮 Running the Project

Follow these steps in order:

### Step 1: Compile Smart Contracts

```bash
npm run compile
```

This compiles all Solidity contracts in the `contracts/` folder.

### Step 2: Start Local Blockchain

Open a **NEW terminal window** and run:

```bash
npm run node
```

This starts a local Hardhat blockchain on `http://127.0.0.1:8545`

**⚠️ Keep this terminal running!** Don't close it.

You'll see 20 test accounts with private keys. Save one for later.

### Step 3: Deploy Contracts

Open **ANOTHER new terminal window** and run:

```bash
npm run deploy
```

This deploys all contracts to your local blockchain:
- 5 mock tokens (WETH, USDC, USDT, DAI, WBTC)
- 4 liquidity pools (ETH-USDC, ETH-DAI, WBTC-USDC, USDC-USDT)
- 3 staking pools (ETH, USDC, WBTC)

Contract addresses are saved to `deployment-addresses.json`.

### Step 4: Start Frontend

In the same terminal (or a new one):

```bash
npm run dev
```

The frontend will start on `http://localhost:3000`

### Step 5: Open in Browser

Navigate to: **http://localhost:3000**

## 🦊 MetaMask Setup

### 1. Add Local Network to MetaMask

1. Open MetaMask
2. Click the network dropdown (top center)
3. Click "Add Network" → "Add a network manually"
4. Enter these details:
   - **Network Name**: `Hardhat Local`
   - **RPC URL**: `http://127.0.0.1:8545`
   - **Chain ID**: `1337`
   - **Currency Symbol**: `ETH`
5. Click "Save"

### 2. Import Test Account

1. In MetaMask, click your account icon
2. Select "Import Account"
3. Paste one of the private keys from the Hardhat node terminal
   - Example: `0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80`
4. Click "Import"

**⚠️ WARNING**: These are test keys. Never use them on mainnet!

### 3. Connect to the DEX

1. Refresh the browser page
2. Click "Connect Wallet"
3. Approve the MetaMask popup
4. You're connected! 🎉

## 📁 Project Structure

```
Decentralized Exchange Development/
├── contracts/              # Solidity smart contracts
│   ├── MockToken.sol      # ERC20 token with faucet
│   ├── LiquidityPool.sol  # AMM DEX implementation
│   └── StakingPool.sol    # Token staking contract
├── scripts/
│   └── deploy.js          # Deployment script
├── src/
│   ├── contracts/         # Web3 integration
│   │   ├── abis.ts       # Contract ABIs
│   │   ├── addresses.ts  # Deployed addresses
│   │   └── web3.ts       # Web3 helper functions
│   ├── components/       # React components
│   ├── utils/           # Frontend utilities
│   └── App.tsx          # Main app component
├── hardhat.config.js    # Hardhat configuration
├── package.json         # Dependencies and scripts
└── vite.config.ts      # Vite configuration
```

## 📜 Smart Contracts

### MockToken.sol
```solidity
// Claim 1000 tokens every 24 hours
mockToken.claimFromFaucet();

// Check time until next claim
uint256 timeLeft = mockToken.timeUntilNextClaim(userAddress);
```

### LiquidityPool.sol
```solidity
// Get swap quote
uint256 amountOut = pool.getAmountOut(tokenInAddress, amountIn);

// Execute swap with slippage protection
pool.swap(tokenInAddress, amountIn, minAmountOut);

// Add liquidity
pool.addLiquidity(amount0, amount1, minAmount0, minAmount1);

// Remove liquidity
pool.removeLiquidity(lpTokenAmount, minAmount0, minAmount1);
```

### StakingPool.sol
```solidity
// Stake tokens (10% APY)
stakingPool.stake(amount);

// Calculate pending rewards
uint256 rewards = stakingPool.calculateReward(userAddress);

// Claim rewards without unstaking
stakingPool.claimReward();

// Unstake and claim rewards
stakingPool.unstake(amount);
```

## 🧪 Testing

### Test Contract Functionality

```bash
npm run test
```

### Manual Testing Flow

1. **Claim Tokens**: Use the faucet to get test tokens
2. **Approve Spending**: Before swapping/staking, approve token spending
3. **Swap Tokens**: Test the AMM swap functionality
4. **Add Liquidity**: Provide liquidity and receive LP tokens
5. **Stake Tokens**: Stake tokens to earn rewards
6. **Check Rewards**: View accumulated staking rewards
7. **Remove Liquidity**: Withdraw liquidity and burn LP tokens
8. **Unstake**: Unstake tokens and claim rewards

## 📊 Available Scripts

```bash
npm run compile       # Compile Solidity contracts
npm run node         # Start local blockchain
npm run deploy       # Deploy contracts to local network
npm run test         # Run contract tests
npm run dev          # Start frontend dev server
npm run build        # Build frontend for production
```

## 🌐 Network Configuration

### Local Development (Default)
- **Network**: Hardhat Local
- **Chain ID**: 1337
- **RPC**: http://127.0.0.1:8545
- **Explorer**: N/A (local only)

### Testnet Deployment (Optional)

To deploy to Sepolia testnet:

1. Copy `.env.example` to `.env`:
```bash
copy .env.example .env
```

2. Edit `.env` and add:
```env
PRIVATE_KEY=your_wallet_private_key
SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/your-api-key
```

3. Deploy:
```bash
npm run deploy:sepolia
```

## 🔐 Security Notes

- ✅ ReentrancyGuard on all state-changing functions
- ✅ Ownable pattern for admin functions
- ✅ Minimum liquidity lock prevents manipulation
- ✅ Slippage protection on swaps and liquidity ops
- ✅ SafeMath with Solidity 0.8.20+ overflow protection

**⚠️ IMPORTANT**:
- These contracts are for educational purposes
- Audit contracts before mainnet deployment
- Never commit private keys to version control
- Test thoroughly on testnets first

## 🐛 Troubleshooting

### "MetaMask Not Detected"
- Ensure MetaMask extension is installed
- Refresh the page after installing

### "Connection Failed"
- Check that Hardhat node is running (`npm run node`)
- Verify MetaMask is on Hardhat Local network (Chain ID: 1337)
- Try disconnecting and reconnecting

### "Transaction Failed"
- Ensure you have enough ETH for gas
- Check that contracts are deployed (`npm run deploy`)
- Verify token approvals before swapping/staking

### "Insufficient Liquidity"
- Add liquidity to the pool first
- Use the faucet to get test tokens

### Contracts Not Deploying
- Stop the Hardhat node (Ctrl+C)
- Restart it: `npm run node`
- Deploy again: `npm run deploy`

## 📝 Usage Examples

### 1. Claim Tokens from Faucet
```typescript
import { claimFromFaucet } from './contracts/web3';

await claimFromFaucet('WETH');
// You receive 1000 WETH tokens
```

### 2. Swap Tokens
```typescript
import { swapTokens, getSwapQuote } from './contracts/web3';

// Get quote
const amountOut = await getSwapQuote('ETH-USDC', wethAddress, '1.0');

// Execute swap
await swapTokens('ETH-USDC', wethAddress, '1.0', amountOut);
```

### 3. Add Liquidity
```typescript
import { addLiquidity } from './contracts/web3';

await addLiquidity('ETH-USDC', '10.0', '20000.0', 0.5);
// 0.5% slippage tolerance
```

### 4. Stake Tokens
```typescript
import { stakeTokens, getStakingInfo } from './contracts/web3';

// Stake 100 WETH
await stakeTokens('ETH', '100.0');

// Check staking info
const info = await getStakingInfo('ETH', userAddress);
console.log('Staked:', info.stakedAmount);
console.log('Rewards:', info.pendingReward);
```

## 🎨 Customization

### Add New Token Pairs

1. Deploy new pool in `scripts/deploy.js`:
```javascript
const newPool = await LiquidityPool.deploy(
  tokenAAddress,
  tokenBAddress,
  "TokenA-TokenB LP",
  "TOKA-TOKB-LP"
);
```

2. Add to frontend token list in `src/utils/mockTokens.ts`

### Modify Swap Fee

Edit `contracts/LiquidityPool.sol`:
```solidity
uint256 private constant SWAP_FEE = 3; // 0.3% -> Change this
```

### Adjust Staking APY

Edit `contracts/StakingPool.sol`:
```solidity
uint256 public constant REWARD_RATE = 10; // 10% -> Change this
```

## 📄 License

MIT License - feel free to use for learning and development!

## 🤝 Contributing

This is an educational project. Feel free to fork and experiment!

## 📧 Support

If you encounter issues:
1. Check the Troubleshooting section above
2. Ensure all prerequisites are installed
3. Verify the Hardhat node is running
4. Check MetaMask network settings

---

**Built with ❤️ for Web3 education**

Happy building! 🚀
