import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { MOCK_LIQUIDITY_PAIRS } from '../utils/mockTokens';
import { calculateLiquidityMint, calculateImpermanentLoss } from '../utils/ammCalculations';
import { Plus, Minus, TrendingUp, Droplets } from 'lucide-react';
import { toast } from 'sonner';
import { transactionStore } from '../utils/transactionStore';
import { balanceStore } from '../utils/balanceStore';
import { positionsStore } from '../utils/positionsStore';

interface LiquidityPoolProps {
  walletAddress: string;
}

export function LiquidityPool({ walletAddress }: LiquidityPoolProps) {
  const [selectedPair, setSelectedPair] = useState(0);
  const [amount0, setAmount0] = useState('');
  const [amount1, setAmount1] = useState('');
  const [removeAmount, setRemoveAmount] = useState('');

  const pair = MOCK_LIQUIDITY_PAIRS[selectedPair];

  const handleAddLiquidity = () => {
    const amt0 = parseFloat(amount0);
    const amt1 = parseFloat(amount1);

    const lp = calculateLiquidityMint(
      amt0,
      amt1,
      pair.reserve0,
      pair.reserve1,
      pair.totalLiquidity
    );

    // Update balances - subtract tokens being added to liquidity
    balanceStore.subtractBalance(pair.token0.symbol, amt0);
    balanceStore.subtractBalance(pair.token1.symbol, amt1);

    // Record transaction
    transactionStore.addTransaction({
      type: 'add_liquidity',
      amount: amt0,
      amount2: amt1,
      token: pair.token0.symbol,
      token2: pair.token1.symbol,
      description: `Added ${amount0} ${pair.token0.symbol} + ${amount1} ${pair.token1.symbol} to pool`,
    });

    toast.success('Liquidity Added Successfully!', {
      description: `Received ${lp.toFixed(4)} LP tokens`,
    });

    setAmount0('');
    setAmount1('');
  };

  const handleRemoveLiquidity = () => {
    const percentage = parseFloat(removeAmount);
    
    // Calculate how much of each token to return (simplified calculation)
    const token0Amount = (pair.reserve0 * percentage) / 100;
    const token1Amount = (pair.reserve1 * percentage) / 100;

    // Update balances - add tokens back from liquidity removal
    balanceStore.addBalance(pair.token0.symbol, token0Amount);
    balanceStore.addBalance(pair.token1.symbol, token1Amount);

    // Record transaction
    transactionStore.addTransaction({
      type: 'remove_liquidity',
      amount: percentage,
      token: `${pair.token0.symbol}-${pair.token1.symbol}`,
      description: `Removed ${removeAmount}% liquidity from ${pair.token0.symbol}/${pair.token1.symbol} pool`,
    });

    toast.success('Liquidity Removed Successfully!', {
      description: `Removed ${removeAmount}% of your liquidity`,
    });
    setRemoveAmount('');
  };

  const calculateAmount1 = (value: string) => {
    const val = parseFloat(value);
    if (!isNaN(val) && val > 0) {
      const ratio = pair.reserve1 / pair.reserve0;
      setAmount1((val * ratio).toFixed(6));
    } else {
      setAmount1('');
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        {/* Pool Selection */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {MOCK_LIQUIDITY_PAIRS.map((p, idx) => (
            <Card
              key={idx}
              onClick={() => setSelectedPair(idx)}
              className={`cursor-pointer transition-all ${
                selectedPair === idx
                  ? 'bg-cyan-50 dark:bg-cyan-900/30 border-cyan-400 dark:border-cyan-600'
                  : 'bg-white dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{p.token0.logoUrl}</span>
                    <span className="text-2xl">{p.token1.logoUrl}</span>
                  </div>
                  <Badge variant="outline" className="bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-300 dark:border-green-700">
                    {p.apr.toFixed(1)}% APR
                  </Badge>
                </div>
                <h3 className="text-slate-900 dark:text-white mb-1">
                  {p.token0.symbol}/{p.token1.symbol}
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  TVL: ${((p.reserve0 * 2000 + p.reserve1)).toLocaleString()}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Add/Remove Liquidity */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Manage Liquidity</CardTitle>
            <CardDescription>
              {pair.token0.symbol}/{pair.token1.symbol} Pool
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="add">
              <TabsList className="grid w-full grid-cols-2 bg-slate-700">
                <TabsTrigger value="add" className="data-[state=active]:bg-purple-600">
                  <Plus className="w-4 h-4 mr-2" />
                  Add
                </TabsTrigger>
                <TabsTrigger value="remove" className="data-[state=active]:bg-purple-600">
                  <Minus className="w-4 h-4 mr-2" />
                  Remove
                </TabsTrigger>
              </TabsList>

              <TabsContent value="add" className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label className="text-slate-300">{pair.token0.symbol} Amount</Label>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      placeholder="0.0"
                      value={amount0}
                      onChange={(e) => {
                        setAmount0(e.target.value);
                        calculateAmount1(e.target.value);
                      }}
                      className="bg-slate-700 border-slate-600 text-white"
                    />
                    <Button variant="outline" className="bg-slate-700 border-slate-600 hover:bg-slate-600">
                      MAX
                    </Button>
                  </div>
                  <p className="text-sm text-slate-400">
                    Balance: {pair.token0.balance.toLocaleString()}
                  </p>
                </div>

                <div className="flex justify-center">
                  <Plus className="w-6 h-6 text-slate-500" />
                </div>

                <div className="space-y-2">
                  <Label className="text-slate-300">{pair.token1.symbol} Amount</Label>
                  <Input
                    type="number"
                    placeholder="0.0"
                    value={amount1}
                    readOnly
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                  <p className="text-sm text-slate-400">
                    Balance: {pair.token1.balance.toLocaleString()}
                  </p>
                </div>

                {amount0 && amount1 && (
                  <div className="bg-slate-700/50 rounded-lg p-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Pool Share</span>
                      <span className="text-white">0.5%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">LP Tokens</span>
                      <span className="text-white">
                        {calculateLiquidityMint(
                          parseFloat(amount0),
                          parseFloat(amount1),
                          pair.reserve0,
                          pair.reserve1,
                          pair.totalLiquidity
                        ).toFixed(4)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Current APR</span>
                      <span className="text-green-400">{pair.apr.toFixed(1)}%</span>
                    </div>
                  </div>
                )}

                <Button
                  onClick={handleAddLiquidity}
                  disabled={!amount0 || !amount1}
                  className="w-full bg-cyan-600 hover:bg-cyan-700"
                >
                  Add Liquidity
                </Button>
              </TabsContent>

              <TabsContent value="remove" className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label className="text-slate-300">Amount to Remove</Label>
                  <div className="space-y-4">
                    <Input
                      type="number"
                      placeholder="0"
                      value={removeAmount}
                      onChange={(e) => setRemoveAmount(e.target.value)}
                      className="bg-slate-700 border-slate-600 text-white"
                      max="100"
                    />
                    <div className="grid grid-cols-4 gap-2">
                      {['25', '50', '75', '100'].map((pct) => (
                        <Button
                          key={pct}
                          variant="outline"
                          onClick={() => setRemoveAmount(pct)}
                          className="bg-slate-700 border-slate-600 hover:bg-slate-600"
                        >
                          {pct}%
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>

                {removeAmount && (
                  <div className="bg-slate-700/50 rounded-lg p-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">You will receive</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white">{pair.token0.symbol}</span>
                      <span className="text-white">
                        {((pair.userLiquidity || 10) * parseFloat(removeAmount) / 100).toFixed(6)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white">{pair.token1.symbol}</span>
                      <span className="text-white">
                        {((pair.userLiquidity || 10) * parseFloat(removeAmount) / 100).toFixed(6)}
                      </span>
                    </div>
                  </div>
                )}

                <Button
                  onClick={handleRemoveLiquidity}
                  disabled={!removeAmount}
                  className="w-full bg-red-600 hover:bg-red-700"
                >
                  Remove Liquidity
                </Button>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      {/* Pool Stats */}
      <div className="space-y-4">
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Pool Statistics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Total Liquidity</span>
                <span className="text-white">{pair.totalLiquidity.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">24h Volume</span>
                <span className="text-white">${pair.volume24h.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">24h Fees</span>
                <span className="text-green-400">${pair.fees24h.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">APR</span>
                <span className="text-green-400">{pair.apr.toFixed(1)}%</span>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-700">
              <h4 className="text-white mb-3">Pool Composition</h4>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-400">{pair.token0.symbol}</span>
                    <span className="text-white">{pair.reserve0.toLocaleString()}</span>
                  </div>
                  <Progress value={50} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-400">{pair.token1.symbol}</span>
                    <span className="text-white">{pair.reserve1.toLocaleString()}</span>
                  </div>
                  <Progress value={50} className="h-2" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Droplets className="w-5 h-5 text-blue-400" />
              Your Position
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Your Liquidity</span>
              <span className="text-white">${(pair.userLiquidity * 100 || 0).toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Your Pool Share</span>
              <span className="text-white">
                {((pair.userLiquidity / pair.totalLiquidity) * 100 || 0).toFixed(2)}%
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Unclaimed Fees</span>
              <span className="text-green-400">$12.45</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}