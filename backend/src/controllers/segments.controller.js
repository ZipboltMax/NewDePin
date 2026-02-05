/**
 * Segments Controller
 * Handles investment segments and plans
 */
const { sendSuccess, sendError } = require('../utils/response');
const logger = require('../utils/logger');

// Investment Segments Data
const SEGMENTS = [
  {
    segment_id: 'data-centers',
    name: 'Data Centers',
    description: 'Invest in sustainable, energy-efficient data centers powering the digital economy. Our data center assets utilize renewable energy sources and advanced cooling technologies to minimize environmental impact while maximizing returns.',
    short_description: 'Power the cloud sustainably',
    image_url: 'https://images.unsplash.com/photo-1733187633171-3b1c0c6ce708?crop=entropy&cs=srgb&fm=jpg&q=85',
    icon: 'Server',
    features: ['100% Renewable Energy', 'PUE < 1.2', 'Tier 4 Certified', 'Edge Computing Ready'],
    total_tvl: 45000000,
    investors_count: 2847,
  },
  {
    segment_id: 'battery-storage',
    name: 'Battery Energy Storage',
    description: 'Support grid-scale battery storage systems that store renewable energy and stabilize power grids. These assets play a critical role in the transition to clean energy by enabling 24/7 renewable power.',
    short_description: 'Store energy, power futures',
    image_url: 'https://images.unsplash.com/photo-1715605569694-4cc47c9fb535?crop=entropy&cs=srgb&fm=jpg&q=85',
    icon: 'Battery',
    features: ['Grid Stabilization', 'Peak Shaving', 'Frequency Regulation', 'Backup Power'],
    total_tvl: 32000000,
    investors_count: 1923,
  },
  {
    segment_id: 'ev-charging',
    name: 'EV Fast Charging',
    description: 'Accelerate the electric vehicle revolution by investing in fast-charging infrastructure. Our network of charging stations supports the growing EV market while generating consistent returns.',
    short_description: 'Charge the future',
    image_url: 'https://images.unsplash.com/photo-1765272088009-100c96a4cd4e?crop=entropy&cs=srgb&fm=jpg&q=85',
    icon: 'Zap',
    features: ['350kW Ultra-Fast', 'Strategic Locations', 'Smart Grid Integration', '24/7 Availability'],
    total_tvl: 28000000,
    investors_count: 3421,
  },
  {
    segment_id: 'renewable-energy',
    name: 'Renewable Energy Plants',
    description: 'Invest directly in solar farms, wind parks, and hydroelectric facilities. These assets generate clean energy while providing stable, long-term returns backed by power purchase agreements.',
    short_description: "Harvest nature's power",
    image_url: 'https://images.unsplash.com/photo-1755585129999-7b29cf3baebe?crop=entropy&cs=srgb&fm=jpg&q=85',
    icon: 'Sun',
    features: ['20+ Year PPAs', 'Carbon Neutral', 'Government Incentives', 'Diversified Portfolio'],
    total_tvl: 67000000,
    investors_count: 4156,
  },
  {
    segment_id: 'green-credits',
    name: 'Green Credit Projects',
    description: 'Participate in carbon credit and environmental offset projects. Support reforestation, conservation, and emissions reduction initiatives while earning returns from the growing carbon market.',
    short_description: 'Offset, earn, impact',
    image_url: 'https://images.unsplash.com/photo-1683444595829-e74e68fcce22?crop=entropy&cs=srgb&fm=jpg&q=85',
    icon: 'Leaf',
    features: ['Verified Credits', 'Biodiversity Projects', 'Corporate Partnerships', 'Transparent Tracking'],
    total_tvl: 18000000,
    investors_count: 1287,
  },
];

