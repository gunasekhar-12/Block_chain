import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { MOCK_LIQUIDITY_PAIRS } from '../utils/mockTokens';
import { calculateImpermanentLoss } from '../utils/ammCalculations';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, TrendingDown, Activity, DollarSign, Users, Droplets } from 'lucide-react';
import { RecentTransactions } from './RecentTransactions';
import { useState, useEffect } from 'react';
import { transactionStore, Transaction } from '../utils/transactionStore';

export function AnalyticsDashboard() {
  const [recentPoolTransactions, setRecentPoolTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    const transactions = transactionStore.getRecentTransactions();
    setRecentPoolTransactions(transactions);
  }, []);

  const volumeData = [
    { name: 'Mon', volume: 450000, fees: 1350 },
    { name: 'Tue', volume: 520000, fees: 1560 },
    { name: 'Wed', volume: 480000, fees: 1440 },
    { name: 'Thu', volume: 610000, fees: 1830 },
    { name: 'Fri', volume: 580000, fees: 1740 },
    { name: 'Sat', volume: 420000, fees: 1260 },
    { name: 'Sun', volume: 540000, fees: 1620 },
  ];

  const liquidityData = [
    { name: 'Week 1', liquidity: 2000000 },
    { name: 'Week 2', liquidity: 2250000 },
    { name: 'Week 3', liquidity: 2400000 },
    { name: 'Week 4', liquidity: 2800000 },
  ];

  const feeDistribution = [
    { name: 'ETH/USDC', value: 45, color: '#8b5cf6' },
    { name: 'DAI/USDC', value: 25, color: '#3b82f6' },
    { name: 'WBTC/ETH', value: 30, color: '#10b981' },
  ];

  const totalTVL = MOCK_LIQUIDITY_PAIRS.reduce((sum, pair) => {
    return sum + (pair.reserve0 * 2000 + pair.reserve1);
  }, 0);

  const total24hVolume = MOCK_LIQUIDITY_PAIRS.reduce((sum, pair) => sum + pair.volume24h, 0);
  const total24hFees = MOCK_LIQUIDITY_PAIRS.reduce((sum, pair) => sum + pair.fees24h, 0);

  // Calculate impermanent loss example
  const ilExample = calculateImpermanentLoss(2000, 2100);

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-white dark:bg-slate-800/50 border-slate-200 dark:border-slate-700">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Total Value Locked</p>
                <h3 className="text-2xl text-slate-900 dark:text-white mt-1">${(totalTVL / 1000000).toFixed(2)}M</h3>
                <div className="flex items-center gap-1 mt-2">
                  <TrendingUp className="w-4 h-4 text-green-600 dark:text-green-400" />
                  <span className="text-sm text-green-600 dark:text-green-400">+12.5%</span>
                </div>
              </div>
              <div className="w-12 h-12 bg-cyan-100 dark:bg-cyan-900/30 rounded-full flex items-center justify-center">
                <Droplets className="w-6 h-6 text-cyan-600 dark:text-cyan-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-slate-800/50 border-slate-200 dark:border-slate-700">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">24h Volume</p>
                <h3 className="text-2xl text-slate-900 dark:text-white mt-1">${(total24hVolume / 1000000).toFixed(2)}M</h3>
                <div className="flex items-center gap-1 mt-2">
                  <TrendingUp className="w-4 h-4 text-green-600 dark:text-green-400" />
                  <span className="text-sm text-green-600 dark:text-green-400">+8.3%</span>
                </div>
              </div>
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                <Activity className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-slate-800/50 border-slate-200 dark:border-slate-700">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">24h Fees</p>
                <h3 className="text-2xl text-slate-900 dark:text-white mt-1">${total24hFees.toLocaleString()}</h3>
                <div className="flex items-center gap-1 mt-2">
                  <TrendingUp className="w-4 h-4 text-green-600 dark:text-green-400" />
                  <span className="text-sm text-green-600 dark:text-green-400">+15.2%</span>
                </div>
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
                <p className="text-sm text-slate-600 dark:text-slate-400">Total Users</p>
                <h3 className="text-2xl text-slate-900 dark:text-white mt-1">12,450</h3>
                <div className="flex items-center gap-1 mt-2">
                  <TrendingUp className="w-4 h-4 text-green-600 dark:text-green-400" />
                  <span className="text-sm text-green-600 dark:text-green-400">+23.1%</span>
                </div>
              </div>
              <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center">
                <Users className="w-6 h-6 text-orange-600 dark:text-orange-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Volume Chart */}
        <Card className="bg-white dark:bg-slate-800/50 border-slate-200 dark:border-slate-700">
          <CardHeader>
            <CardTitle className="text-slate-900 dark:text-white">Trading Volume & Fees</CardTitle>
            <CardDescription className="text-slate-600 dark:text-slate-400">Last 7 days</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={volumeData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="name" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    border: '1px solid #475569',
                    borderRadius: '8px',
                    color: '#fff',
                  }}
                />
                <Bar dataKey="volume" fill="#8b5cf6" />
                <Bar dataKey="fees" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Liquidity Growth */}
        <Card className="bg-white dark:bg-slate-800/50 border-slate-200 dark:border-slate-700">
          <CardHeader>
            <CardTitle className="text-slate-900 dark:text-white">Total Liquidity Growth</CardTitle>
            <CardDescription className="text-slate-600 dark:text-slate-400">Last 4 weeks</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={liquidityData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="name" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    border: '1px solid #475569',
                    borderRadius: '8px',
                    color: '#fff',
                  }}
                />
                <Line type="monotone" dataKey="liquidity" stroke="#3b82f6" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Pools and Fee Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Pools */}
        <div className="lg:col-span-2">
          <Card className="bg-white dark:bg-slate-800/50 border-slate-200 dark:border-slate-700">
            <CardHeader>
              <CardTitle className="text-slate-900 dark:text-white">Top Liquidity Pools</CardTitle>
              <CardDescription className="text-slate-600 dark:text-slate-400">Ranked by Total Value Locked</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {MOCK_LIQUIDITY_PAIRS.map((pair, idx) => {
                  const tvl = pair.reserve0 * 2000 + pair.reserve1;
                  return (
                    <div key={idx} className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center -space-x-2">
                          <span className="text-2xl">{pair.token0.logoUrl}</span>
                          <span className="text-2xl">{pair.token1.logoUrl}</span>
                        </div>
                        <div>
                          <h4 className="text-white">
                            {pair.token0.symbol}/{pair.token1.symbol}
                          </h4>
                          <p className="text-sm text-slate-400">
                            TVL: ${tvl.toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant="outline" className="bg-green-900/30 text-green-300 border-green-700 mb-1">
                          {pair.apr.toFixed(1)}% APR
                        </Badge>
                        <p className="text-sm text-slate-400">
                          Vol: ${(pair.volume24h / 1000).toFixed(0)}k
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Fee Distribution */}
        <Card className="bg-white dark:bg-slate-800/50 border-slate-200 dark:border-slate-700">
          <CardHeader>
            <CardTitle className="text-slate-900 dark:text-white">Fee Distribution</CardTitle>
            <CardDescription className="text-slate-600 dark:text-slate-400">By pool (last 24h)</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={feeDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {feeDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    border: '1px solid #475569',
                    borderRadius: '8px',
                    color: '#fff',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-2 mt-4">
              {feeDistribution.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-slate-300">{item.name}</span>
                  </div>
                  <span className="text-white">{item.value}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Transactions & Impermanent Loss */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Transactions */}
        <div className="lg:col-span-2">
          <RecentTransactions transactions={recentPoolTransactions} />
        </div>

        {/* Impermanent Loss Calculator */}
        <Card className="bg-white dark:bg-slate-800/50 border-slate-200 dark:border-slate-700">
          <CardHeader>
            <CardTitle className="text-slate-900 dark:text-white flex items-center gap-2">
              <TrendingDown className="w-5 h-5 text-orange-400" />
              IL Protection
            </CardTitle>
            <CardDescription className="text-slate-600 dark:text-slate-400">
              Dynamic fee system overview
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-slate-700/30 rounded-lg">
              <h4 className="text-slate-400 mb-2">Price Impact</h4>
              <p className="text-white text-2xl">+5.0%</p>
              <p className="text-sm text-slate-400 mt-1">ETH movement</p>
            </div>
            <div className="p-4 bg-slate-700/30 rounded-lg">
              <h4 className="text-slate-400 mb-2">Impermanent Loss</h4>
              <p className="text-orange-400 text-2xl">{Math.abs(ilExample).toFixed(2)}%</p>
              <p className="text-sm text-slate-400 mt-1">Without protection</p>
            </div>
            <div className="p-4 bg-green-900/20 rounded-lg border border-green-700">
              <h4 className="text-slate-400 mb-2">Fee Offset</h4>
              <p className="text-green-400 text-2xl">+0.12%</p>
              <p className="text-sm text-slate-400 mt-1">Additional collected</p>
            </div>
            <div className="p-4 bg-blue-900/20 border border-blue-700 rounded-lg">
              <p className="text-sm text-blue-300">
                💡 Dynamic fees adjust based on volatility to protect LPs
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}