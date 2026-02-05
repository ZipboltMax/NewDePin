/**
 * Investment Controller
 * Handles user investments and portfolio
 */
const { Investment } = require('../models');
const { sendSuccess, sendError } = require('../utils/response');
const { INVESTMENT_PLANS } = require('./segments.controller');
const logger = require('../utils/logger');

/**
 * GET /api/investments
 * Get all investments for current user
 */
const getUserInvestments = async (req, res) => {
  try {
    const investments = await Investment.find({ user_id: req.user.user_id })
      .sort({ created_at: -1 });
    
    return sendSuccess(res, investments, 'Investments retrieved');
  } catch (error) {
    logger.error('Get investments error:', error);
    return sendError(res, 'Failed to get investments', 500);
  }
};

/**
 * POST /api/investments
 * Create new investment
 */
const createInvestment = async (req, res) => {
  try {
    const { plan_id, amount, payment_transaction_id } = req.body;
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
    
    // Calculate dates
    const startDate = new Date();
    const endDate = new Date(startDate.getTime() + plan.lock_period_days * 24 * 60 * 60 * 1000);
    
    // Create investment
    const investment = await Investment.create({
      user_id: userId,
      plan_id: plan.plan_id,
      segment_id: plan.segment_id,
      amount: investmentAmount,
      apy: plan.apy,
      lock_period_days: plan.lock_period_days,
      start_date: startDate,
      end_date: endDate,
    });
    
    logger.info(`Investment created: ${investment.investment_id} for user ${userId}`);
    
    return sendSuccess(res, investment.toJSON(), 'Investment created', 201);
    
  } catch (error) {
    logger.error('Create investment error:', error);
    return sendError(res, 'Failed to create investment', 500);
  }
};

/**
 * GET /api/portfolio/stats
 * Get portfolio statistics for dashboard
 */
const getPortfolioStats = async (req, res) => {
  try {
    const userId = req.user.user_id;
    
    const investments = await Investment.find({ user_id: userId });
    
    const totalInvested = investments.reduce((sum, inv) => sum + inv.amount, 0);
    const activeInvestments = investments.filter((inv) => inv.status === 'active');
    
    // Calculate rewards
    let totalRewards = 0;
    for (const inv of activeInvestments) {
      const startDate = new Date(inv.start_date);
      const now = new Date();
      const daysActive = Math.floor((now - startDate) / (1000 * 60 * 60 * 24));
      const dailyRate = inv.apy / 365 / 100;
      totalRewards += inv.amount * dailyRate * daysActive;
    }
    
    // Calculate impact metrics
    const co2Offset = totalInvested * 0.0005; // 0.5kg CO2 per dollar
    const kwhGenerated = totalInvested * 0.1; // 0.1 kWh per dollar
    
    return sendSuccess(res, {
      total_invested: Math.round(totalInvested * 100) / 100,
      total_rewards: Math.round(totalRewards * 100) / 100,
      active_investments_count: activeInvestments.length,
      portfolio_value: Math.round((totalInvested + totalRewards) * 100) / 100,
      impact_metrics: {
        co2_offset_kg: Math.round(co2Offset * 100) / 100,
        kwh_generated: Math.round(kwhGenerated * 100) / 100,
        trees_equivalent: Math.round((co2Offset / 21) * 10) / 10,
      },
    }, 'Portfolio stats retrieved');
    
  } catch (error) {
    logger.error('Get portfolio stats error:', error);
    return sendError(res, 'Failed to get portfolio stats', 500);
  }
};

/**
 * GET /api/investments/:investmentId
 * Get single investment by ID
 */
const getInvestmentById = async (req, res) => {
  try {
    const { investmentId } = req.params;
    const userId = req.user.user_id;
    
    const investment = await Investment.findOne({
      investment_id: investmentId,
      user_id: userId,
    });
    
    if (!investment) {
      return sendError(res, 'Investment not found', 404);
    }
    
    return sendSuccess(res, investment.toJSON(), 'Investment retrieved');
    
  } catch (error) {
    logger.error('Get investment error:', error);
    return sendError(res, 'Failed to get investment', 500);
  }
};

module.exports = {
  getUserInvestments,
  createInvestment,
  getPortfolioStats,
  getInvestmentById,
};
