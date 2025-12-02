import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { MOCK_LIQUIDITY_PAIRS, GOVERNANCE_TOKEN } from '../utils/mockTokens';
import { Lock, Unlock, Gift, TrendingUp, Timer } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { transactionStore } from '../utils/transactionStore';
import { balanceStore } from '../utils/balanceStore';
import { positionsStore } from '../utils/positionsStore';

interface StakingDashboardProps {
  walletAddress: string;
}

interface StakingPool {
  name: string;
  lpToken: string;
  apr: number;
  lockPeriod: number;
  boost: number;
  totalStaked: number;
  userStaked: number;
  pendingRewards: number;
}

export function StakingDashboard({ walletAddress }: StakingDashboardProps) {
  const [selectedPool, setSelectedPool] = useState(0);
  const [stakeAmount, setStakeAmount] = useState('');
  const [unstakeAmount, setUnstakeAmount] = useState('');

  const stakingPools: StakingPool[] = [
    {
      name: 'ETH/USDC',
      lpToken: 'ETH-USDC-LP',
      apr: 45.5,
      lockPeriod: 0,
      boost: 1,
      totalStaked: 1250000,
      userStaked: 5500,
      pendingRewards: 125.45,
    },
    {
      name: 'DAI/USDC',
      lpToken: 'DAI-USDC-LP',
      apr: 68.2,
      lockPeriod: 30,
      boost: 1.5,
      totalStaked: 850000,
      userStaked: 2200,
      pendingRewards: 85.30,
    },
    {
      name: 'WBTC/ETH',
      lpToken: 'WBTC-ETH-LP',
      apr: 92.8,
      lockPeriod: 90,
      boost: 2.0,
      totalStaked: 2100000,
      userStaked: 8900,
      pendingRewards: 245.67,
    },
  ];

  const pool = stakingPools[selectedPool];

  const handleStake = () => {
    const amt = parseFloat(stakeAmount);

    // Subtract LP tokens from wallet balance
    balanceStore.subtractBalance(pool.lpToken, amt);

    transactionStore.addTransaction({
      type: 'stake',
      amount: amt,
      token: pool.lpToken,
      description: `Staked ${stakeAmount} ${pool.lpToken} tokens in ${pool.name} pool`,
    });

    toast.success('LP Tokens Staked Successfully!', {
      description: `Staked ${stakeAmount} ${pool.lpToken} tokens`,
    });
    setStakeAmount('');
  };

  const handleUnstake = () => {
    const amt = parseFloat(unstakeAmount);

    // Add LP tokens back to wallet balance
    balanceStore.addBalance(pool.lpToken, amt);

    transactionStore.addTransaction({
      type: 'unstake',
      amount: amt,
      token: pool.lpToken,
      description: `Unstaked ${unstakeAmount} ${pool.lpToken} tokens from ${pool.name} pool`,
    });

    toast.success('LP Tokens Unstaked Successfully!', {
      description: `Unstaked ${unstakeAmount} ${pool.lpToken} tokens`,
    });
    setUnstakeAmount('');
  };

  const handleClaimRewards = () => {
    // Add governance tokens to wallet balance
    balanceStore.addBalance(GOVERNANCE_TOKEN.symbol, pool.pendingRewards);

    transactionStore.addTransaction({
      type: 'claim_rewards',
      amount: pool.pendingRewards,
      token: GOVERNANCE_TOKEN.symbol,
      description: `Claimed ${pool.pendingRewards.toFixed(2)} ${GOVERNANCE_TOKEN.symbol} rewards from ${pool.name}`,
    });

    toast.success('Rewards Claimed!', {
      description: `Claimed ${pool.pendingRewards.toFixed(2)} ${GOVERNANCE_TOKEN.symbol} tokens`,
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        {/* Staking Pools */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {stakingPools.map((p, idx) => (
            <Card
              key={idx}
              onClick={() => setSelectedPool(idx)}
              className={`cursor-pointer transition-all ${
                selectedPool === idx
                  ? 'bg-cyan-50 dark:bg-cyan-900/30 border-cyan-400 dark:border-cyan-600'
                  : 'bg-white dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-slate-900 dark:text-white">{p.name}</h3>
                  {p.lockPeriod > 0 && (
                    <Badge variant="outline" className="bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-700">
                      <Lock className="w-3 h-3 mr-1" />
                      {p.lockPeriod}d
                    </Badge>
                  )}
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600 dark:text-slate-400">APR</span>
                    <span className="text-green-600 dark:text-green-400">{p.apr.toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600 dark:text-slate-400">Boost</span>
                    <span className="text-purple-600 dark:text-purple-400">{p.boost}x</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600 dark:text-slate-400">Your Stake</span>
                    <span className="text-slate-900 dark:text-white">${p.userStaked.toLocaleString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Stake/Unstake Interface */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Stake */}
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Lock className="w-5 h-5 text-green-400" />
                Stake LP Tokens
              </CardTitle>
              <CardDescription>Earn {GOVERNANCE_TOKEN.symbol} rewards</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-slate-300">Amount</Label>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    placeholder="0.0"
                    value={stakeAmount}
                    onChange={(e) => setStakeAmount(e.target.value)}
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                  <Button variant="outline" className="bg-slate-700 border-slate-600 hover:bg-slate-600">
                    MAX
                  </Button>
                </div>
                <p className="text-sm text-slate-400">
                  Available: 150.5 {pool.lpToken}
                </p>
              </div>

              {stakeAmount && (
                <div className="bg-slate-700/50 rounded-lg p-3 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Estimated Daily Rewards</span>
                    <span className="text-green-400">
                      {((parseFloat(stakeAmount) * pool.apr) / 365 / 100).toFixed(4)} {GOVERNANCE_TOKEN.symbol}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">APR with Boost</span>
                    <span className="text-purple-400">
                      {(pool.apr * pool.boost).toFixed(1)}%
                    </span>
                  </div>
                  {pool.lockPeriod > 0 && (
                    <div className="flex items-center gap-2 text-sm text-orange-400 pt-2 border-t border-slate-600">
                      <Timer className="w-4 h-4" />
                      <span>Locked for {pool.lockPeriod} days</span>
                    </div>
                  )}
                </div>
              )}

              <Button
                onClick={handleStake}
                disabled={!stakeAmount}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                Stake Tokens
              </Button>
            </CardContent>
          </Card>

          {/* Unstake */}
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Unlock className="w-5 h-5 text-orange-400" />
                Unstake LP Tokens
              </CardTitle>
              <CardDescription>Withdraw your staked tokens</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-slate-300">Amount</Label>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    placeholder="0.0"
                    value={unstakeAmount}
                    onChange={(e) => setUnstakeAmount(e.target.value)}
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                  <Button variant="outline" className="bg-slate-700 border-slate-600 hover:bg-slate-600">
                    MAX
                  </Button>
                </div>
                <p className="text-sm text-slate-400">
                  Staked: {(pool.userStaked / 100).toFixed(2)} {pool.lpToken}
                </p>
              </div>

              {pool.lockPeriod > 0 && (
                <div className="bg-orange-900/20 border border-orange-700 rounded-lg p-3">
                  <div className="flex items-center gap-2 text-sm text-orange-300">
                    <Timer className="w-4 h-4" />
                    <span>Unlock in 15 days</span>
                  </div>
                </div>
              )}

              <Button
                onClick={handleUnstake}
                disabled={!unstakeAmount || pool.lockPeriod > 0}
                className="w-full bg-orange-600 hover:bg-orange-700"
              >
                {pool.lockPeriod > 0 ? 'Locked' : 'Unstake Tokens'}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Rewards Card */}
        <Card className="bg-gradient-to-br from-purple-900/50 to-pink-900/50 border-purple-600">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Gift className="w-6 h-6 text-yellow-400" />
              Pending Rewards
            </CardTitle>
            <CardDescription>Claim your earned {GOVERNANCE_TOKEN.symbol} tokens</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-3xl">{GOVERNANCE_TOKEN.logoUrl}</span>
                  <span className="text-4xl text-white">{pool.pendingRewards.toFixed(2)}</span>
                  <span className="text-2xl text-purple-300">{GOVERNANCE_TOKEN.symbol}</span>
                </div>
                <p className="text-sm text-slate-400">
                  ≈ ${(pool.pendingRewards * 5.5).toFixed(2)} USD
                </p>
              </div>
              <Button
                onClick={handleClaimRewards}
                className="bg-yellow-600 hover:bg-yellow-700"
              >
                <Gift className="w-4 h-4 mr-2" />
                Claim Rewards
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Stats Sidebar */}
      <div className="space-y-4">
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Pool Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Pool Name</span>
                <span className="text-white">{pool.name}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Base APR</span>
                <span className="text-green-400">{pool.apr.toFixed(1)}%</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Boosted APR</span>
                <span className="text-purple-400">{(pool.apr * pool.boost).toFixed(1)}%</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Lock Period</span>
                <span className="text-white">{pool.lockPeriod > 0 ? `${pool.lockPeriod} days` : 'None'}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Reward Boost</span>
                <span className="text-purple-400">{pool.boost}x</span>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-700">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-slate-400">Total Staked</span>
                <span className="text-white">${pool.totalStaked.toLocaleString()}</span>
              </div>
              <Progress value={65} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Your Stats</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Total Staked</span>
              <span className="text-white">${(pool.userStaked).toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Daily Earnings</span>
              <span className="text-green-400">
                {((pool.userStaked * pool.apr * pool.boost) / 365 / 100).toFixed(2)} {GOVERNANCE_TOKEN.symbol}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Monthly Earnings</span>
              <span className="text-green-400">
                {((pool.userStaked * pool.apr * pool.boost) / 12 / 100).toFixed(2)} {GOVERNANCE_TOKEN.symbol}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Yearly Earnings</span>
              <span className="text-green-400">
                {((pool.userStaked * pool.apr * pool.boost) / 100).toFixed(2)} {GOVERNANCE_TOKEN.symbol}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-blue-900/20 border-blue-700">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <TrendingUp className="w-5 h-5 text-blue-400 mt-0.5" />
              <div>
                <h4 className="text-white mb-1">Liquidity Mining</h4>
                <p className="text-sm text-blue-300">
                  Earn extra {GOVERNANCE_TOKEN.symbol} tokens by providing liquidity and staking LP tokens. Longer lock periods receive higher reward boosts!
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}