// Investment Plans Data
const INVESTMENT_PLANS = [
  // Data Centers Plans
  { plan_id: 'dc-starter', segment_id: 'data-centers', name: 'Starter Node', min_investment: 100, max_investment: 5000, apy: 8.5, lock_period_days: 30, risk_level: 'Low', description: 'Entry-level investment in data center operations', features: ['Daily rewards', 'Flexible withdrawal', 'Basic analytics'] },
  { plan_id: 'dc-growth', segment_id: 'data-centers', name: 'Growth Cluster', min_investment: 5000, max_investment: 25000, apy: 12.0, lock_period_days: 90, risk_level: 'Medium', description: 'Medium-term investment with enhanced returns', features: ['Higher APY', 'Priority support', 'Advanced metrics'] },
  { plan_id: 'dc-enterprise', segment_id: 'data-centers', name: 'Enterprise Rack', min_investment: 25000, max_investment: 100000, apy: 15.5, lock_period_days: 180, risk_level: 'Medium', description: 'Premium investment tier with maximum benefits', features: ['Highest APY', 'Direct asset ownership', 'VIP access'] },
  
  // Battery Storage Plans
  { plan_id: 'bs-basic', segment_id: 'battery-storage', name: 'Cell Pack', min_investment: 250, max_investment: 10000, apy: 9.0, lock_period_days: 30, risk_level: 'Low', description: 'Start your journey in energy storage', features: ['Stable returns', 'Weekly payouts', 'Low risk'] },
  { plan_id: 'bs-module', segment_id: 'battery-storage', name: 'Module Array', min_investment: 10000, max_investment: 50000, apy: 13.5, lock_period_days: 120, risk_level: 'Medium', description: 'Scale your energy storage investment', features: ['Enhanced APY', 'Grid revenue share', 'Quarterly bonuses'] },
  { plan_id: 'bs-grid', segment_id: 'battery-storage', name: 'Grid Station', min_investment: 50000, max_investment: 200000, apy: 18.0, lock_period_days: 365, risk_level: 'High', description: 'Institutional-grade storage investment', features: ['Maximum returns', 'Asset tokenization', 'Governance rights'] },
  
  // EV Charging Plans
  { plan_id: 'ev-charger', segment_id: 'ev-charging', name: 'Single Charger', min_investment: 150, max_investment: 7500, apy: 10.0, lock_period_days: 30, risk_level: 'Low', description: 'Own a stake in EV charging infrastructure', features: ['Usage-based rewards', 'Real-time metrics', 'Network access'] },
  { plan_id: 'ev-station', segment_id: 'ev-charging', name: 'Charging Station', min_investment: 7500, max_investment: 35000, apy: 14.0, lock_period_days: 90, risk_level: 'Medium', description: 'Multi-charger station investment', features: ['Higher throughput', 'Premium locations', 'Fleet partnerships'] },
  { plan_id: 'ev-hub', segment_id: 'ev-charging', name: 'Charging Hub', min_investment: 35000, max_investment: 150000, apy: 17.5, lock_period_days: 180, risk_level: 'Medium', description: 'Major hub infrastructure ownership', features: ['Hub operator rewards', 'Commercial contracts', 'Expansion rights'] },
  
  // Renewable Energy Plans
  { plan_id: 're-panel', segment_id: 'renewable-energy', name: 'Solar Panel', min_investment: 200, max_investment: 10000, apy: 7.5, lock_period_days: 60, risk_level: 'Low', description: 'Entry into solar energy investment', features: ['Guaranteed PPAs', 'Weather insurance', 'Stable income'] },
  { plan_id: 're-array', segment_id: 'renewable-energy', name: 'Solar Array', min_investment: 10000, max_investment: 50000, apy: 11.0, lock_period_days: 180, risk_level: 'Low', description: 'Large-scale solar investment', features: ['Utility contracts', 'Tax benefits', 'Long-term security'] },
  { plan_id: 're-farm', segment_id: 'renewable-energy', name: 'Energy Farm', min_investment: 50000, max_investment: 500000, apy: 14.5, lock_period_days: 365, risk_level: 'Medium', description: 'Full renewable energy farm ownership', features: ['Diversified sources', 'Government subsidies', 'Legacy investment'] },
  
  // Green Credits Plans
  { plan_id: 'gc-offset', segment_id: 'green-credits', name: 'Carbon Offset', min_investment: 100, max_investment: 5000, apy: 6.0, lock_period_days: 30, risk_level: 'Low', description: 'Support carbon reduction projects', features: ['Verified credits', 'Impact certificates', 'Portfolio offset'] },
  { plan_id: 'gc-forest', segment_id: 'green-credits', name: 'Forest Reserve', min_investment: 5000, max_investment: 25000, apy: 9.5, lock_period_days: 180, risk_level: 'Medium', description: 'Invest in reforestation projects', features: ['Biodiversity bonus', 'Carbon sequestration', 'Land appreciation'] },
  { plan_id: 'gc-impact', segment_id: 'green-credits', name: 'Impact Fund', min_investment: 25000, max_investment: 100000, apy: 12.0, lock_period_days: 365, risk_level: 'Medium', description: 'Diversified environmental impact portfolio', features: ['Multi-project exposure', 'ESG compliance', 'Corporate credits'] },
];

