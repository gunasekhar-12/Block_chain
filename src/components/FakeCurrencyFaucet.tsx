import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { MOCK_TOKENS } from '../utils/mockTokens';
import { Droplet, Gift, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { transactionStore } from '../utils/transactionStore';
import { balanceStore } from '../utils/balanceStore';
import { persistentStorage, STORAGE_KEYS } from '../utils/persistentStorage';

interface FakeCurrencyFaucetProps {
  walletAddress: string;
}

interface FaucetTimerData {
  [tokenSymbol: string]: number;
}

export function FakeCurrencyFaucet({ walletAddress }: FakeCurrencyFaucetProps) {
  const [timers, setTimers] = useState<FaucetTimerData>({});

  // Load persisted timers on mount
  useEffect(() => {
    const savedTimers = persistentStorage.load<FaucetTimerData>(
      STORAGE_KEYS.FAUCET_TIMERS,
      walletAddress,
      {}
    );
    if (savedTimers) {
      setTimers(savedTimers);
    }
  }, [walletAddress]);

  // Save timers to localStorage whenever they change
  useEffect(() => {
    persistentStorage.save(STORAGE_KEYS.FAUCET_TIMERS, timers, walletAddress);
  }, [timers, walletAddress]);

  // Update timers every second
  useEffect(() => {
    const interval = setInterval(() => {
      setTimers((prev) => {
        const updated = { ...prev };
        let hasChanges = false;

        Object.keys(updated).forEach((key) => {
          if (updated[key] > 0) {
            updated[key] = updated[key] - 1;
            hasChanges = true;
          }
        });

        return hasChanges ? updated : prev;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const canClaim = (tokenSymbol: string): boolean => {
    const timeRemaining = timers[tokenSymbol] || 0;
    return timeRemaining <= 0;
  };

  const getTimeUntilNextClaim = (tokenSymbol: string): number => {
    return timers[tokenSymbol] || 0;
  };

  const handleClaim = (tokenSymbol: string, claimAmount: number) => {
    // Update the balance in the store
    balanceStore.addBalance(tokenSymbol, claimAmount);
    
    // Add transaction to history
    transactionStore.addTransaction({
      type: 'faucet',
      amount: claimAmount,
      token: tokenSymbol,
      description: `Claimed ${claimAmount} ${tokenSymbol} from faucet`,
    });

    // Reset timer for this token (60 seconds cooldown)
    setTimers((prev) => ({ ...prev, [tokenSymbol]: 60 }));
    
    toast.success(`Claimed ${claimAmount} ${tokenSymbol}!`, {
      description: `${claimAmount} ${tokenSymbol} has been added to your wallet`,
    });
  };

  const faucetTokens = [
    { ...MOCK_TOKENS[1], claimAmount: 1000 }, // USDC (show first)
    { ...MOCK_TOKENS[0], claimAmount: 1 }, // ETH
    { ...MOCK_TOKENS[2], claimAmount: 1000 }, // DAI
    { ...MOCK_TOKENS[3], claimAmount: 0.1 }, // WBTC
    { ...MOCK_TOKENS[4], claimAmount: 100 }, // LINK
    { ...MOCK_TOKENS[5], claimAmount: 50 }, // UNI
  ];

  return (
    <Card className="bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-cyan-900/40 dark:to-blue-900/40 border-cyan-300 dark:border-cyan-700">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-xl flex items-center justify-center">
              <Droplet className="w-6 h-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-slate-900 dark:text-white flex items-center gap-2">
                Test Token Faucet
                <Sparkles className="w-5 h-5 text-yellow-500 dark:text-yellow-400" />
              </CardTitle>
              <CardDescription className="text-slate-600 dark:text-slate-400">Claim free test tokens for trading and testing</CardDescription>
            </div>
          </div>
          <Badge variant="outline" className="bg-cyan-50 dark:bg-cyan-900/50 text-cyan-700 dark:text-cyan-300 border-cyan-300 dark:border-cyan-600">
            <Gift className="w-4 h-4 mr-1" />
            Free Testnet Tokens
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {faucetTokens.map((token) => {
            const isClaiming = timers[token.symbol] > 0;
            const canClaimNow = canClaim(token.symbol);
            const timeRemaining = getTimeUntilNextClaim(token.symbol);

            return (
              <Card
                key={token.symbol}
                className="bg-white dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 hover:border-cyan-500 dark:hover:border-cyan-600 transition-all"
              >
                <CardContent className="pt-6 pb-4 px-4">
                  <div className="flex flex-col items-center gap-3">
                    <div className="text-4xl">{token.logoUrl}</div>
                    <div className="text-center">
                      <h4 className="text-slate-900 dark:text-white">{token.symbol}</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{token.name}</p>
                    </div>
                    <Badge
                      variant="outline"
                      className="bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-300 dark:border-green-700 text-xs"
                    >
                      +{token.claimAmount} {token.symbol}
                    </Badge>
                    <Button
                      onClick={() => handleClaim(token.symbol, token.claimAmount)}
                      disabled={isClaiming || !canClaimNow}
                      size="sm"
                      className={`w-full ${
                        canClaimNow
                          ? 'bg-cyan-600 hover:bg-cyan-700'
                          : 'bg-slate-600 cursor-not-allowed'
                      }`}
                    >
                      {isClaiming ? (
                        <span className="flex items-center gap-2">
                          <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Claiming...
                        </span>
                      ) : canClaimNow ? (
                        'Claim'
                      ) : (
                        `Wait ${timeRemaining}s`
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg">
          <div className="flex items-start gap-3">
            <Gift className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
            <div>
              <h4 className="text-slate-900 dark:text-white mb-1">How the Faucet Works</h4>
              <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                <li>• Click "Claim" to receive test tokens instantly to your wallet</li>
                <li>• Each token has a 1-minute cooldown between claims</li>
                <li>• These are fake test tokens for demonstration purposes only</li>
                <li>• Use them to test swaps, add liquidity, and stake on the DEX</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-center gap-2 text-sm text-slate-500 dark:text-slate-400">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <span>Connected: {walletAddress.substring(0, 6)}...{walletAddress.substring(walletAddress.length - 4)}</span>
        </div>
      </CardContent>
    </Card>
  );
}