# MetaMask Setup for Hardhat Local Network

## Step 1: Add Hardhat Network to MetaMask

1. Open MetaMask extension
2. Click the network dropdown at the top
3. Click "Add Network" or "Add a network manually"
4. Enter these details:

   ```
   Network Name: Hardhat Local
   RPC URL: http://127.0.0.1:8545
   Chain ID: 1337
   Currency Symbol: ETH
   ```

5. Click "Save"

## Step 2: Import Test Account

1. In MetaMask, click your account icon (top right)
2. Click "Import Account"
3. Paste this private key:
   ```
   0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
   ```
4. Click "Import"

## Step 3: Switch to Hardhat Network

1. Click the network dropdown
2. Select "Hardhat Local"

## Step 4: Refresh Your DEX

1. Go back to http://localhost:3000
2. The page should show "Blockchain Connected" in green
3. Now you can use the real smart contracts!

## Test Accounts Available

Here are Hardhat's default test accounts (each has 10,000 ETH):

```
Account #0: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
Private Key: 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80

Account #1: 0x70997970C51812dc3A010C7d01b50e0d17dc79C8
Private Key: 0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d

Account #2: 0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC
Private Key: 0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a
```

⚠️ **WARNING**: Never use these keys on mainnet or with real funds!

## Troubleshooting

**"Nonce too high" error:**
- In MetaMask: Settings → Advanced → Clear Activity Tab Data

**Can't see the network:**
- Make sure Hardhat node is running: `npx hardhat node`

**Contracts not deployed:**
- Run: `npx hardhat run scripts/deploy.js --network localhost`