/**
 * GET /api/segments
 * Get all investment segments
 */
const getAllSegments = async (req, res) => {
  return sendSuccess(res, SEGMENTS, 'Segments retrieved');
};

/**
 * GET /api/segments/:segmentId
 * Get single segment by ID
 */
const getSegmentById = async (req, res) => {
  const { segmentId } = req.params;
  
  const segment = SEGMENTS.find((s) => s.segment_id === segmentId);
  
  if (!segment) {
    return sendError(res, 'Segment not found', 404);
  }
  
  return sendSuccess(res, segment, 'Segment retrieved');
};

/**
 * GET /api/plans
 * Get all plans, optionally filtered by segment
 */
const getAllPlans = async (req, res) => {
  const { segment_id } = req.query;
  
  let plans = INVESTMENT_PLANS;
  
  if (segment_id) {
    plans = plans.filter((p) => p.segment_id === segment_id);
  }
  
  return sendSuccess(res, plans, 'Plans retrieved');
};

/**
 * GET /api/plans/:planId
 * Get single plan by ID
 */
const getPlanById = async (req, res) => {
  const { planId } = req.params;
  
  const plan = INVESTMENT_PLANS.find((p) => p.plan_id === planId);
  
  if (!plan) {
    return sendError(res, 'Plan not found', 404);
  }
  
  return sendSuccess(res, plan, 'Plan retrieved');
};

/**
 * POST /api/calculator
 * Calculate projected returns for investment
 */
const calculateReturns = async (req, res) => {
  const { plan_id, amount } = req.body;
  
  if (!plan_id || !amount) {
    return sendError(res, 'plan_id and amount required', 400);
  }
  
  const plan = INVESTMENT_PLANS.find((p) => p.plan_id === plan_id);
  
  if (!plan) {
    return sendError(res, 'Plan not found', 404);
  }
  
  const investmentAmount = parseFloat(amount);
  const dailyRate = plan.apy / 365 / 100;
  
  const projectedReturns = {
    daily: Math.round(investmentAmount * dailyRate * 100) / 100,
    monthly: Math.round(investmentAmount * dailyRate * 30 * 100) / 100,
    yearly: Math.round(investmentAmount * (plan.apy / 100) * 100) / 100,
    lock_period: Math.round(investmentAmount * dailyRate * plan.lock_period_days * 100) / 100,
  };
  
  return sendSuccess(res, {
    plan,
    investment_amount: investmentAmount,
    projected_returns: projectedReturns,
    total_at_end: Math.round((investmentAmount + projectedReturns.lock_period) * 100) / 100,
  }, 'Returns calculated');
};

module.exports = {
  getAllSegments,
  getSegmentById,
  getAllPlans,
  getPlanById,
  calculateReturns,
  SEGMENTS,
  INVESTMENT_PLANS,
};
