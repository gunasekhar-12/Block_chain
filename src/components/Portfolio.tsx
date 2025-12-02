import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { positionsStore, LiquidityPosition, StakingPosition } from '../utils/positionsStore';
import { balanceStore } from '../utils/balanceStore';
import { MOCK_TOKENS, GOVERNANCE_TOKEN } from '../utils/mockTokens';
import { Wallet, TrendingUp, Droplets, Lock, DollarSign } from 'lucide-react';

interface PortfolioProps {
  walletAddress: string;
}

export function Portfolio({ walletAddress }: PortfolioProps) {
  const [liquidityPositions, setLiquidityPositions] = useState<LiquidityPosition[]>([]);
  const [stakingPositions, setStakingPositions] = useState<StakingPosition[]>([]);
  const [tokenBalances, setTokenBalances] = useState<Record<string, number>>({});

  useEffect(() => {
    // Load positions
    setLiquidityPositions(positionsStore.getLiquidityPositions());
    setStakingPositions(positionsStore.getStakingPositions());

    // Load balances
    const balances: Record<string, number> = {};
    MOCK_TOKENS.forEach(token => {
      balances[token.symbol] = balanceStore.getBalance(token.symbol);
    });
    balances[GOVERNANCE_TOKEN.symbol] = balanceStore.getBalance(GOVERNANCE_TOKEN.symbol);
    setTokenBalances(balances);

    // Subscribe to updates
    const unsubscribePositions = positionsStore.subscribe(() => {
      setLiquidityPositions(positionsStore.getLiquidityPositions());
      setStakingPositions(positionsStore.getStakingPositions());
    });

    const unsubscribeBalances = balanceStore.subscribe(() => {
      const updatedBalances: Record<string, number> = {};
      MOCK_TOKENS.forEach(token => {
        updatedBalances[token.symbol] = balanceStore.getBalance(token.symbol);
      });
      updatedBalances[GOVERNANCE_TOKEN.symbol] = balanceStore.getBalance(GOVERNANCE_TOKEN.symbol);
      setTokenBalances(updatedBalances);
    });

    return () => {
      unsubscribePositions();
      unsubscribeBalances();
    };
  }, []);

  const totalLiquidityValue = positionsStore.getTotalLiquidityValue();
  const totalStakedValue = positionsStore.getTotalStakedValue();
  const totalPendingRewards = positionsStore.getTotalPendingRewards();

  // Calculate total wallet value (simplified - using mock prices)
  const walletValue = Object.entries(tokenBalances).reduce((sum, [symbol, balance]) => {
    const mockPrice = symbol === 'USDC' || symbol === 'DAI' ? 1 : symbol === 'ETH' ? 2000 : 100;
    return sum + (balance * mockPrice);
  }, 0);

  const totalPortfolioValue = walletValue + totalLiquidityValue + totalStakedValue;

  return (
    <div className="space-y-6">
      {/* Portfolio Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-cyan-500 to-blue-500 border-0">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-cyan-100">Total Portfolio Value</p>
                <h3 className="text-2xl text-white mt-1">${totalPortfolioValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}</h3>
              </div>
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                <Wallet className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-slate-800/50 border-slate-200 dark:border-slate-700">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Wallet Balance</p>
                <h3 className="text-2xl text-slate-900 dark:text-white mt-1">${walletValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  {((walletValue / totalPortfolioValue) * 100).toFixed(1)}% of total
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-slate-800/50 border-slate-200 dark:border-slate-700">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Liquidity Pools</p>
                <h3 className="text-2xl text-slate-900 dark:text-white mt-1">${totalLiquidityValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  {liquidityPositions.length} position{liquidityPositions.length !== 1 ? 's' : ''}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                <Droplets className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-slate-800/50 border-slate-200 dark:border-slate-700">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Staked Value</p>
                <h3 className="text-2xl text-slate-900 dark:text-white mt-1">${totalStakedValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}</h3>
                <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                  +${totalPendingRewards.toFixed(2)} rewards
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center">
                <Lock className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Positions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Token Balances */}
        <Card className="bg-white dark:bg-slate-800/50 border-slate-200 dark:border-slate-700">
          <CardHeader>
            <CardTitle className="text-slate-900 dark:text-white">Token Balances</CardTitle>
            <CardDescription className="text-slate-600 dark:text-slate-400">Your wallet holdings</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(tokenBalances)
                .filter(([_, balance]) => balance > 0)
                .map(([symbol, balance]) => {
                  const token = [...MOCK_TOKENS, GOVERNANCE_TOKEN].find(t => t.symbol === symbol);
                  const mockPrice = symbol === 'USDC' || symbol === 'DAI' ? 1 : symbol === 'ETH' ? 2000 : 100;
                  const value = balance * mockPrice;
                  const percentage = (value / walletValue) * 100;

                  return (
                    <div key={symbol} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{token?.logoUrl || '💰'}</span>
                          <div>
                            <p className="text-slate-900 dark:text-white">{symbol}</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                              {balance.toLocaleString(undefined, { maximumFractionDigits: 6 })}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-slate-900 dark:text-white">${value.toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">{percentage.toFixed(1)}%</p>
                        </div>
                      </div>
                      <Progress value={percentage} className="h-1" />
                    </div>
                  );
                })}
              {Object.values(tokenBalances).every(b => b === 0) && (
                <p className="text-center text-slate-500 dark:text-slate-400 py-8">
                  No tokens yet. Use the faucet to get test tokens!
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Liquidity Positions */}
        <Card className="bg-white dark:bg-slate-800/50 border-slate-200 dark:border-slate-700">
          <CardHeader>
            <CardTitle className="text-slate-900 dark:text-white">Liquidity Positions</CardTitle>
            <CardDescription className="text-slate-600 dark:text-slate-400">Active LP positions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {liquidityPositions.map((position) => (
                <div key={position.id} className="p-4 bg-slate-100 dark:bg-slate-700/30 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-slate-900 dark:text-white">{position.poolName}</h4>
                    <Badge variant="outline" className="bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-700">
                      Active
                    </Badge>
                  </div>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-600 dark:text-slate-400">{position.token0}:</span>
                      <span className="text-slate-900 dark:text-white">{position.amount0.toFixed(6)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600 dark:text-slate-400">{position.token1}:</span>
                      <span className="text-slate-900 dark:text-white">{position.amount1.toFixed(6)}</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-slate-200 dark:border-slate-600">
                      <span className="text-slate-600 dark:text-slate-400">Value:</span>
                      <span className="text-slate-900 dark:text-white">${position.value.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              ))}
              {liquidityPositions.length === 0 && (
                <p className="text-center text-slate-500 dark:text-slate-400 py-8">
                  No liquidity positions. Add liquidity to earn fees!
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Staking Positions */}
      {stakingPositions.length > 0 && (
        <Card className="bg-white dark:bg-slate-800/50 border-slate-200 dark:border-slate-700">
          <CardHeader>
            <CardTitle className="text-slate-900 dark:text-white">Staking Positions</CardTitle>
            <CardDescription className="text-slate-600 dark:text-slate-400">Active staking positions earning rewards</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {stakingPositions.map((position) => (
                <div key={position.id} className="p-4 bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-lg border border-purple-200 dark:border-purple-700">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-slate-900 dark:text-white">{position.poolName}</h4>
                    {position.lockPeriod > 0 && (
                      <Badge variant="outline" className="bg-orange-50 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 border-orange-300 dark:border-orange-700">
                        <Lock className="w-3 h-3 mr-1" />
                        {position.lockPeriod}d
                      </Badge>
                    )}
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-600 dark:text-slate-400">Staked:</span>
                      <span className="text-slate-900 dark:text-white">{position.amount.toFixed(4)} {position.lpToken}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600 dark:text-slate-400">APR:</span>
                      <span className="text-green-600 dark:text-green-400">{position.apr.toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-purple-200 dark:border-purple-600">
                      <span className="text-slate-600 dark:text-slate-400">Pending Rewards:</span>
                      <span className="text-purple-600 dark:text-purple-400">{position.pendingRewards.toFixed(2)} {GOVERNANCE_TOKEN.symbol}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
