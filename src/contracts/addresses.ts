// This file will be auto-generated after running: npm run deploy
// For now, using placeholder addresses - replace with actual deployed addresses

export interface ContractAddresses {
  tokens: {
    WETH: string;
    USDC: string;
    USDT: string;
    DAI: string;
    WBTC: string;
  };
  pools: {
    "ETH-USDC": string;
    "ETH-DAI": string;
    "WBTC-USDC": string;
    "USDC-USDT": string;
  };
  staking: {
    ETH: string;
    USDC: string;
    WBTC: string;
  };
}

// Default addresses for local development
// These will be replaced after deployment
export const contractAddresses: ContractAddresses = {
  tokens: {
    WETH: "0x0000000000000000000000000000000000000000",
    USDC: "0x0000000000000000000000000000000000000000",
    USDT: "0x0000000000000000000000000000000000000000",
    DAI: "0x0000000000000000000000000000000000000000",
    WBTC: "0x0000000000000000000000000000000000000000",
  },
  pools: {
    "ETH-USDC": "0x0000000000000000000000000000000000000000",
    "ETH-DAI": "0x0000000000000000000000000000000000000000",
    "WBTC-USDC": "0x0000000000000000000000000000000000000000",
    "USDC-USDT": "0x0000000000000000000000000000000000000000",
  },
  staking: {
    ETH: "0x0000000000000000000000000000000000000000",
    USDC: "0x0000000000000000000000000000000000000000",
    WBTC: "0x0000000000000000000000000000000000000000",
  },
};

// Function to load deployed addresses
export async function loadDeployedAddresses(): Promise<ContractAddresses | null> {
  try {
    const response = await fetch('/deployment-addresses.json');
    if (response.ok) {
      return await response.json();
    }
  } catch (error) {
    console.warn('No deployment addresses found. Please run: npm run deploy');
  }
  return null;
}
