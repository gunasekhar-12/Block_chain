import { persistentStorage, STORAGE_KEYS } from './persistentStorage';

type BalanceChangeListener = () => void;

interface TokenBalances {
  [tokenSymbol: string]: number;
}

class BalanceStore {
  private balances: TokenBalances = {
    ETH: 0,
    USDC: 0,
    DAI: 0,
    WBTC: 0,
    LINK: 0,
    UNI: 0,
  };
  
  private listeners: BalanceChangeListener[] = [];
  private currentWallet: string | null = null;

  /**
   * Set the current wallet and load its balances
   */
  setWallet(walletAddress: string) {
    this.currentWallet = walletAddress;
    this.loadBalances();
  }

  /**
   * Load balances from localStorage
   */
  private loadBalances() {
    if (!this.currentWallet) return;

    const savedBalances = persistentStorage.load<TokenBalances>(
      STORAGE_KEYS.BALANCES,
      this.currentWallet,
      {
        ETH: 0,
        USDC: 0,
        DAI: 0,
        WBTC: 0,
        LINK: 0,
        UNI: 0,
      }
    );

    if (savedBalances) {
      this.balances = savedBalances;
      this.notify();
    }
  }

  /**
   * Save balances to localStorage
   */
  private saveBalances() {
    if (!this.currentWallet) return;
    persistentStorage.save(STORAGE_KEYS.BALANCES, this.balances, this.currentWallet);
  }

  subscribe(listener: BalanceChangeListener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notify() {
    this.listeners.forEach(listener => listener());
  }

  getBalance(token: string): number {
    return this.balances[token] || 0;
  }

  getAllBalances(): TokenBalances {
    return { ...this.balances };
  }

  addBalance(token: string, amount: number) {
    this.balances[token] = (this.balances[token] || 0) + amount;
    this.saveBalances();
    this.notify();
  }

  subtractBalance(token: string, amount: number) {
    this.balances[token] = Math.max(0, (this.balances[token] || 0) - amount);
    this.saveBalances();
    this.notify();
  }

  setBalance(token: string, amount: number) {
    this.balances[token] = amount;
    this.saveBalances();
    this.notify();
  }

  resetBalances() {
    this.balances = {
      ETH: 0,
      USDC: 0,
      DAI: 0,
      WBTC: 0,
      LINK: 0,
      UNI: 0,
    };
    this.saveBalances();
    this.notify();
  }

  /**
   * Clear wallet data and reset
   */
  clearWallet() {
    if (this.currentWallet) {
      persistentStorage.remove(STORAGE_KEYS.BALANCES, this.currentWallet);
    }
    this.currentWallet = null;
    this.resetBalances();
  }
}

export const balanceStore = new BalanceStore();
