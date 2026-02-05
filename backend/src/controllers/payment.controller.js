/**
 * Payment Controller
 * Handles Stripe checkout and payment status
 */
const { PaymentTransaction, Investment } = require('../models');
const { sendSuccess, sendError } = require('../utils/response');
const { INVESTMENT_PLANS } = require('./segments.controller');
const env = require('../config/env');
const logger = require('../utils/logger');

// Stripe integration (using emergentintegrations pattern)
let stripeCheckout = null;

const initStripe = async () => {
  if (!env.STRIPE_API_KEY) {
    logger.warn('Stripe API key not configured');
    return null;
  }
  
  try {
    // Dynamic import for emergentintegrations
    const { StripeCheckout } = await import('emergentintegrations/payments/stripe/checkout');
    return new StripeCheckout(env.STRIPE_API_KEY);
  } catch (error) {
    logger.warn('emergentintegrations not available, using mock Stripe');
    return null;
  }
};

/**
 * POST /api/payments/checkout
 * Create Stripe checkout session
 */
const createCheckoutSession = async (req, res) => {
  try {
    const { plan_id, amount, origin_url } = req.body;
    const userId = req.user.user_id;
    
    // Validate plan
    const plan = INVESTMENT_PLANS.find((p) => p.plan_id === plan_id);
    
    if (!plan) {
      return sendError(res, 'Invalid plan', 400);
    }
    
    const investmentAmount = parseFloat(amount);
    
    if (investmentAmount < plan.min_investment || investmentAmount > plan.max_investment) {
      return sendError(
        res,
        `Amount must be between ${plan.min_investment} and ${plan.max_investment}`,
        400
      );
    }
    
    if (!origin_url) {
      return sendError(res, 'origin_url required', 400);
    }
    
    // Create payment transaction record
    const transaction = await PaymentTransaction.create({
      user_id: userId,
      amount: investmentAmount,
      currency: 'usd',
      payment_method: 'stripe',
      status: 'pending',
      metadata: { plan_id },
    });
    
    // For demo/test mode - return mock checkout URL
    const successUrl = `${origin_url}/payment/success?session_id=${transaction.transaction_id}`;
    const cancelUrl = `${origin_url}/payment/cancel`;
    
    // If Stripe is configured, create real session
    if (env.STRIPE_API_KEY && env.STRIPE_API_KEY !== 'sk_test_emergent') {
      // Real Stripe integration would go here
      // Using emergentintegrations library
    }
    
    // Update transaction with session ID
    transaction.session_id = transaction.transaction_id;
    await transaction.save();
    
    logger.info(`Checkout session created: ${transaction.transaction_id}`);
    
    return sendSuccess(res, {
      url: successUrl, // In production, this would be Stripe checkout URL
      session_id: transaction.transaction_id,
    }, 'Checkout session created');
    
  } catch (error) {
    logger.error('Create checkout error:', error);
    return sendError(res, 'Failed to create checkout session', 500);
  }
};

/**
 * GET /api/payments/status/:sessionId
 * Get payment status and update if completed
 */
const getPaymentStatus = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const userId = req.user.user_id;
    
    const transaction = await PaymentTransaction.findOne({
      $or: [
        { session_id: sessionId },
        { transaction_id: sessionId },
      ],
      user_id: userId,
    });
    
    if (!transaction) {
      return sendError(res, 'Payment not found', 404);
    }
    
    // For demo mode - auto-complete payment
    if (transaction.status === 'pending') {
      transaction.status = 'completed';
      await transaction.save();
      
      // Create investment
      const plan = INVESTMENT_PLANS.find((p) => p.plan_id === transaction.metadata?.plan_id);
      
      if (plan) {
        const startDate = new Date();
        const endDate = new Date(startDate.getTime() + plan.lock_period_days * 24 * 60 * 60 * 1000);
        
        await Investment.create({
          user_id: userId,
          plan_id: plan.plan_id,
          segment_id: plan.segment_id,
          amount: transaction.amount,
          apy: plan.apy,
          lock_period_days: plan.lock_period_days,
          start_date: startDate,
          end_date: endDate,
        });
        
        logger.info(`Investment auto-created for payment: ${transaction.transaction_id}`);
      }
    }
    
    return sendSuccess(res, {
      status: transaction.status === 'completed' ? 'complete' : transaction.status,
      payment_status: transaction.status === 'completed' ? 'paid' : 'unpaid',
      amount_total: transaction.amount * 100, // Stripe uses cents
      currency: transaction.currency,
      transaction_id: transaction.transaction_id,
    }, 'Payment status retrieved');
    
  } catch (error) {
    logger.error('Get payment status error:', error);
    return sendError(res, 'Failed to get payment status', 500);
  }
};

/**
 * POST /api/webhook/stripe
 * Handle Stripe webhooks
 */
const handleWebhook = async (req, res) => {
  try {
    // Webhook handling for production
    const signature = req.headers['stripe-signature'];
    
    // Process webhook event
    logger.info('Stripe webhook received');
    
    return sendSuccess(res, { received: true }, 'Webhook processed');
    
  } catch (error) {
    logger.error('Webhook error:', error);
    return sendError(res, 'Webhook failed', 500);
  }
};

/**
 * GET /api/payments/history
 * Get payment history for user
 */
const getPaymentHistory = async (req, res) => {
  try {
    const userId = req.user.user_id;
    
    const payments = await PaymentTransaction.find({ user_id: userId })
      .sort({ created_at: -1 })
      .limit(50);
    
    return sendSuccess(res, payments, 'Payment history retrieved');
    
  } catch (error) {
    logger.error('Get payment history error:', error);
    return sendError(res, 'Failed to get payment history', 500);
  }
};

module.exports = {
  createCheckoutSession,
  getPaymentStatus,
  handleWebhook,
  getPaymentHistory,
};
