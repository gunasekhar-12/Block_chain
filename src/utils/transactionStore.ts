import { persistentStorage, STORAGE_KEYS } from './persistentStorage';

export interface Transaction {
  id: string;
  type: 'swap' | 'add_liquidity' | 'remove_liquidity' | 'stake' | 'unstake' | 'claim_rewards' | 'faucet';
  timestamp: number;
  status: 'pending' | 'success' | 'failed';
  from?: string;
  to?: string;
  amount?: number;
  amount2?: number;
  token?: string;
  token2?: string;
  hash?: string;
  description: string;
}

class TransactionStore {
  private transactions: Transaction[] = [];
  private listeners: Set<(transactions: Transaction[]) => void> = new Set();
  private currentWallet: string | null = null;

  /**
   * Set the current wallet and load its transactions
   */
  setWallet(walletAddress: string) {
    this.currentWallet = walletAddress;
    this.loadTransactions();
  }

  /**
   * Load transactions from localStorage
   */
  private loadTransactions() {
    if (!this.currentWallet) return;

    const savedTransactions = persistentStorage.load<Transaction[]>(
      STORAGE_KEYS.TRANSACTIONS,
      this.currentWallet,
      []
    );

    if (savedTransactions) {
      this.transactions = savedTransactions;
      this.notifyListeners();
    }
  }

  /**
   * Save transactions to localStorage
   */
  private saveTransactions() {
    if (!this.currentWallet) return;
    persistentStorage.save(STORAGE_KEYS.TRANSACTIONS, this.transactions, this.currentWallet);
  }

  addTransaction(transaction: Omit<Transaction, 'id' | 'timestamp' | 'status'>) {
    const newTransaction: Transaction = {
      ...transaction,
      id: this.generateId(),
      timestamp: Date.now(),
      status: 'pending',
    };

    this.transactions.unshift(newTransaction);
    this.saveTransactions();
    this.notifyListeners();

    // Simulate transaction confirmation
    setTimeout(() => {
      this.updateTransactionStatus(newTransaction.id, 'success');
    }, 2000);

    return newTransaction.id;
  }

  updateTransactionStatus(id: string, status: Transaction['status']) {
    const index = this.transactions.findIndex((tx) => tx.id === id);
    if (index !== -1) {
      this.transactions[index].status = status;
      this.saveTransactions();
      this.notifyListeners();
    }
  }

  getTransactions(limit?: number): Transaction[] {
    return limit ? this.transactions.slice(0, limit) : this.transactions;
  }

  getRecentTransactions(limit: number = 10): Transaction[] {
    return this.transactions.slice(0, limit);
  }

  getTransactionsByType(type: Transaction['type']): Transaction[] {
    return this.transactions.filter((tx) => tx.type === type);
  }

  subscribe(callback: (transactions: Transaction[]) => void) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  private notifyListeners() {
    this.listeners.forEach((callback) => callback(this.transactions));
  }

  private generateId(): string {
    return `0x${Math.random().toString(16).substring(2, 10)}${Date.now().toString(16)}`;
  }

  clearTransactions() {
    this.transactions = [];
    this.saveTransactions();
    this.notifyListeners();
  }

  /**
   * Clear wallet data and reset
   */
  clearWallet() {
    if (this.currentWallet) {
      persistentStorage.remove(STORAGE_KEYS.TRANSACTIONS, this.currentWallet);
    }
    this.currentWallet = null;
    this.transactions = [];
    this.notifyListeners();
  }
}

export const transactionStore = new TransactionStore();