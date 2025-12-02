import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { ScrollArea } from './ui/scroll-area';
import { transactionStore, Transaction } from '../utils/transactionStore';
import { 
  ArrowRightLeft, 
  Droplet, 
  TrendingUp, 
  Gift, 
  Loader2,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Clock,
  Trash2
} from 'lucide-react';

interface RecentTransactionsProps {
  transactions?: Transaction[];
}

export function RecentTransactions({ transactions: propTransactions }: RecentTransactionsProps = {}) {
  const [transactions, setTransactions] = useState<Transaction[]>(propTransactions || []);

  useEffect(() => {
    // Initial load
    setTransactions(transactionStore.getTransactions(20));

    // Subscribe to updates
    const unsubscribe = transactionStore.subscribe((txs) => {
      setTransactions(txs.slice(0, 20));
    });

    return unsubscribe;
  }, []);

  const getTransactionIcon = (type: Transaction['type']) => {
    switch (type) {
      case 'swap':
        return <ArrowRightLeft className="w-4 h-4" />;
      case 'add_liquidity':
      case 'remove_liquidity':
        return <Droplet className="w-4 h-4" />;
      case 'stake':
      case 'unstake':
        return <TrendingUp className="w-4 h-4" />;
      case 'claim_rewards':
      case 'faucet':
        return <Gift className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const getStatusIcon = (status: Transaction['status']) => {
    switch (status) {
      case 'pending':
        return <Loader2 className="w-4 h-4 text-yellow-400 animate-spin" />;
      case 'success':
        return <CheckCircle2 className="w-4 h-4 text-green-400" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-400" />;
    }
  };

  const getStatusBadge = (status: Transaction['status']) => {
    const variants = {
      pending: 'bg-yellow-900/30 text-yellow-300 border-yellow-700',
      success: 'bg-green-900/30 text-green-300 border-green-700',
      failed: 'bg-red-900/30 text-red-300 border-red-700',
    };

    return (
      <Badge variant="outline" className={variants[status]}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const getTypeColor = (type: Transaction['type']) => {
    switch (type) {
      case 'swap':
        return 'text-cyan-400';
      case 'add_liquidity':
        return 'text-blue-400';
      case 'remove_liquidity':
        return 'text-orange-400';
      case 'stake':
        return 'text-green-400';
      case 'unstake':
        return 'text-yellow-400';
      case 'claim_rewards':
        return 'text-purple-400';
      case 'faucet':
        return 'text-pink-400';
      default:
        return 'text-slate-400';
    }
  };

  const formatTimestamp = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (seconds < 60) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  return (
    <Card className="bg-white dark:bg-slate-800/50 border-slate-200 dark:border-slate-700">
      <CardHeader>
        <div>
          <CardTitle className="text-slate-900 dark:text-white">Recent Transactions</CardTitle>
          <CardDescription className="text-slate-600 dark:text-slate-400">Your latest activity on the DEX</CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        {transactions.length === 0 ? (
          <div className="text-center py-12">
            <Clock className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-400">No transactions yet</p>
            <p className="text-sm text-slate-500 mt-1">
              Your transaction history will appear here
            </p>
          </div>
        ) : (
          <ScrollArea className="h-[500px] pr-4">
            <div className="space-y-3">
              {transactions.map((tx) => (
                <div
                  key={tx.id}
                  className="p-4 bg-slate-700/30 rounded-lg border border-slate-600 hover:border-slate-500 transition-all"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full bg-slate-600/50 flex items-center justify-center ${getTypeColor(tx.type)}`}>
                        {getTransactionIcon(tx.type)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="text-white">
                            {tx.type.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                          </h4>
                          {getStatusBadge(tx.status)}
                        </div>
                        <p className="text-sm text-slate-400">{tx.description}</p>
                      </div>
                    </div>
                    {getStatusIcon(tx.status)}
                  </div>

                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-600">
                    <div className="flex items-center gap-4 text-sm">
                      {tx.amount && tx.token && (
                        <div className="text-slate-300">
                          <span className="text-white">{tx.amount}</span> {tx.token}
                          {tx.amount2 && tx.token2 && (
                            <>
                              <span className="text-slate-500 mx-1">+</span>
                              <span className="text-white">{tx.amount2}</span> {tx.token2}
                            </>
                          )}
                        </div>
                      )}
                      <span className="text-slate-500">{formatTimestamp(tx.timestamp)}</span>
                    </div>
                    {tx.hash && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 text-cyan-400 hover:text-cyan-300 hover:bg-slate-700"
                        onClick={() => {
                          navigator.clipboard.writeText(tx.hash!);
                        }}
                      >
                        <ExternalLink className="w-3 h-3 mr-1" />
                        {tx.hash.substring(0, 8)}...
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}