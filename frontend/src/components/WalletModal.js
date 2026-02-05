import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../components/ui/dialog';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { useWallet } from '../context/WalletContext';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';
import { ExternalLink, Loader2, Copy, Check, AlertTriangle } from 'lucide-react';

const WalletModal = ({ open, onOpenChange }) => {
  const { 
    wallets, 
    connected, 
    address, 
    walletType,
    chainId,
    connecting,
    switchingChain,
    connect, 
    disconnect,
    switchToPolygon,
    isOnPolygon,
    POLYGON_CHAIN_ID,
  } = useWallet();
  const { user, connectWallet } = useAuth();
  const [copied, setCopied] = useState(false);

  const handleConnect = async (walletTypeToConnect) => {
    const result = await connect(walletTypeToConnect);
    
    if (result.success) {
      toast.success('Wallet connected!', {
        description: `Connected to ${result.address.slice(0, 6)}...${result.address.slice(-4)} on Polygon`,
      });
      
      // Link wallet to user profile if logged in
      if (user && connectWallet) {
        await connectWallet(result.address, walletTypeToConnect, POLYGON_CHAIN_ID);
      }
      
      if (result.warning) {
        toast.warning(result.warning);
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

  const handleSwitchToPolygon = async () => {
    const result = await switchToPolygon();
    if (result.success) {
      toast.success('Switched to Polygon network');
    } else {
      toast.error('Failed to switch network', { description: result.error });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-['Outfit'] text-xl">
            {connected ? 'Wallet Connected' : 'Connect Your Wallet'}
          </DialogTitle>
          <DialogDescription>
            {connected
              ? 'Manage your connected wallet on Polygon'
              : 'Connect your EVM wallet to invest on Polygon network'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 mt-4">
          {connected ? (
            <div className="space-y-4">
              {/* Network Status */}
              {!isOnPolygon && (
                <div className="p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/30">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="h-5 w-5 text-yellow-500" />
                    <span className="font-medium text-yellow-500">Wrong Network</span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    Please switch to Polygon network to use EcoDePIN
                  </p>
                  <Button 
                    onClick={handleSwitchToPolygon}
                    disabled={switchingChain}
                    className="w-full"
                    data-testid="switch-to-polygon-btn"
                  >
                    {switchingChain ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Switching...
                      </>
                    ) : (
                      'Switch to Polygon'
                    )}
                  </Button>
                </div>
              )}

              {/* Connected Address */}
              <div className="p-4 rounded-xl bg-muted/50 border border-border">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm text-muted-foreground">Connected Address</p>
                  <Badge variant={isOnPolygon ? 'default' : 'secondary'} className="gap-1">
                    <div className="w-2 h-2 rounded-full bg-purple-500" />
                    {isOnPolygon ? 'Polygon' : `Chain ${chainId}`}
                  </Badge>
                </div>
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
            <>
              {/* Polygon Network Badge */}
              <div className="flex items-center justify-center gap-2 p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 mb-2">
                <div className="w-3 h-3 rounded-full bg-purple-500" />
                <span className="text-sm font-medium text-purple-600 dark:text-purple-400">
                  Polygon Network Only
                </span>
              </div>

              {wallets.map((wallet) => (
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
              ))}
            </>
          )}
        </div>

        {!connected && (
          <p className="text-xs text-muted-foreground text-center mt-4">
            Your wallet will automatically switch to Polygon network
          </p>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default WalletModal;
