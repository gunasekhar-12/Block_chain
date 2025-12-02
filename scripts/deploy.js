const hre = require("hardhat");

async function main() {
  console.log("🚀 Starting DEX deployment...\n");

  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);
  console.log("Account balance:", (await hre.ethers.provider.getBalance(deployer.address)).toString());
  console.log("");

  // Deploy Mock Tokens
  console.log("📦 Deploying Mock Tokens...");
  
  const MockToken = await hre.ethers.getContractFactory("MockToken");
  
  const eth = await MockToken.deploy("Wrapped Ether", "WETH", 1000000);
  await eth.waitForDeployment();
  console.log("✅ WETH deployed to:", await eth.getAddress());
  
  const usdc = await MockToken.deploy("USD Coin", "USDC", 1000000);
  await usdc.waitForDeployment();
  console.log("✅ USDC deployed to:", await usdc.getAddress());
  
  const usdt = await MockToken.deploy("Tether USD", "USDT", 1000000);
  await usdt.waitForDeployment();
  console.log("✅ USDT deployed to:", await usdt.getAddress());
  
  const dai = await MockToken.deploy("Dai Stablecoin", "DAI", 1000000);
  await dai.waitForDeployment();
  console.log("✅ DAI deployed to:", await dai.getAddress());
  
  const wbtc = await MockToken.deploy("Wrapped Bitcoin", "WBTC", 1000000);
  await wbtc.waitForDeployment();
  console.log("✅ WBTC deployed to:", await wbtc.getAddress());
  
  console.log("");

  // Deploy Liquidity Pools
  console.log("💧 Deploying Liquidity Pools...");
  
  const LiquidityPool = await hre.ethers.getContractFactory("LiquidityPool");
  
  const ethUsdcPool = await LiquidityPool.deploy(
    await eth.getAddress(),
    await usdc.getAddress(),
    "ETH-USDC LP",
    "ETH-USDC-LP"
  );
  await ethUsdcPool.waitForDeployment();
  console.log("✅ ETH-USDC Pool deployed to:", await ethUsdcPool.getAddress());
  
  const ethDaiPool = await LiquidityPool.deploy(
    await eth.getAddress(),
    await dai.getAddress(),
    "ETH-DAI LP",
    "ETH-DAI-LP"
  );
  await ethDaiPool.waitForDeployment();
  console.log("✅ ETH-DAI Pool deployed to:", await ethDaiPool.getAddress());
  
  const wbtcUsdcPool = await LiquidityPool.deploy(
    await wbtc.getAddress(),
    await usdc.getAddress(),
    "WBTC-USDC LP",
    "WBTC-USDC-LP"
  );
  await wbtcUsdcPool.waitForDeployment();
  console.log("✅ WBTC-USDC Pool deployed to:", await wbtcUsdcPool.getAddress());
  
  const usdcUsdtPool = await LiquidityPool.deploy(
    await usdc.getAddress(),
    await usdt.getAddress(),
    "USDC-USDT LP",
    "USDC-USDT-LP"
  );
  await usdcUsdtPool.waitForDeployment();
  console.log("✅ USDC-USDT Pool deployed to:", await usdcUsdtPool.getAddress());
  
  console.log("");

  // Deploy Staking Pools
  console.log("🎯 Deploying Staking Pools...");
  
  const StakingPool = await hre.ethers.getContractFactory("StakingPool");
  
  const ethStaking = await StakingPool.deploy(
    await eth.getAddress(),
    await eth.getAddress()
  );
  await ethStaking.waitForDeployment();
  console.log("✅ ETH Staking Pool deployed to:", await ethStaking.getAddress());
  
  const usdcStaking = await StakingPool.deploy(
    await usdc.getAddress(),
    await usdc.getAddress()
  );
  await usdcStaking.waitForDeployment();
  console.log("✅ USDC Staking Pool deployed to:", await usdcStaking.getAddress());
  
  const wbtcStaking = await StakingPool.deploy(
    await wbtc.getAddress(),
    await wbtc.getAddress()
  );
  await wbtcStaking.waitForDeployment();
  console.log("✅ WBTC Staking Pool deployed to:", await wbtcStaking.getAddress());
  
  console.log("");

  // Fund staking pools with rewards
  console.log("💰 Funding Staking Pools with rewards...");
  
  const rewardAmount = hre.ethers.parseEther("10000");
  
  await eth.mint(await ethStaking.getAddress(), rewardAmount);
  console.log("✅ Funded ETH staking pool with 10,000 WETH");
  
  await usdc.mint(await usdcStaking.getAddress(), rewardAmount);
  console.log("✅ Funded USDC staking pool with 10,000 USDC");
  
  await wbtc.mint(await wbtcStaking.getAddress(), rewardAmount);
  console.log("✅ Funded WBTC staking pool with 10,000 WBTC");
  
  console.log("");

  // Save deployment addresses
  const addresses = {
    tokens: {
      WETH: await eth.getAddress(),
      USDC: await usdc.getAddress(),
      USDT: await usdt.getAddress(),
      DAI: await dai.getAddress(),
      WBTC: await wbtc.getAddress(),
    },
    pools: {
      "ETH-USDC": await ethUsdcPool.getAddress(),
      "ETH-DAI": await ethDaiPool.getAddress(),
      "WBTC-USDC": await wbtcUsdcPool.getAddress(),
      "USDC-USDT": await usdcUsdtPool.getAddress(),
    },
    staking: {
      ETH: await ethStaking.getAddress(),
      USDC: await usdcStaking.getAddress(),
      WBTC: await wbtcStaking.getAddress(),
    },
  };

  console.log("\n📋 Deployment Summary:");
  console.log(JSON.stringify(addresses, null, 2));

  // Save to file
  const fs = require("fs");
  const path = require("path");
  
  // Save to root
  fs.writeFileSync(
    "./deployment-addresses.json",
    JSON.stringify(addresses, null, 2)
  );
  console.log("\n✅ Deployment addresses saved to deployment-addresses.json");
  
  // Save to public folder for frontend access
  const publicDir = path.join(__dirname, "..", "public");
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }
  fs.writeFileSync(
    path.join(publicDir, "deployment-addresses.json"),
    JSON.stringify(addresses, null, 2)
  );
  console.log("✅ Deployment addresses copied to public/deployment-addresses.json");

  console.log("\n🎉 Deployment complete!");
  console.log("\n📝 Next steps:");
  console.log("1. Keep the Hardhat node running");
  console.log("2. In a new terminal, run: npm run dev");
  console.log("3. Open http://localhost:3000 in your browser");
  console.log("4. Connect MetaMask to localhost:8545 (Chain ID: 1337)");
  console.log("5. Import one of the Hardhat test accounts into MetaMask");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
