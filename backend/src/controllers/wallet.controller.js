/**
 * Wallet Controller
 * Handles EVM wallet connections and management
 */
const { User } = require('../models');
const { sendSuccess, sendError } = require('../utils/response');
const { WALLET_TYPES, WALLET_INFO, CHAIN_NAMES } = require('../constants/walletTypes');
const env = require('../config/env');
const logger = require('../utils/logger');

// Polygon only configuration
const POLYGON_CHAIN_ID = 137;

/**
 * GET /api/wallet/supported
 * Get list of supported wallets based on ENV config
 */
const getSupportedWallets = async (req, res) => {
  try {
    const supportedWallets = [];
    
    if (env.wallets.METAMASK_ENABLED) {
      supportedWallets.push({
        type: WALLET_TYPES.METAMASK,
        ...WALLET_INFO[WALLET_TYPES.METAMASK],
        enabled: true,
      });
    }
    
    if (env.wallets.TRUST_WALLET_ENABLED) {
      supportedWallets.push({
        type: WALLET_TYPES.TRUST_WALLET,
        ...WALLET_INFO[WALLET_TYPES.TRUST_WALLET],
        enabled: true,
      });
    }
    
    if (env.wallets.WALLETCONNECT_ENABLED) {
      supportedWallets.push({
        type: WALLET_TYPES.WALLETCONNECT,
        ...WALLET_INFO[WALLET_TYPES.WALLETCONNECT],
        enabled: true,
        projectId: env.wallets.WALLETCONNECT_PROJECT_ID ? true : false,
      });
    }
    
    // Only Polygon supported
    const supportedChains = [
      { chainId: POLYGON_CHAIN_ID, name: 'Polygon Mainnet' }
    ];
    
    return sendSuccess(res, {
      wallets: supportedWallets,
      chains: supportedChains,
    }, 'Supported wallets retrieved');
    
  } catch (error) {
    logger.error('Get supported wallets error:', error);
    return sendError(res, 'Failed to get supported wallets', 500);
  }
};

/**
 * POST /api/wallet/connect
 * Connect wallet to user profile (Polygon only)
 */
const connectWallet = async (req, res) => {
  try {
    const { wallet_address, wallet_type } = req.body;
    const userId = req.user.user_id;
    
    if (!wallet_address) {
      return sendError(res, 'wallet_address required', 400);
    }
    
    // Validate wallet address format (EVM - 42 chars starting with 0x)
    if (!/^0x[a-fA-F0-9]{40}$/.test(wallet_address)) {
      return sendError(res, 'Invalid EVM wallet address format', 400);
    }
    
    // Validate wallet type if provided
    if (wallet_type && !Object.values(WALLET_TYPES).includes(wallet_type)) {
      return sendError(res, 'Invalid wallet type', 400);
    }
    
    // Check if wallet is already connected to another user
    const existingUser = await User.findOne({
      wallet_address: wallet_address.toLowerCase(),
      user_id: { $ne: userId },
    });
    
    if (existingUser) {
      return sendError(res, 'Wallet already connected to another account', 409);
    }
    
    // Update user with wallet info - force Polygon chain
    const updatedUser = await User.findOneAndUpdate(
      { user_id: userId },
      {
        wallet_address: wallet_address.toLowerCase(),
        wallet_type: wallet_type || WALLET_TYPES.METAMASK,
        chain_id: POLYGON_CHAIN_ID, // Always Polygon
      },
      { new: true }
    );
    
    logger.info(`Wallet connected: ${wallet_address} for user ${userId} on Polygon`);
    
    return sendSuccess(res, updatedUser.toJSON(), 'Wallet connected successfully');
    
  } catch (error) {
    logger.error('Connect wallet error:', error);
    return sendError(res, 'Failed to connect wallet', 500);
  }
};

/**
 * POST /api/wallet/disconnect
 * Disconnect wallet from user profile
 */
const disconnectWallet = async (req, res) => {
  try {
    const userId = req.user.user_id;
    
    const updatedUser = await User.findOneAndUpdate(
      { user_id: userId },
      {
        wallet_address: null,
        wallet_type: null,
        chain_id: null,
      },
      { new: true }
    );
    
    logger.info(`Wallet disconnected for user ${userId}`);
    
    return sendSuccess(res, updatedUser.toJSON(), 'Wallet disconnected successfully');
    
  } catch (error) {
    logger.error('Disconnect wallet error:', error);
    return sendError(res, 'Failed to disconnect wallet', 500);
  }
};

/**
 * POST /api/wallet/switch-chain
 * Update connected chain ID
 */
const switchChain = async (req, res) => {
  try {
    const { chain_id } = req.body;
    const userId = req.user.user_id;
    
    if (!chain_id) {
      return sendError(res, 'chain_id required', 400);
    }
    
    if (!env.wallets.SUPPORTED_CHAIN_IDS.includes(Number(chain_id))) {
      return sendError(res, 'Unsupported chain ID', 400);
    }
    
    const updatedUser = await User.findOneAndUpdate(
      { user_id: userId },
      { chain_id: Number(chain_id) },
      { new: true }
    );
    
    return sendSuccess(res, updatedUser.toJSON(), 'Chain switched successfully');
    
  } catch (error) {
    logger.error('Switch chain error:', error);
    return sendError(res, 'Failed to switch chain', 500);
  }
};

module.exports = {
  getSupportedWallets,
  connectWallet,
  disconnectWallet,
  switchChain,
};
