import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Wallet, LogOut, AlertCircle } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { Alert, AlertDescription } from './ui/alert';
import { Badge } from './ui/badge';
import { toast } from 'sonner';

interface WalletConnectProps {
  connected: boolean;
  address: string;
  network: string;
  onConnect: (address: string, network: string) => void;
  onDisconnect: () => void;
  autoConnect?: boolean;
}

declare global {
  interface Window {
    ethereum?: any;
  }
}

export function WalletConnect({ connected, address, network, onConnect, onDisconnect, autoConnect = true }: WalletConnectProps) {
  const [isMetaMaskInstalled, setIsMetaMaskInstalled] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [hasPendingRequest, setHasPendingRequest] = useState(false);

  useEffect(() => {
    // Check if MetaMask is installed
    const checkMetaMask = () => {
      if (typeof window.ethereum !== 'undefined') {
        console.log('MetaMask detected');
        setIsMetaMaskInstalled(true);

        // Check if already connected (only if autoConnect is enabled)
        if (autoConnect) {
          checkExistingConnection();
        }
      } else {
        console.log('MetaMask not detected');
        setIsMetaMaskInstalled(false);
      }
    };

    checkMetaMask();
    
    // Listen for account changes
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts: string[]) => {
        if (accounts.length === 0) {
          onDisconnect();
          toast.info('Wallet disconnected');
        } else {
          handleAccountChange(accounts[0]);
        }
      });

      window.ethereum.on('chainChanged', () => {
        window.location.reload();
      });
      // When provider fires 'connect' (e.g. after user approves), re-check
      window.ethereum.on('connect', () => {
        console.log('Provider connect event received');
        checkExistingConnection();
      });
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeAllListeners('accountsChanged');
        window.ethereum.removeAllListeners('chainChanged');
        window.ethereum.removeAllListeners('connect');
      }
    };
  }, []);

  const handleAccountChange = async (account: string) => {
    try {
      const chainId = await window.ethereum.request({ method: 'eth_chainId' });
      const networkName = await getNetworkName(parseInt(chainId, 16).toString());
      onConnect(account, networkName);
      toast.success('Account switched');
    } catch (error) {
      console.error('Error handling account change:', error);
    }
  };

  const checkExistingConnection = async () => {
    // First check selectedAddress (some providers expose this immediately)
    try {
      if (window.ethereum && window.ethereum.selectedAddress) {
        const account = window.ethereum.selectedAddress;
        const chainId = await window.ethereum.request({ method: 'eth_chainId' });
        const networkName = await getNetworkName(parseInt(chainId, 16).toString());
        onConnect(account, networkName);
        console.log('Auto-connected via selectedAddress');
        return;
      }

      // Primary check via eth_accounts
      const accounts = await window.ethereum.request({ method: 'eth_accounts' });
      if (accounts && accounts.length > 0) {
        const chainId = await window.ethereum.request({ method: 'eth_chainId' });
        const networkName = await getNetworkName(parseInt(chainId, 16).toString());
        onConnect(accounts[0], networkName);
        console.log('Auto-connected to existing session');
        return;
      }

      // Fallback: poll a few times for a connection that may be approved outside the app
      let attempts = 0;
      const maxAttempts = 10; // ~10 seconds
      const interval = setInterval(async () => {
        attempts++;
        try {
          const polled = await window.ethereum.request({ method: 'eth_accounts' });
          if (polled && polled.length > 0) {
            clearInterval(interval);
            const chainId = await window.ethereum.request({ method: 'eth_chainId' });
            const networkName = await getNetworkName(parseInt(chainId, 16).toString());
            onConnect(polled[0], networkName);
            console.log('Auto-connected via polling');
          } else if (attempts >= maxAttempts) {
            clearInterval(interval);
          }
        } catch (e) {
          console.log('Polling for existing connection failed', e);
          if (attempts >= maxAttempts) clearInterval(interval);
        }
      }, 1000);
    } catch (error) {
      console.log('No existing connection', error);
    }
  };

  const getNetworkName = async (chainId: string): Promise<string> => {
    const networks: { [key: string]: string } = {
      '1': 'Ethereum Mainnet',
      '3': 'Ropsten Testnet',
      '4': 'Rinkeby Testnet',
      '5': 'Goerli Testnet',
      '11155111': 'Sepolia Testnet',
      '137': 'Polygon Mainnet',
      '80001': 'Mumbai Testnet',
      '56': 'BSC Mainnet',
      '97': 'BSC Testnet',
      '1337': 'Localhost',
    };
    return networks[chainId] || `Chain ID: ${chainId}`;
  };

  const handleConnect = async () => {
    if (!isMetaMaskInstalled) {
      toast.error('MetaMask Not Installed', {
        description: 'Please install MetaMask browser extension to continue.',
      });
      window.open('https://metamask.io/download/', '_blank');
      return;
    }

    setIsConnecting(true);

    try {
      console.log('Requesting MetaMask accounts...');
      // Try the standard account request first
      let accounts: string[] = [];
      // Attempt to request permissions first (some providers surface a clearer prompt)
      try {
        console.log('Attempting wallet_requestPermissions first...');
        await window.ethereum.request({
          method: 'wallet_requestPermissions',
          params: [{ eth_accounts: {} }],
        });

        // After requesting permissions, read accounts
        accounts = await window.ethereum.request({ method: 'eth_accounts' });
        console.log('wallet_requestPermissions -> eth_accounts:', accounts);
      } catch (permErr: any) {
        console.warn('wallet_requestPermissions failed or not supported:', permErr);

        // If user explicitly rejected, rethrow to be handled below
        if (permErr && permErr.code === 4001) {
          throw permErr;
        }

        // If a request is already pending in MetaMask, surface that to the UI
        if (permErr && permErr.code === -32002) {
          setHasPendingRequest(true);
          throw permErr;
        }

        // Fallback: try eth_requestAccounts
        try {
          accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
          console.log('eth_requestAccounts fallback result:', accounts);
        } catch (acctErr: any) {
          console.warn('eth_requestAccounts fallback failed:', acctErr);
          if (acctErr && acctErr.code === 4001) throw acctErr;
          if (acctErr && acctErr.code === -32002) {
            setHasPendingRequest(true);
            throw acctErr;
          }
          throw acctErr;
        }
      }

      if (accounts && accounts.length > 0) {
        const account = accounts[0];
        const chainId = await window.ethereum.request({ method: 'eth_chainId' });
        const networkName = await getNetworkName(parseInt(chainId, 16).toString());

        onConnect(account, networkName);

        toast.success('Wallet Connected!', {
          description: `Connected to ${networkName}`,
        });
      }
    } catch (error: any) {
      console.error('MetaMask connection error:', error);
      
      if (error.code === 4001) {
        toast.error('Connection Rejected', {
          description: 'You rejected the connection request.',
        });
      } else if (error.code === -32002) {
        toast.warning('Connection Pending', {
          description: 'Please check MetaMask for a pending connection request.',
        });
        setHasPendingRequest(true);
      } else {
        toast.error('Connection Failed', {
          description: error.message || 'Failed to connect to MetaMask.',
        });
      }
    } finally {
      setIsConnecting(false);
    }
  };

  const requestPermissions = async () => {
    if (!window.ethereum) {
      toast.error('No wallet provider detected');
      return;
    }

    try {
      setIsConnecting(true);
      toast.info('Requesting wallet permissions...');
      await window.ethereum.request({
        method: 'wallet_requestPermissions',
        params: [{ eth_accounts: {} }],
      });

      const accounts = await window.ethereum.request({ method: 'eth_accounts' });
      if (accounts && accounts.length > 0) {
        const chainId = await window.ethereum.request({ method: 'eth_chainId' });
        const networkName = await getNetworkName(parseInt(chainId, 16).toString());
        onConnect(accounts[0], networkName);
        toast.success('Permissions granted and wallet connected', { description: accounts[0] });
      } else {
        toast.success('Permissions requested — check your MetaMask popup');
      }
    } catch (err: any) {
      console.error('Permission request failed', err);
      if (err && err.code === 4001) {
        toast.error('Permission request rejected');
      } else if (err && err.code === -32002) {
        setHasPendingRequest(true);
        toast.warning('Permission request pending — check MetaMask');
      } else {
        toast.error('Permission request failed');
      }
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = () => {
    onDisconnect();
    toast.success('Wallet Disconnected');
  };

  const copyAddress = () => {
    navigator.clipboard.writeText(address);
    toast.success('Address copied to clipboard');
  };

  const checkConnection = async () => {
    if (!window.ethereum) {
      toast.error('No wallet provider detected');
      return;
    }

    try {
      toast.info('Checking connection...');
      const accounts = await window.ethereum.request({ method: 'eth_accounts' });
      if (accounts && accounts.length > 0) {
        toast.success('Yes — connected', { description: accounts[0] });
      } else {
        toast.error('No — not connected');
      }
    } catch (err: any) {
      console.error('Check connection failed', err);
      toast.error('Error checking connection');
    }
  };

  const formatAddress = (addr: string) => {
    return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;
  };

  if (!connected) {
    return (
      <div className="flex flex-col items-end gap-2">
        {!isMetaMaskInstalled && (
          <div className="text-xs text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded p-3 max-w-xs mb-2">
            <p className="mb-1">❌ <strong>MetaMask Not Found</strong></p>
            <p>Please install MetaMask extension to use this DEX.</p>
            <Button
              onClick={() => window.open('https://metamask.io/download/', '_blank')}
              size="sm"
              className="mt-2 w-full bg-orange-600 hover:bg-orange-700"
            >
              Install MetaMask
            </Button>
          </div>
        )}
        
        {hasPendingRequest && (
          <div className="text-xs text-yellow-800 dark:text-yellow-300 bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-300 dark:border-yellow-700 rounded p-3 max-w-sm mb-2">
            <p className="mb-2">⚠️ <strong>Pending MetaMask Request Detected</strong></p>
            <p className="mb-2">You have a pending connection request. Please:</p>
            <ol className="list-decimal list-inside space-y-1 mb-3">
              <li>Click the MetaMask fox icon in your browser toolbar</li>
              <li>Look for the pending request notification</li>
              <li>Either approve or reject it</li>
              <li>Then try connecting again</li>
            </ol>
            <Button
              onClick={() => {
                setHasPendingRequest(false);
                toast.info('Try clicking the MetaMask icon in your browser');
              }}
              size="sm"
              variant="outline"
              className="w-full bg-yellow-600 hover:bg-yellow-700 text-white border-yellow-700"
            >
              Clear & Try Again
            </Button>
          </div>
        )}
        
        <Button
          onClick={handleConnect}
          disabled={isConnecting || !isMetaMaskInstalled}
          className="bg-cyan-600 hover:bg-cyan-700 disabled:bg-slate-600"
        >
          <Wallet className="w-4 h-4 mr-2" />
          {isConnecting ? 'Connecting...' : 'Connect MetaMask'}
        </Button>
        
        <Button
          onClick={checkConnection}
          size="sm"
          variant="ghost"
          className="mt-2 text-sm"
        >
          Check Connection
        </Button>

        <Button
          onClick={requestPermissions}
          size="sm"
          variant="outline"
          className="mt-2 text-sm"
          disabled={!isMetaMaskInstalled || isConnecting}
        >
          Request Permissions
        </Button>
        
        {isConnecting && !hasPendingRequest && (
          <div className="text-xs text-cyan-800 dark:text-cyan-300 bg-cyan-50 dark:bg-cyan-900/30 border border-cyan-300 dark:border-cyan-700 rounded p-3 max-w-xs">
            <p className="mb-2">💡 <strong>Waiting for MetaMask...</strong></p>
            <p>1. Look for the MetaMask popup window</p>
            <p>2. Unlock MetaMask if it's locked</p>
            <p>3. Click "Connect" to approve</p>
            <p className="mt-2 text-yellow-700 dark:text-yellow-300">💡 Can't see it? Click the MetaMask fox icon in your browser toolbar</p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <Badge variant="outline" className="bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-300 dark:border-green-700">
        {network}
      </Badge>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-700">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse" />
            {formatAddress(address)}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white">
          <DropdownMenuItem onClick={copyAddress} className="hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer">
            <Wallet className="w-4 h-4 mr-2" />
            Copy Address
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleDisconnect} className="hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer text-red-600 dark:text-red-400">
            <LogOut className="w-4 h-4 mr-2" />
            Disconnect
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      
      {/* Standalone Disconnect Button */}
      <Button
        onClick={handleDisconnect}
        variant="outline"
        className="bg-red-50 dark:bg-red-900/20 border-red-300 dark:border-red-700 text-red-700 dark:text-red-300 hover:bg-red-100 dark:hover:bg-red-900/40"
      >
        <LogOut className="w-4 h-4 mr-2" />
        Disconnect
      </Button>
    </div>
  );
}