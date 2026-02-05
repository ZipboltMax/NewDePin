/**
 * Portfolio Routes
 */
const express = require('express');
const router = express.Router();
const investmentController = require('../controllers/investment.controller');
const { requireAuth } = require('../middlewares/auth.middleware');
const { asyncHandler } = require('../middlewares/error.middleware');

router.get('/stats', requireAuth, asyncHandler(investmentController.getPortfolioStats));

module.exports = router;
