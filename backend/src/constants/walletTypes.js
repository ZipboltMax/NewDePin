/**
 * Wallet Types Constants
 * EVM-compatible wallet configurations
 */

const WALLET_TYPES = {
  METAMASK: 'metamask',
  TRUST_WALLET: 'trust_wallet',
  WALLETCONNECT: 'walletconnect',
  COINBASE: 'coinbase',
  RAINBOW: 'rainbow',
};

const CHAIN_IDS = {
  ETHEREUM_MAINNET: 1,
  POLYGON: 137,
  BSC: 56,
  ARBITRUM: 42161,
  OPTIMISM: 10,
  AVALANCHE: 43114,
  BASE: 8453,
  // Testnets
  SEPOLIA: 11155111,
  MUMBAI: 80001,
};

const CHAIN_NAMES = {
  1: 'Ethereum Mainnet',
  137: 'Polygon',
  56: 'BNB Smart Chain',
  42161: 'Arbitrum One',
  10: 'Optimism',
  43114: 'Avalanche C-Chain',
  8453: 'Base',
  11155111: 'Sepolia Testnet',
  80001: 'Mumbai Testnet',
};

const WALLET_INFO = {
  [WALLET_TYPES.METAMASK]: {
    name: 'MetaMask',
    icon: 'https://upload.wikimedia.org/wikipedia/commons/3/36/MetaMask_Fox.svg',
    downloadUrl: 'https://metamask.io/download/',
    deepLink: 'metamask://',
  },
  [WALLET_TYPES.TRUST_WALLET]: {
    name: 'Trust Wallet',
    icon: 'https://trustwallet.com/assets/images/media/assets/TWT.svg',
    downloadUrl: 'https://trustwallet.com/download',
    deepLink: 'trust://',
  },
  [WALLET_TYPES.WALLETCONNECT]: {
    name: 'WalletConnect',
    icon: 'https://walletconnect.com/walletconnect-logo.png',
    downloadUrl: 'https://walletconnect.com/',
    deepLink: null,
  },
  [WALLET_TYPES.COINBASE]: {
    name: 'Coinbase Wallet',
    icon: 'https://www.coinbase.com/img/favicon/favicon-256.png',
    downloadUrl: 'https://www.coinbase.com/wallet/downloads',
    deepLink: 'cbwallet://',
  },
  [WALLET_TYPES.RAINBOW]: {
    name: 'Rainbow',
    icon: 'https://rainbow.me/favicon.ico',
    downloadUrl: 'https://rainbow.me/',
    deepLink: 'rainbow://',
  },
};

module.exports = {
  WALLET_TYPES,
  CHAIN_IDS,
  CHAIN_NAMES,
  WALLET_INFO,
};
