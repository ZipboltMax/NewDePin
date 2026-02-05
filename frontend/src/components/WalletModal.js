import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../components/ui/dialog';
import { Button } from '../components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { useWallet } from '../context/WalletContext';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';
import { ExternalLink, Loader2, Copy, Check, RefreshCw } from 'lucide-react';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const WalletModal = ({ open, onOpenChange }) => {
  const { 
    wallets, 
    chains,
    connected, 
    address, 
    walletType,
    chainId,
    connecting, 
    connect, 
    disconnect,
    switchChain,
    getChainName,
  } = useWallet();
  const { user, connectWallet } = useAuth();
  const [copied, setCopied] = useState(false);
  const [supportedWallets, setSupportedWallets] = useState([]);

  // Fetch supported wallets from backend
  useEffect(() => {
    const fetchSupportedWallets = async () => {
      try {
        const response = await fetch(`${API_URL}/api/wallet/supported`);
        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            setSupportedWallets(data.data.wallets);
          }
        }
      } catch (error) {
        console.error('Failed to fetch supported wallets:', error);
      }
    };
    
    if (open) {
      fetchSupportedWallets();
    }
  }, [open]);

  const handleConnect = async (walletTypeToConnect) => {
    const result = await connect(walletTypeToConnect);
    
    if (result.success) {
      toast.success('Wallet connected!', {
        description: `Connected to ${result.address.slice(0, 6)}...${result.address.slice(-4)}`,
      });
      
      // Link wallet to user profile if logged in
      if (user && connectWallet) {
        await connectWallet(result.address, walletTypeToConnect, result.chainId);
      }
      
      onOpenChange(false);
    } else if (result.error === 'Wallet not installed') {
      toast.info('Wallet not found', {
        description: 'Opening wallet download page...',
      });
    } else {
      toast.error('Connection failed', {
        description: result.error || 'Please try again',
      });
    }
  };

  const handleDisconnect = async () => {
    await disconnect();
    toast.success('Wallet disconnected');
    onOpenChange(false);
  };

  const handleCopyAddress = async () => {
    if (address) {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast.success('Address copied!');
    }
  };

  const handleSwitchChain = async (newChainId) => {
    const result = await switchChain(parseInt(newChainId));
    if (result.success) {
      toast.success(`Switched to ${getChainName(parseInt(newChainId))}`);
    } else {
      toast.error('Failed to switch chain', { description: result.error });
    }
  };

  // Use backend wallets if available, otherwise use local config
  const displayWallets = supportedWallets.length > 0 
    ? supportedWallets.map(sw => wallets.find(w => w.type === sw.type) || sw)
    : wallets;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-['Outfit'] text-xl">
            {connected ? 'Wallet Connected' : 'Connect Your Wallet'}
          </DialogTitle>
          <DialogDescription>
            {connected
              ? 'Manage your connected EVM wallet'
              : 'Choose an EVM wallet to connect to EcoDePIN'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 mt-4">
          {connected ? (
            <div className="space-y-4">
              {/* Connected Address */}
              <div className="p-4 rounded-xl bg-muted/50 border border-border">
                <p className="text-sm text-muted-foreground mb-1">Connected Address</p>
                <div className="flex items-center gap-2">
                  <p className="font-mono text-sm break-all flex-1">{address}</p>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 shrink-0"
                    onClick={handleCopyAddress}
                  >
                    {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              {/* Chain Selector */}
              <div className="p-4 rounded-xl bg-muted/50 border border-border">
                <p className="text-sm text-muted-foreground mb-2">Network</p>
                <Select value={chainId?.toString()} onValueChange={handleSwitchChain}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select network">
                      {chainId ? getChainName(chainId) : 'Select network'}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(chains).map(([id, chain]) => (
                      <SelectItem key={id} value={id}>
                        {chain.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Wallet Type */}
              <div className="flex items-center justify-between px-4 py-2 rounded-lg bg-muted/30">
                <span className="text-sm text-muted-foreground">Wallet</span>
                <span className="text-sm font-medium capitalize">{walletType?.replace('_', ' ')}</span>
              </div>

              <Button
                variant="outline"
                className="w-full"
                onClick={handleDisconnect}
                data-testid="disconnect-wallet-btn"
              >
                Disconnect Wallet
              </Button>
            </div>
          ) : (
            displayWallets.map((wallet) => (
              <Button
                key={wallet.type}
                variant="outline"
                className="w-full justify-between h-14 px-4 hover:bg-muted/50 hover:border-primary/30 transition-all"
                onClick={() => handleConnect(wallet.type)}
                disabled={connecting}
                data-testid={`connect-${wallet.type}-btn`}
              >
                <div className="flex items-center gap-3">
                  <img
                    src={wallet.icon}
                    alt={wallet.name}
                    className="w-8 h-8 rounded-lg"
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                  <span className="font-medium">{wallet.name}</span>
                </div>
                {connecting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <ExternalLink className="h-4 w-4 text-muted-foreground" />
                )}
              </Button>
            ))
          )}
        </div>

        {!connected && (
          <p className="text-xs text-muted-foreground text-center mt-4">
            Supports Ethereum, Polygon, BNB Chain, and Arbitrum
          </p>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default WalletModal;
