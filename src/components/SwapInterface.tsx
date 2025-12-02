import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { ArrowDown, Settings, AlertCircle, TrendingDown, Info } from 'lucide-react';
import { MOCK_TOKENS, MOCK_LIQUIDITY_PAIRS } from '../utils/mockTokens';
import { calculateSwapOutput } from '../utils/ammCalculations';
import { Alert, AlertDescription } from './ui/alert';
import { Badge } from './ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import { toast } from 'sonner';
import { transactionStore } from '../utils/transactionStore';
import { balanceStore } from '../utils/balanceStore';

interface SwapInterfaceProps {
  walletAddress: string;
}

export function SwapInterface({ walletAddress }: SwapInterfaceProps) {
  const [fromToken, setFromToken] = useState(MOCK_TOKENS[0].symbol);
  const [toToken, setToToken] = useState(MOCK_TOKENS[1].symbol);
  const [fromAmount, setFromAmount] = useState('');
  const [toAmount, setToAmount] = useState('');
  const [swapDetails, setSwapDetails] = useState<any>(null);

  useEffect(() => {
    if (fromAmount && parseFloat(fromAmount) > 0) {
      calculateSwap();
    } else {
      setToAmount('');
      setSwapDetails(null);
    }
  }, [fromAmount, fromToken, toToken]);

  const calculateSwap = () => {
    const amount = parseFloat(fromAmount);
    if (isNaN(amount) || amount <= 0) return;

    // Find the pair
    const pair = MOCK_LIQUIDITY_PAIRS.find(
      p => 
        (p.token0.symbol === fromToken && p.token1.symbol === toToken) ||
        (p.token1.symbol === fromToken && p.token0.symbol === toToken)
    );

    if (!pair) {
      setToAmount('0');
      return;
    }

    const isToken0Input = pair.token0.symbol === fromToken;
    const inputReserve = isToken0Input ? pair.reserve0 : pair.reserve1;
    const outputReserve = isToken0Input ? pair.reserve1 : pair.reserve0;

    const result = calculateSwapOutput(amount, inputReserve, outputReserve);
    setToAmount(result.outputAmount.toFixed(6));
    setSwapDetails(result);
  };

  const handleSwap = () => {
    const fromAmt = parseFloat(fromAmount);
    const toAmt = parseFloat(toAmount);

    // Update balances
    balanceStore.subtractBalance(fromToken, fromAmt);
    balanceStore.addBalance(toToken, toAmt);

    // Record transaction
    transactionStore.addTransaction({
      type: 'swap',
      from: fromToken,
      to: toToken,
      amount: fromAmt,
      amount2: toAmt,
      token: fromToken,
      token2: toToken,
      description: `Swapped ${fromAmount} ${fromToken} for ${toAmount} ${toToken}`,
    });

    toast.success('Swap Executed Successfully!', {
      description: `Swapped ${fromAmount} ${fromToken} for ${toAmount} ${toToken}`,
    });
    setFromAmount('');
    setToAmount('');
    setSwapDetails(null);
  };

  const switchTokens = () => {
    const temp = fromToken;
    setFromToken(toToken);
    setToToken(temp);
    setFromAmount(toAmount);
  };

  const fromTokenData = MOCK_TOKENS.find(t => t.symbol === fromToken);
  const toTokenData = MOCK_TOKENS.find(t => t.symbol === toToken);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        <Card className="bg-white dark:bg-slate-800/50 border-slate-200 dark:border-slate-700">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-slate-900 dark:text-white">Swap Tokens</CardTitle>
                <CardDescription className="text-slate-600 dark:text-slate-400">Trade tokens instantly with AMM pricing</CardDescription>
              </div>
              <Button variant="outline" size="icon" className="bg-slate-100 dark:bg-slate-700 border-slate-300 dark:border-slate-600 hover:bg-slate-200 dark:hover:bg-slate-600">
                <Settings className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* From Token */}
            <div className="space-y-2">
              <Label className="text-slate-700 dark:text-slate-300">From</Label>
              <div className="flex gap-2">
                <div className="flex-1">
                  <Input
                    type="number"
                    placeholder="0.0"
                    value={fromAmount}
                    onChange={(e) => setFromAmount(e.target.value)}
                    className="bg-slate-100 dark:bg-slate-700 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white text-2xl h-16"
                  />
                </div>
                <Select value={fromToken} onValueChange={setFromToken}>
                  <SelectTrigger className="w-[140px] bg-slate-100 dark:bg-slate-700 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white h-16">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600 text-slate-900 dark:text-white">
                    {MOCK_TOKENS.map(token => (
                      <SelectItem key={token.symbol} value={token.symbol}>
                        <div className="flex items-center gap-2">
                          <span>{token.logoUrl}</span>
                          <span>{token.symbol}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {fromTokenData && (
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Balance: {fromTokenData.balance.toLocaleString()} {fromTokenData.symbol}
                </p>
              )}
            </div>

            {/* Switch Button */}
            <div className="flex justify-center">
              <Button
                variant="outline"
                size="icon"
                onClick={switchTokens}
                className="bg-slate-100 dark:bg-slate-700 border-slate-300 dark:border-slate-600 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-full"
              >
                <ArrowDown className="w-4 h-4" />
              </Button>
            </div>

            {/* To Token */}
            <div className="space-y-2">
              <Label className="text-slate-700 dark:text-slate-300">To</Label>
              <div className="flex gap-2">
                <div className="flex-1">
                  <Input
                    type="number"
                    placeholder="0.0"
                    value={toAmount}
                    readOnly
                    className="bg-slate-100 dark:bg-slate-700 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white text-2xl h-16"
                  />
                </div>
                <Select value={toToken} onValueChange={setToToken}>
                  <SelectTrigger className="w-[140px] bg-slate-100 dark:bg-slate-700 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white h-16">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600 text-slate-900 dark:text-white">
                    {MOCK_TOKENS.map(token => (
                      <SelectItem key={token.symbol} value={token.symbol}>
                        <div className="flex items-center gap-2">
                          <span>{token.logoUrl}</span>
                          <span>{token.symbol}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {toTokenData && (
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Balance: {toTokenData.balance.toLocaleString()} {toTokenData.symbol}
                </p>
              )}
            </div>

            {/* Swap Details */}
            {swapDetails && (
              <div className="bg-cyan-50 dark:bg-slate-700/50 border border-cyan-200 dark:border-slate-600 rounded-lg p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-700 dark:text-slate-400">Dynamic Fee</span>
                  <div className="flex items-center gap-2">
                    <span className="text-cyan-700 dark:text-cyan-300 font-semibold">{swapDetails.dynamicFeeRate.toFixed(3)}%</span>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <Info className="w-4 h-4 text-cyan-600 dark:text-slate-400" />
                        </TooltipTrigger>
                        <TooltipContent className="bg-slate-800 border-slate-600 text-white">
                          <p>Fee adjusts based on market volatility</p>
                          <p>to mitigate impermanent loss</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-700 dark:text-slate-400">Price Impact</span>
                  <span className={`${swapDetails.priceImpact > 5 ? 'text-red-600 dark:text-red-400' : 'text-slate-900 dark:text-white'}`}>
                    {swapDetails.priceImpact.toFixed(2)}%
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-700 dark:text-slate-400">Minimum Received</span>
                  <span className="text-slate-900 dark:text-white">{swapDetails.minimumReceived.toFixed(6)} {toToken}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-700 dark:text-slate-400">Fee Amount</span>
                  <span className="text-slate-900 dark:text-white">{swapDetails.fee.toFixed(6)} {fromToken}</span>
                </div>
              </div>
            )}

            {/* Price Impact Warning */}
            {swapDetails && swapDetails.priceImpact > 5 && (
              <Alert className="bg-orange-50 dark:bg-orange-900/20 border-orange-300 dark:border-orange-700">
                <AlertCircle className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                <AlertDescription className="text-orange-800 dark:text-orange-300">
                  High price impact! Consider reducing your swap amount.
                </AlertDescription>
              </Alert>
            )}

            {/* Swap Button */}
            <Button
              onClick={handleSwap}
              disabled={!fromAmount || parseFloat(fromAmount) <= 0}
              className="w-full bg-cyan-600 hover:bg-cyan-700 h-12"
            >
              {!fromAmount || parseFloat(fromAmount) <= 0 ? 'Enter Amount' : 'Swap Tokens'}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Info Panel */}
      <div className="space-y-4">
        <Card className="bg-white dark:bg-slate-800/50 border-slate-200 dark:border-slate-700">
          <CardHeader>
            <CardTitle className="text-slate-900 dark:text-white">Dynamic Fee System</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <TrendingDown className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                <span className="text-slate-900 dark:text-white">Impermanent Loss Protection</span>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Fees automatically adjust based on market volatility to help protect liquidity providers from impermanent loss.
              </p>
            </div>
            
            <div className="space-y-2">
              <h4 className="text-slate-900 dark:text-white">Fee Structure</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-400">Base Fee:</span>
                  <span className="text-slate-900 dark:text-white">0.30%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-400">Volatility Fee:</span>
                  <span className="text-slate-900 dark:text-white">0.00% - 0.20%</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-slate-200 dark:border-slate-600">
                  <span className="text-slate-600 dark:text-slate-400">Max Total Fee:</span>
                  <Badge variant="outline" className="bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border-purple-300 dark:border-purple-700">
                    1.00%
                  </Badge>
                </div>
              </div>
            </div>

            <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-700 rounded-lg p-3">
              <p className="text-sm text-purple-800 dark:text-purple-300">
                💡 Lower volatility = Lower fees
                <br />
                Higher volatility = Higher fees
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}