/**
 * Segments & Plans Routes
 */
const express = require('express');
const router = express.Router();
const segmentsController = require('../controllers/segments.controller');
const { asyncHandler } = require('../middlewares/error.middleware');

// Segments routes
router.get('/segments', asyncHandler(segmentsController.getAllSegments));
router.get('/segments/:segmentId', asyncHandler(segmentsController.getSegmentById));

// Plans routes
router.get('/plans', asyncHandler(segmentsController.getAllPlans));
router.get('/plans/:planId', asyncHandler(segmentsController.getPlanById));

// Calculator route
router.post('/calculator', asyncHandler(segmentsController.calculateReturns));

module.exports = router;
