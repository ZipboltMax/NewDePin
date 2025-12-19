import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';

const WalletContext = createContext(null);

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within WalletProvider');
  }
  return context;
};

// Supported wallets configuration
const WALLETS = [
  {
    name: 'Phantom',
    icon: 'https://phantom.app/img/phantom-logo.svg',
    adapter: 'phantom',
    url: 'https://phantom.app/',
  },
  {
    name: 'Solflare',
    icon: 'https://solflare.com/favicon.ico',
    adapter: 'solflare',
    url: 'https://solflare.com/',
  },
];

export const WalletProvider = ({ children }) => {
  const [connected, setConnected] = useState(false);
  const [publicKey, setPublicKey] = useState(null);
  const [walletName, setWalletName] = useState(null);
  const [connecting, setConnecting] = useState(false);

  const getProvider = useCallback((walletType) => {
    if (typeof window === 'undefined') return null;
    
    if (walletType === 'phantom') {
      return window.solana?.isPhantom ? window.solana : null;
    }
    if (walletType === 'solflare') {
      return window.solflare?.isSolflare ? window.solflare : null;
    }
    return null;
  }, []);

  const connect = useCallback(async (walletType) => {
    setConnecting(true);
    try {
      const provider = getProvider(walletType);
      
      if (!provider) {
        const wallet = WALLETS.find(w => w.adapter === walletType);
        window.open(wallet?.url || 'https://phantom.app/', '_blank');
        setConnecting(false);
        return { success: false, error: 'Wallet not installed' };
      }

      const response = await provider.connect();
      const pubKey = response.publicKey.toString();
      
      setPublicKey(pubKey);
      setWalletName(walletType);
      setConnected(true);
      setConnecting(false);
      
      return { success: true, publicKey: pubKey };
    } catch (error) {
      console.error('Wallet connection error:', error);
      setConnecting(false);
      return { success: false, error: error.message };
    }
  }, [getProvider]);

  const disconnect = useCallback(async () => {
    try {
      const provider = getProvider(walletName);
      if (provider?.disconnect) {
        await provider.disconnect();
      }
    } catch (error) {
      console.error('Disconnect error:', error);
    }
    setConnected(false);
    setPublicKey(null);
    setWalletName(null);
  }, [walletName, getProvider]);

  const value = useMemo(() => ({
    connected,
    publicKey,
    walletName,
    connecting,
    connect,
    disconnect,
    wallets: WALLETS,
  }), [connected, publicKey, walletName, connecting, connect, disconnect]);

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  );
};

export default WalletProvider;
