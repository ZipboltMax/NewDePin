import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../components/ui/dialog';
import { Button } from '../components/ui/button';
import { useWallet } from '../context/WalletContext';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';
import { ExternalLink, Check, Loader2 } from 'lucide-react';

const WalletModal = ({ open, onOpenChange }) => {
  const { wallets, connected, publicKey, connecting, connect, disconnect } = useWallet();
  const { user, connectWallet } = useAuth();

  const handleConnect = async (walletAdapter) => {
    const result = await connect(walletAdapter);
    
    if (result.success) {
      toast.success('Wallet connected!', {
        description: `Connected to ${result.publicKey.slice(0, 8)}...`,
      });
      
      // Link wallet to user profile if logged in
      if (user) {
        await connectWallet(result.publicKey);
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-['Outfit'] text-xl">
            {connected ? 'Wallet Connected' : 'Connect Your Wallet'}
          </DialogTitle>
          <DialogDescription>
            {connected
              ? 'Manage your connected Solana wallet'
              : 'Choose a Solana wallet to connect to EcoDePIN'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 mt-4">
          {connected ? (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-muted/50 border border-border">
                <p className="text-sm text-muted-foreground mb-1">Connected Address</p>
                <p className="font-mono text-sm break-all">{publicKey}</p>
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
            wallets.map((wallet) => (
              <Button
                key={wallet.adapter}
                variant="outline"
                className="w-full justify-between h-14 px-4 hover:bg-muted/50 hover:border-primary/30 transition-all"
                onClick={() => handleConnect(wallet.adapter)}
                disabled={connecting}
                data-testid={`connect-${wallet.adapter}-btn`}
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
            By connecting, you agree to our Terms of Service and Privacy Policy
          </p>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default WalletModal;
