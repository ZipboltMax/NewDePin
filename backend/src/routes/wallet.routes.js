/**
 * Wallet Routes
 */
const express = require('express');
const router = express.Router();
const walletController = require('../controllers/wallet.controller');
const { requireAuth } = require('../middlewares/auth.middleware');
const { asyncHandler } = require('../middlewares/error.middleware');

// Public routes
router.get('/supported', asyncHandler(walletController.getSupportedWallets));

// Protected routes
router.post('/connect', requireAuth, asyncHandler(walletController.connectWallet));
router.post('/disconnect', requireAuth, asyncHandler(walletController.disconnectWallet));
router.post('/switch-chain', requireAuth, asyncHandler(walletController.switchChain));

module.exports = router;
