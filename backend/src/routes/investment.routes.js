/**
 * Investment Routes
 */
const express = require('express');
const router = express.Router();
const investmentController = require('../controllers/investment.controller');
const { requireAuth } = require('../middlewares/auth.middleware');
const { asyncHandler } = require('../middlewares/error.middleware');

// All investment routes require authentication
router.use(requireAuth);

router.get('/', asyncHandler(investmentController.getUserInvestments));
router.post('/', asyncHandler(investmentController.createInvestment));
router.get('/:investmentId', asyncHandler(investmentController.getInvestmentById));

module.exports = router;
