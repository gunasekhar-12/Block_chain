/**
 * Persistent Storage Utility
 * Handles localStorage operations for DEX data persistence
 */

const STORAGE_KEYS = {
  BALANCES: 'dex_balances',
  TRANSACTIONS: 'dex_transactions',
  FAUCET_TIMERS: 'dex_faucet_timers',
  LIQUIDITY_POSITIONS: 'dex_liquidity_positions',
  STAKING_POSITIONS: 'dex_staking_positions',
} as const;

interface StorageData {
  [key: string]: any;
}

class PersistentStorage {
  /**
   * Save data to localStorage
   */
  save<T>(key: string, data: T, walletAddress?: string): void {
    try {
      const storageKey = walletAddress ? `${key}_${walletAddress}` : key;
      localStorage.setItem(storageKey, JSON.stringify(data));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  }

  /**
   * Load data from localStorage
   */
  load<T>(key: string, walletAddress?: string, defaultValue?: T): T | null {
    try {
      const storageKey = walletAddress ? `${key}_${walletAddress}` : key;
      const item = localStorage.getItem(storageKey);
      if (item === null) {
        return defaultValue ?? null;
      }
      return JSON.parse(item) as T;
    } catch (error) {
      console.error('Error loading from localStorage:', error);
      return defaultValue ?? null;
    }
  }

  /**
   * Remove data from localStorage
   */
  remove(key: string, walletAddress?: string): void {
    try {
      const storageKey = walletAddress ? `${key}_${walletAddress}` : key;
      localStorage.removeItem(storageKey);
    } catch (error) {
      console.error('Error removing from localStorage:', error);
    }
  }

  /**
   * Clear all DEX data for a specific wallet
   */
  clearWalletData(walletAddress: string): void {
    Object.values(STORAGE_KEYS).forEach((key) => {
      this.remove(key, walletAddress);
    });
  }

  /**
   * Clear all DEX data
   */
  clearAll(): void {
    try {
      Object.values(STORAGE_KEYS).forEach((key) => {
        const keysToRemove: string[] = [];
        for (let i = 0; i < localStorage.length; i++) {
          const storageKey = localStorage.key(i);
          if (storageKey?.startsWith(key)) {
            keysToRemove.push(storageKey);
          }
        }
        keysToRemove.forEach((k) => localStorage.removeItem(k));
      });
    } catch (error) {
      console.error('Error clearing localStorage:', error);
    }
  }
}

export const persistentStorage = new PersistentStorage();
export { STORAGE_KEYS };
