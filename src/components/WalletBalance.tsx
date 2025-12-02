import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { MOCK_TOKENS } from '../utils/mockTokens';
import { balanceStore } from '../utils/balanceStore';
import { Wallet, TrendingUp, TrendingDown } from 'lucide-react';

interface WalletBalanceProps {
  walletAddress: string;
}

export function WalletBalance({ walletAddress }: WalletBalanceProps) {
  const [balances, setBalances] = useState(balanceStore.getAllBalances());

  useEffect(() => {
    // Subscribe to balance changes
    const unsubscribe = balanceStore.subscribe(() => {
      setBalances(balanceStore.getAllBalances());
    });

    return unsubscribe;
  }, []);

  // Calculate total portfolio value in USD (mock prices)
  const mockPrices: { [key: string]: number } = {
    ETH: 2000,
    USDC: 1,
    DAI: 1,
    WBTC: 40000,
    LINK: 15,
    UNI: 8,
  };

  const calculateTotalValue = () => {
    return Object.entries(balances).reduce((total, [token, amount]) => {
      return total + (amount * (mockPrices[token] || 0));
    }, 0);
  };

  const totalValue = calculateTotalValue();

  return (
    <Card className="bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-cyan-900/40 dark:to-blue-900/40 border-cyan-300 dark:border-cyan-700">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-xl flex items-center justify-center">
              <Wallet className="w-6 h-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-slate-900 dark:text-white">Wallet Balance</CardTitle>
              <CardDescription className="text-slate-600 dark:text-slate-400">Your token holdings</CardDescription>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-slate-500 dark:text-slate-400">Total Value</p>
            <p className="text-2xl text-slate-900 dark:text-white">${totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {MOCK_TOKENS.map((token) => {
            const balance = balances[token.symbol] || 0;
            const value = balance * mockPrices[token.symbol];
            const hasBalance = balance > 0;

            return (
              <Card
                key={token.symbol}
                className={`${
                  hasBalance
                    ? 'bg-white dark:bg-slate-800/70 border-cyan-400 dark:border-cyan-700'
                    : 'bg-slate-50 dark:bg-slate-800/30 border-slate-200 dark:border-slate-700'
                } transition-all`}
              >
                <CardContent className="pt-6 pb-4 px-4">
                  <div className="flex flex-col items-center gap-2">
                    <div className="text-3xl">{token.logoUrl}</div>
                    <div className="text-center">
                      <h4 className="text-slate-900 dark:text-white">{token.symbol}</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{token.name}</p>
                    </div>
                    <div className="text-center w-full">
                      <p className="text-lg text-cyan-600 dark:text-cyan-300">
                        {balance.toLocaleString('en-US', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 4,
                        })}
                      </p>
                      <p className="text-xs text-slate-400 dark:text-slate-500">
                        ${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </p>
                    </div>
                    {hasBalance && (
                      <Badge variant="outline" className="bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-300 dark:border-green-700 text-xs">
                        <TrendingUp className="w-3 h-3 mr-1" />
                        Active
                      </Badge>
                    )}
                    {!hasBalance && (
                      <Badge variant="outline" className="bg-slate-100 dark:bg-slate-700/30 text-slate-500 dark:text-slate-400 border-slate-300 dark:border-slate-600 text-xs">
                        Empty
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="mt-4 flex items-center justify-center gap-2 text-sm text-slate-500 dark:text-slate-400">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <span>Wallet: {walletAddress.substring(0, 6)}...{walletAddress.substring(walletAddress.length - 4)}</span>
        </div>
      </CardContent>
    </Card>
  );
}
