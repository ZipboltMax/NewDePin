import React, { createContext, useContext, useState, useCallback, useMemo, useEffect } from 'react';

const WalletContext = createContext(null);

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within WalletProvider');
  }
  return context;
};

// EVM Wallet Types
const WALLET_TYPES = {
  METAMASK: 'metamask',
  TRUST_WALLET: 'trust_wallet',
  WALLETCONNECT: 'walletconnect',
  COINBASE: 'coinbase',
};

// Supported Chains
const CHAINS = {
  1: { name: 'Ethereum', symbol: 'ETH', rpcUrl: 'https://mainnet.infura.io/v3/' },
  137: { name: 'Polygon', symbol: 'MATIC', rpcUrl: 'https://polygon-rpc.com' },
  56: { name: 'BNB Chain', symbol: 'BNB', rpcUrl: 'https://bsc-dataseed.binance.org' },
  42161: { name: 'Arbitrum', symbol: 'ETH', rpcUrl: 'https://arb1.arbitrum.io/rpc' },
};

// Wallet configurations
const WALLETS = [
  {
    type: WALLET_TYPES.METAMASK,
    name: 'MetaMask',
    icon: 'https://upload.wikimedia.org/wikipedia/commons/3/36/MetaMask_Fox.svg',
    downloadUrl: 'https://metamask.io/download/',
  },
  {
    type: WALLET_TYPES.TRUST_WALLET,
    name: 'Trust Wallet',
    icon: 'https://trustwallet.com/assets/images/media/assets/TWT.svg',
    downloadUrl: 'https://trustwallet.com/download',
  },
  {
    type: WALLET_TYPES.WALLETCONNECT,
    name: 'WalletConnect',
    icon: 'https://walletconnect.com/walletconnect-logo.png',
    downloadUrl: 'https://walletconnect.com/',
  },
  {
    type: WALLET_TYPES.COINBASE,
    name: 'Coinbase Wallet',
    icon: 'https://www.coinbase.com/img/favicon/favicon-256.png',
    downloadUrl: 'https://www.coinbase.com/wallet/downloads',
  },
];

export const WalletProvider = ({ children }) => {
  const [connected, setConnected] = useState(false);
  const [address, setAddress] = useState(null);
  const [walletType, setWalletType] = useState(null);
  const [chainId, setChainId] = useState(null);
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState(null);

  // Check for existing connection on mount
  useEffect(() => {
    checkConnection();
    
    // Listen for account changes
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);
      
      return () => {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      };
    }
  }, []);

  const handleAccountsChanged = (accounts) => {
    if (accounts.length === 0) {
      // User disconnected
      disconnect();
    } else {
      setAddress(accounts[0]);
    }
  };

  const handleChainChanged = (newChainId) => {
    setChainId(parseInt(newChainId, 16));
  };

  const checkConnection = async () => {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        if (accounts.length > 0) {
          setAddress(accounts[0]);
          setConnected(true);
          setWalletType(WALLET_TYPES.METAMASK);
          
          const chainIdHex = await window.ethereum.request({ method: 'eth_chainId' });
          setChainId(parseInt(chainIdHex, 16));
        }
      } catch (err) {
        console.error('Check connection error:', err);
      }
    }
  };

  const getProvider = useCallback((type) => {
    if (typeof window === 'undefined') return null;
    
    switch (type) {
      case WALLET_TYPES.METAMASK:
        return window.ethereum?.isMetaMask ? window.ethereum : null;
      case WALLET_TYPES.TRUST_WALLET:
        return window.ethereum?.isTrust ? window.ethereum : null;
      case WALLET_TYPES.COINBASE:
        return window.ethereum?.isCoinbaseWallet ? window.ethereum : null;
      default:
        return window.ethereum || null;
    }
  }, []);

  const connect = useCallback(async (type = WALLET_TYPES.METAMASK) => {
    setConnecting(true);
    setError(null);
    
    try {
      const provider = getProvider(type);
      
      if (!provider) {
        const wallet = WALLETS.find(w => w.type === type);
        window.open(wallet?.downloadUrl || 'https://metamask.io/download/', '_blank');
        setConnecting(false);
        return { success: false, error: 'Wallet not installed' };
      }

      // Request account access
      const accounts = await provider.request({ method: 'eth_requestAccounts' });
      
      if (accounts.length === 0) {
        throw new Error('No accounts found');
      }
      
      // Get chain ID
      const chainIdHex = await provider.request({ method: 'eth_chainId' });
      const currentChainId = parseInt(chainIdHex, 16);
      
      setAddress(accounts[0]);
      setWalletType(type);
      setChainId(currentChainId);
      setConnected(true);
      setConnecting(false);
      
      return { success: true, address: accounts[0], chainId: currentChainId };
      
    } catch (err) {
      console.error('Wallet connection error:', err);
      setError(err.message);
      setConnecting(false);
      return { success: false, error: err.message };
    }
  }, [getProvider]);

  const disconnect = useCallback(async () => {
    setConnected(false);
    setAddress(null);
    setWalletType(null);
    setChainId(null);
    setError(null);
  }, []);

  const switchChain = useCallback(async (targetChainId) => {
    if (!window.ethereum) return { success: false, error: 'No provider' };
    
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${targetChainId.toString(16)}` }],
      });
      
      setChainId(targetChainId);
      return { success: true };
      
    } catch (err) {
      // Chain not added to wallet
      if (err.code === 4902) {
        return { success: false, error: 'Chain not added to wallet' };
      }
      return { success: false, error: err.message };
    }
  }, []);

  const getChainName = useCallback((id) => {
    return CHAINS[id]?.name || `Chain ${id}`;
  }, []);

  const value = useMemo(() => ({
    connected,
    address,
    publicKey: address, // Alias for compatibility
    walletType,
    walletName: walletType,
    chainId,
    connecting,
    error,
    connect,
    disconnect,
    switchChain,
    getChainName,
    wallets: WALLETS,
    chains: CHAINS,
    WALLET_TYPES,
  }), [connected, address, walletType, chainId, connecting, error, connect, disconnect, switchChain, getChainName]);

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  );
};

export default WalletProvider;
