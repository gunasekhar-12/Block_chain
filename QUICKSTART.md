# 🚀 QUICK START GUIDE

## Get Your DEX Running in 5 Minutes!

### Step 1: Install Dependencies (1 min)
```bash
npm install
```

### Step 2: Compile Contracts (30 sec)
```bash
npm run compile
```

### Step 3: Start Blockchain (keep running)
**Terminal 1:**
```bash
npm run node
```
⚠️ **Don't close this terminal!**

Copy one of the private keys shown (you'll need it for MetaMask).

### Step 4: Deploy Contracts (30 sec)
**Terminal 2:**
```bash
npm run deploy
```

### Step 5: Start Frontend (30 sec)
**Same terminal or Terminal 3:**
```bash
npm run dev
```

### Step 6: Setup MetaMask (2 min)

1. **Add Network in MetaMask:**
   - Network Name: `Hardhat Local`
   - RPC URL: `http://127.0.0.1:8545`
   - Chain ID: `1337`
   - Currency: `ETH`

2. **Import Test Account:**
   - Click account icon → "Import Account"
   - Paste private key from Step 3
   - Example key: `0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80`

3. **Open App:**
   - Go to: http://localhost:3000
   - Click "Connect Wallet"
   - Approve in MetaMask

## 🎉 You're Ready!

Now you can:
- ✅ Claim test tokens from faucet
- ✅ Swap tokens
- ✅ Add/remove liquidity
- ✅ Stake tokens for rewards

## 🐛 Something Wrong?

**"localhost refused to connect"**
- Check that `npm run node` is still running in Terminal 1

**"MetaMask not connecting"**
- Make sure network is set to "Hardhat Local" (Chain ID: 1337)
- Try disconnecting and reconnecting

**"Transaction failed"**
- Run `npm run deploy` again
- Make sure you have ETH in your account (test accounts have 10000 ETH)

## 📚 Need More Info?

See the full documentation in `SETUP_GUIDE.md`

---

**Enjoy your decentralized exchange!** 🚀
