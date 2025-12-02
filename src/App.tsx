import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './components/ui/card';
import { SwapInterface } from './components/SwapInterface';
import { LiquidityPool } from './components/LiquidityPool';
import { StakingDashboard } from './components/StakingDashboard';
import { AnalyticsDashboard } from './components/AnalyticsDashboard';
import { WalletConnect } from './components/WalletConnect';
import { FakeCurrencyFaucet } from './components/FakeCurrencyFaucet';
import { WalletBalance } from './components/WalletBalance';
import { Portfolio } from './components/Portfolio';
import { Coins, TrendingUp, Droplet, BarChart3, Moon, Sun, Briefcase, AlertCircle } from 'lucide-react';
import { balanceStore } from './utils/balanceStore';
import { transactionStore } from './utils/transactionStore';
import { positionsStore } from './utils/positionsStore';
import { Toaster } from './components/ui/sonner';
import { Button } from './components/ui/button';
import { Alert, AlertDescription, AlertTitle } from './components/ui/alert';
import { initWeb3, getCurrentNetwork } from './contracts/web3';
import { toast } from 'sonner';

export default function App() {
  const [walletConnected, setWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');
  const [network, setNetwork] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [web3Initialized, setWeb3Initialized] = useState(false);
  const [showNetworkWarning, setShowNetworkWarning] = useState(false);

  useEffect(() => {
    // Load dark mode preference from localStorage
    const savedDarkMode = localStorage.getItem('darkMode') === 'true';
    setIsDarkMode(savedDarkMode);
    if (savedDarkMode) {
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleDarkMode = () => {
    const newDarkMode = !isDarkMode;
    setIsDarkMode(newDarkMode);
    localStorage.setItem('darkMode', String(newDarkMode));
    if (newDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gradient-to-br dark:from-slate-950 dark:via-blue-950 dark:to-cyan-950">
      <Toaster position="top-right" richColors />
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-xl flex items-center justify-center">
              <Coins className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-slate-900 dark:text-white">DeFi Exchange</h1>
              <p className="text-cyan-600 dark:text-cyan-300 text-sm">AMM-Powered Decentralized Trading</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="icon"
              onClick={toggleDarkMode}
              className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700"
            >
              {isDarkMode ? (
                <Sun className="w-5 h-5 text-yellow-500" />
              ) : (
                <Moon className="w-5 h-5 text-slate-700" />
              )}
            </Button>
            <WalletConnect 
              connected={walletConnected}
              address={walletAddress}
              network={network}
              autoConnect={false}
              onConnect={async (address, network) => {
                setWalletConnected(true);
                setWalletAddress(address);
                setNetwork(network);
                
                // Initialize Web3 and check network
                try {
                  await initWeb3();
                  const currentNetwork = await getCurrentNetwork();
                  
                  // Check if on Hardhat local network
                  if (window.ethereum) {
                    const chainId = await window.ethereum.request({ method: 'eth_chainId' });
                    if (chainId !== '0x539') { // 0x539 = 1337 in hex
                      setShowNetworkWarning(true);
                      toast.warning('Wrong Network', {
                        description: 'Please switch to Hardhat Local network (Chain ID: 1337)'
                      });
                    } else {
                      setWeb3Initialized(true);
                      toast.success('Connected to Blockchain!', {
                        description: 'Web3 initialized successfully'
                      });
                    }
                  }
                } catch (error: any) {
                  console.error('Web3 initialization failed:', error);
                  toast.error('Web3 Connection Failed', {
                    description: error.message || 'Could not connect to blockchain'
                  });
                }
                
                // Initialize stores with wallet address to load persisted data
                balanceStore.setWallet(address);
                transactionStore.setWallet(address);
                positionsStore.setWallet(address);
              }}
              onDisconnect={() => {
                setWalletConnected(false);
                setWalletAddress('');
                setNetwork('');
                setWeb3Initialized(false);
                setShowNetworkWarning(false);
                // Clear wallet data from stores
                balanceStore.clearWallet();
                transactionStore.clearWallet();
                positionsStore.clearWallet();
              }}
            />
          </div>
        </div>

        {/* If not connected, show a dedicated Connect page first. When connected, show the main app. */}
        {!walletConnected ? (
          <div className="min-h-[60vh] flex items-center justify-center">
            <Card className="w-full max-w-3xl">
              <CardHeader>
                <CardTitle className="text-slate-900 dark:text-white">Connect Your Wallet</CardTitle>
                <CardDescription className="text-slate-600 dark:text-slate-400">Please connect your MetaMask wallet to proceed to the DEX.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center gap-4">
                  <p className="text-sm text-slate-700 dark:text-slate-300">Click the button below to open the MetaMask permission prompt.</p>
                  <div className="w-full flex justify-center">
                    <WalletConnect
                      connected={walletConnected}
                      address={walletAddress}
                      network={network}
                      autoConnect={false}
                      onConnect={(address, network) => {
                        setWalletConnected(true);
                        setWalletAddress(address);
                        setNetwork(network);
                        balanceStore.setWallet(address);
                        transactionStore.setWallet(address);
                        positionsStore.setWallet(address);
                      }}
                      onDisconnect={() => {
                        setWalletConnected(false);
                        setWalletAddress('');
                        setNetwork('');
                        balanceStore.clearWallet();
                        transactionStore.clearWallet();
                        positionsStore.clearWallet();
                      }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <>
            {/* Network Warning Banner */}
            {showNetworkWarning && (
              <Alert variant="destructive" className="mb-6">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Wrong Network</AlertTitle>
                <AlertDescription>
                  You're not on the Hardhat Local network. Please switch to:
                  <ul className="mt-2 list-disc list-inside">
                    <li>Network Name: <strong>Hardhat Local</strong></li>
                    <li>RPC URL: <strong>http://127.0.0.1:8545</strong></li>
                    <li>Chain ID: <strong>1337</strong></li>
                    <li>Currency: <strong>ETH</strong></li>
                  </ul>
                </AlertDescription>
              </Alert>
            )}
            
            {/* Blockchain Connection Status */}
            {web3Initialized && (
              <Alert className="mb-6 border-green-500 bg-green-50 dark:bg-green-900/20">
                <AlertCircle className="h-4 w-4 text-green-600" />
                <AlertTitle className="text-green-800 dark:text-green-300">Blockchain Connected</AlertTitle>
                <AlertDescription className="text-green-700 dark:text-green-400">
                  Connected to Hardhat Local network. Smart contracts are ready!
                </AlertDescription>
              </Alert>
            )}
            
            <FakeCurrencyFaucet walletAddress={walletAddress} />
            <WalletBalance walletAddress={walletAddress} />
            <Portfolio walletAddress={walletAddress} />

            <Tabs defaultValue="swap" className="space-y-6 mt-6">
          <TabsList className="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <TabsTrigger value="swap" className="data-[state=active]:bg-cyan-600 data-[state=active]:text-white">
              <Coins className="w-4 h-4 mr-2" />
              Swap
            </TabsTrigger>
            <TabsTrigger value="liquidity" className="data-[state=active]:bg-cyan-600 data-[state=active]:text-white">
              <Droplet className="w-4 h-4 mr-2" />
              Liquidity
            </TabsTrigger>
            <TabsTrigger value="staking" className="data-[state=active]:bg-cyan-600 data-[state=active]:text-white">
              <TrendingUp className="w-4 h-4 mr-2" />
              Staking
            </TabsTrigger>
            <TabsTrigger value="analytics" className="data-[state=active]:bg-cyan-600 data-[state=active]:text-white">
              <BarChart3 className="w-4 h-4 mr-2" />
              Analytics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="swap" className="space-y-4">
            {walletConnected ? (
              <SwapInterface walletAddress={walletAddress} />
            ) : (
              <Card className="bg-white dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 p-6">
                <CardHeader>
                  <CardTitle className="text-slate-900 dark:text-white">Connect Wallet to Swap</CardTitle>
                  <CardDescription className="text-slate-600 dark:text-slate-400">Please connect your wallet to access the swap interface.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-slate-700 dark:text-slate-300">Click the Connect button in the header to connect your MetaMask wallet and enable swapping.</div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="liquidity" className="space-y-4">
            {walletConnected ? (
              <LiquidityPool walletAddress={walletAddress} />
            ) : (
              <Card className="bg-white dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 p-6">
                <CardHeader>
                  <CardTitle className="text-slate-900 dark:text-white">Connect Wallet to Manage Liquidity</CardTitle>
                  <CardDescription className="text-slate-600 dark:text-slate-400">Please connect your wallet to add or remove liquidity.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-slate-700 dark:text-slate-300">Click the Connect button in the header to connect your MetaMask wallet and enable liquidity actions.</div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="staking" className="space-y-4">
            <StakingDashboard walletAddress={walletAddress} />
          </TabsContent>

          <TabsContent value="analytics" className="space-y-4">
            <AnalyticsDashboard />
          </TabsContent>
        </Tabs>

          </>
        )}

        {/* Footer */}
        <div className="mt-12 text-center text-slate-500 dark:text-slate-400 text-sm">
          <p>⚠️ This is a prototype DEX interface with simulated blockchain interactions</p>
          <p className="mt-1">Real implementation requires Hardhat smart contracts deployment</p>
        </div>
      </div>
    </div>
  );
}