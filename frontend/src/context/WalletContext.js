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

// Polygon Network Configuration
const POLYGON_CHAIN_ID = 137;
const POLYGON_CONFIG = {
  chainId: `0x${POLYGON_CHAIN_ID.toString(16)}`, // 0x89
  chainName: 'Polygon Mainnet',
  nativeCurrency: {
    name: 'MATIC',
    symbol: 'MATIC',
    decimals: 18,
  },
  rpcUrls: ['https://polygon-rpc.com', 'https://rpc-mainnet.maticvigil.com'],
  blockExplorerUrls: ['https://polygonscan.com'],
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
  const [switchingChain, setSwitchingChain] = useState(false);

  // Switch to Polygon network - defined first since other functions depend on it
  const switchToPolygon = useCallback(async () => {
    if (!window.ethereum) return { success: false, error: 'No provider' };

    setSwitchingChain(true);

    try {
      // Try to switch to Polygon
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: POLYGON_CONFIG.chainId }],
      });

      setChainId(POLYGON_CHAIN_ID);
      setSwitchingChain(false);
      return { success: true };

    } catch (switchError) {
      // Chain not added to wallet - add it
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [POLYGON_CONFIG],
          });

          setChainId(POLYGON_CHAIN_ID);
          setSwitchingChain(false);
          return { success: true };

        } catch (addError) {
          console.error('Failed to add Polygon network:', addError);
          setSwitchingChain(false);
          return { success: false, error: 'Failed to add Polygon network' };
        }
      }

      console.error('Failed to switch to Polygon:', switchError);
      setSwitchingChain(false);
      return { success: false, error: switchError.message };
    }
  }, []);

  // Disconnect function - defined early since handlers use it
  const disconnect = useCallback(async () => {
    setConnected(false);
    setAddress(null);
    setWalletType(null);
    setChainId(null);
    setError(null);
  }, []);

  // Handler for account changes
  const handleAccountsChanged = useCallback((accounts) => {
    if (accounts.length === 0) {
      disconnect();
    } else {
      setAddress(accounts[0]);
    }
  }, [disconnect]);

  // Handler for chain changes
  const handleChainChanged = useCallback((newChainId) => {
    const parsedChainId = parseInt(newChainId, 16);
    setChainId(parsedChainId);
  }, []);

  // Check for existing connection
  const checkConnection = useCallback(async () => {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        if (accounts.length > 0) {
          setAddress(accounts[0]);
          setConnected(true);
          setWalletType(WALLET_TYPES.METAMASK);

          const chainIdHex = await window.ethereum.request({ method: 'eth_chainId' });
          const currentChainId = parseInt(chainIdHex, 16);
          setChainId(currentChainId);

          // Auto-switch to Polygon if not already on it
          if (currentChainId !== POLYGON_CHAIN_ID) {
            await switchToPolygon();
          }
        }
      } catch (err) {
        console.error('Check connection error:', err);
      }
    }
  }, [switchToPolygon]);

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
  }, [checkConnection, handleAccountsChanged, handleChainChanged]);

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

      // Get current chain ID
      const chainIdHex = await provider.request({ method: 'eth_chainId' });
      const currentChainId = parseInt(chainIdHex, 16);

      setAddress(accounts[0]);
      setWalletType(type);
      setChainId(currentChainId);
      setConnected(true);

      // Auto-switch to Polygon if not already on it
      if (currentChainId !== POLYGON_CHAIN_ID) {
        const switchResult = await switchToPolygon();
        if (!switchResult.success) {
          // Still connected but on wrong network
          setConnecting(false);
          return {
            success: true,
            address: accounts[0],
            chainId: currentChainId,
            warning: 'Please switch to Polygon network'
          };
        }
      }

      setConnecting(false);
      return { success: true, address: accounts[0], chainId: POLYGON_CHAIN_ID };

    } catch (err) {
      console.error('Wallet connection error:', err);
      setError(err.message);
      setConnecting(false);
      return { success: false, error: err.message };
    }
  }, [getProvider, switchToPolygon]);

  const isOnPolygon = useMemo(() => chainId === POLYGON_CHAIN_ID, [chainId]);

  const value = useMemo(() => ({
    connected,
    address,
    publicKey: address, // Alias for compatibility
    walletType,
    walletName: walletType,
    chainId,
    connecting,
    switchingChain,
    error,
    connect,
    disconnect,
    switchToPolygon,
    isOnPolygon,
    wallets: WALLETS,
    WALLET_TYPES,
    POLYGON_CHAIN_ID,
    networkName: 'Polygon',
  }), [connected, address, walletType, chainId, connecting, switchingChain, error, connect, disconnect, switchToPolygon, isOnPolygon]);

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  );
};

export default WalletProvider;
