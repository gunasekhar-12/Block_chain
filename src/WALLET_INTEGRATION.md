# MetaMask Wallet Integration Guide

## Overview

This DEX application now includes **MetaMask integration** with proper permission handling and a **fake currency faucet** system for testing.

## Features Implemented

### 1. MetaMask Connection
- **Automatic Detection**: Checks if MetaMask extension is installed
- **Permission Request**: Prompts user to connect and grant access
- **Network Display**: Shows which network the user is connected to (Mainnet, Testnet, etc.)
- **Account Management**: Displays connected wallet address with copy functionality
- **Event Listeners**: Responds to account changes and network switches
- **Disconnect Functionality**: Allows users to disconnect their wallet

### 2. Fake Currency Faucet
- **Test Token Distribution**: Claim free test tokens for each supported cryptocurrency
- **Cooldown System**: 1-minute cooldown between claims per token
- **Visual Feedback**: Real-time countdown timer showing when next claim is available
- **Supported Tokens**:
  - ETH (1.0 per claim)
  - USDC (1000 per claim)
  - DAI (1000 per claim)
  - WBTC (0.1 per claim)
  - LINK (100 per claim)
  - UNI (50 per claim)

### 3. Visual Updates
- **New Color Scheme**: Cyan/blue gradient background (`from-indigo-950 via-blue-900 to-cyan-900`)
- **Consistent Theme**: Updated all purple accents to cyan/blue throughout the app
- **Modern UI**: Enhanced visual hierarchy with new color palette

## How to Use

### Connecting MetaMask

1. **Install MetaMask**
   - If MetaMask is not installed, click the "Install MetaMask" button
   - You'll be redirected to the MetaMask download page

2. **Connect Wallet**
   - Click "Connect MetaMask" button
   - MetaMask will prompt you to select an account
   - Click "Connect" in the MetaMask popup
   - Your wallet address will appear in the header

3. **Network Information**
   - The connected network name is displayed next to your address
   - Supported networks include:
     - Ethereum Mainnet
     - Goerli, Sepolia, Ropsten, Rinkeby Testnets
     - Polygon (Mainnet & Mumbai)
     - BSC (Mainnet & Testnet)
     - Localhost (for development)

### Using the Faucet

1. **Connect Your Wallet** first
2. **View Available Tokens** in the faucet card at the top
3. **Click "Claim"** on any token to receive test tokens
4. **Wait for Cooldown** (1 minute) before claiming the same token again
5. **Use Test Tokens** for:
   - Token swaps
   - Adding liquidity to pools
   - Staking LP tokens

## Technical Implementation

### MetaMask Integration (`/components/WalletConnect.tsx`)

```typescript
// Request account access
const accounts = await window.ethereum.request({
  method: 'eth_requestAccounts',
});

// Get network/chain ID
const chainId = await window.ethereum.request({
  method: 'eth_chainId',
});
```

### Event Listeners

```typescript
// Listen for account changes
window.ethereum.on('accountsChanged', (accounts) => {
  // Handle account switch or disconnect
});

// Listen for network changes
window.ethereum.on('chainChanged', () => {
  // Reload page on network change
});
```

### Faucet System (`/components/FakeCurrencyFaucet.tsx`)

- **Cooldown Management**: Uses timestamp comparison to enforce 1-minute cooldowns
- **State Management**: Tracks last claim time for each token
- **Visual Feedback**: Shows countdown timer and loading states
- **Toast Notifications**: Provides clear feedback for all actions

## Security Notes

⚠️ **Important**: This is a **prototype/demo application** with simulated blockchain interactions:

- Test tokens are **not real** and have no monetary value
- Transactions are **simulated** and don't interact with actual smart contracts
- For production use, you need to:
  - Deploy actual Hardhat smart contracts
  - Implement real ERC20 token contracts
  - Add proper transaction signing and gas estimation
  - Implement security measures (reentrancy guards, access control)

## Permissions Requested

When connecting, MetaMask will request permission to:
- **View wallet addresses**: To display your account information
- **Read balances**: To show your token balances (in production)
- **Suggest transactions**: To enable swaps and liquidity operations (in production)

## Troubleshooting

### "MetaMask not detected"
- Make sure MetaMask extension is installed in your browser
- Refresh the page after installing MetaMask
- Check that the extension is enabled

### Connection Rejected
- You declined the connection request in MetaMask
- Click "Connect MetaMask" again and approve the connection

### Wrong Network
- The app shows which network you're connected to
- Switch networks in MetaMask if needed
- The page will reload automatically when you switch networks

## Future Enhancements

For a production-ready version, consider adding:
- **Real Smart Contract Integration**: Connect to deployed Hardhat contracts
- **Token Balance Reading**: Display actual token balances from blockchain
- **Transaction Signing**: Implement real swap, liquidity, and staking transactions
- **Gas Estimation**: Show gas fees before confirming transactions
- **Transaction History**: Track and display user's transaction history
- **ENS Support**: Display ENS names instead of addresses
- **Multi-wallet Support**: Add WalletConnect, Coinbase Wallet, etc.

## Resources

- [MetaMask Documentation](https://docs.metamask.io/)
- [Ethereum Provider API](https://docs.metamask.io/guide/ethereum-provider.html)
- [Hardhat Documentation](https://hardhat.org/getting-started/)
- [OpenZeppelin Contracts](https://docs.openzeppelin.com/contracts/)
