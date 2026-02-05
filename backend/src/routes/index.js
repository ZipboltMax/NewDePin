/**
 * Routes Index
 * Central route registration
 */
const express = require('express');
const router = express.Router();

// Import route modules
const authRoutes = require('./auth.routes');
const walletRoutes = require('./wallet.routes');
const segmentsRoutes = require('./segments.routes');
const investmentRoutes = require('./investment.routes');
const paymentRoutes = require('./payment.routes');
const portfolioRoutes = require('./portfolio.routes');

// Health check
router.get('/', (req, res) => {
  res.json({
    message: 'EcoDePIN API',
    version: '1.0.0',
    status: 'healthy',
  });
});

router.get('/health', (req, res) => {
  res.json({ status: 'healthy' });
});

// Register routes
router.use('/auth', authRoutes);
router.use('/wallet', walletRoutes);
router.use('/', segmentsRoutes); // /segments, /plans, /calculator
router.use('/investments', investmentRoutes);
router.use('/payments', paymentRoutes);
router.use('/portfolio', portfolioRoutes);

// Legacy route support (for frontend compatibility)
router.post('/auth/connect-wallet', require('../middlewares/auth.middleware').requireAuth, 
  require('../controllers/wallet.controller').connectWallet
);

module.exports = router;
