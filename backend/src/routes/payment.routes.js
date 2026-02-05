/**
 * Payment Routes
 */
const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/payment.controller');
const { requireAuth } = require('../middlewares/auth.middleware');
const { asyncHandler } = require('../middlewares/error.middleware');

// Protected routes
router.post('/checkout', requireAuth, asyncHandler(paymentController.createCheckoutSession));
router.get('/status/:sessionId', requireAuth, asyncHandler(paymentController.getPaymentStatus));
router.get('/history', requireAuth, asyncHandler(paymentController.getPaymentHistory));

// Webhook (no auth - verified by Stripe signature)
router.post('/webhook/stripe', asyncHandler(paymentController.handleWebhook));

module.exports = router;
