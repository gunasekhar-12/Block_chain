import { persistentStorage, STORAGE_KEYS } from './persistentStorage';

export interface LiquidityPosition {
  id: string;
  poolName: string;
  token0: string;
  token1: string;
  amount0: number;
  amount1: number;
  lpTokens: number;
  timestamp: number;
  value: number;
}

export interface StakingPosition {
  id: string;
  poolName: string;
  lpToken: string;
  amount: number;
  timestamp: number;
  lockPeriod: number;
  apr: number;
  pendingRewards: number;
}

class PositionsStore {
  private liquidityPositions: LiquidityPosition[] = [];
  private stakingPositions: StakingPosition[] = [];
  private listeners: Set<() => void> = new Set();
  private currentWallet: string | null = null;

  setWallet(walletAddress: string) {
    this.currentWallet = walletAddress;
    this.loadPositions();
  }

  private loadPositions() {
    if (!this.currentWallet) return;

    this.liquidityPositions = persistentStorage.load<LiquidityPosition[]>(
      STORAGE_KEYS.LIQUIDITY_POSITIONS,
      this.currentWallet,
      []
    ) || [];

    this.stakingPositions = persistentStorage.load<StakingPosition[]>(
      STORAGE_KEYS.STAKING_POSITIONS,
      this.currentWallet,
      []
    ) || [];

    this.notifyListeners();
  }

  private savePositions() {
    if (!this.currentWallet) return;
    
    persistentStorage.save(
      STORAGE_KEYS.LIQUIDITY_POSITIONS,
      this.liquidityPositions,
      this.currentWallet
    );

    persistentStorage.save(
      STORAGE_KEYS.STAKING_POSITIONS,
      this.stakingPositions,
      this.currentWallet
    );
  }

  // Liquidity Position Methods
  addLiquidityPosition(position: Omit<LiquidityPosition, 'id' | 'timestamp'>) {
    const newPosition: LiquidityPosition = {
      ...position,
      id: this.generateId(),
      timestamp: Date.now(),
    };

    this.liquidityPositions.push(newPosition);
    this.savePositions();
    this.notifyListeners();
    return newPosition.id;
  }

  removeLiquidityPosition(id: string) {
    this.liquidityPositions = this.liquidityPositions.filter(p => p.id !== id);
    this.savePositions();
    this.notifyListeners();
  }

  getLiquidityPositions(): LiquidityPosition[] {
    return this.liquidityPositions;
  }

  getTotalLiquidityValue(): number {
    return this.liquidityPositions.reduce((sum, pos) => sum + pos.value, 0);
  }

  // Staking Position Methods
  addStakingPosition(position: Omit<StakingPosition, 'id' | 'timestamp'>) {
    const newPosition: StakingPosition = {
      ...position,
      id: this.generateId(),
      timestamp: Date.now(),
    };

    this.stakingPositions.push(newPosition);
    this.savePositions();
    this.notifyListeners();
    return newPosition.id;
  }

  removeStakingPosition(id: string) {
    this.stakingPositions = this.stakingPositions.filter(p => p.id !== id);
    this.savePositions();
    this.notifyListeners();
  }

  updateStakingRewards(id: string, rewards: number) {
    const position = this.stakingPositions.find(p => p.id === id);
    if (position) {
      position.pendingRewards = rewards;
      this.savePositions();
      this.notifyListeners();
    }
  }

  getStakingPositions(): StakingPosition[] {
    return this.stakingPositions;
  }

  getTotalStakedValue(): number {
    return this.stakingPositions.reduce((sum, pos) => sum + pos.amount, 0);
  }

  getTotalPendingRewards(): number {
    return this.stakingPositions.reduce((sum, pos) => sum + pos.pendingRewards, 0);
  }

  // Subscription
  subscribe(callback: () => void) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  private notifyListeners() {
    this.listeners.forEach(callback => callback());
  }

  private generateId(): string {
    return `pos_${Math.random().toString(16).substring(2, 10)}${Date.now().toString(16)}`;
  }

  clearWallet() {
    if (this.currentWallet) {
      persistentStorage.remove(STORAGE_KEYS.LIQUIDITY_POSITIONS, this.currentWallet);
      persistentStorage.remove(STORAGE_KEYS.STAKING_POSITIONS, this.currentWallet);
    }
    this.currentWallet = null;
    this.liquidityPositions = [];
    this.stakingPositions = [];
    this.notifyListeners();
  }
}

export const positionsStore = new PositionsStore();
