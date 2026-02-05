/**
 * Authentication Routes
 */
const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { requireAuth } = require('../middlewares/auth.middleware');
const { asyncHandler } = require('../middlewares/error.middleware');

// Public routes
router.post('/session', asyncHandler(authController.createSession));

// Protected routes
router.get('/me', requireAuth, asyncHandler(authController.getCurrentUser));
router.post('/logout', requireAuth, asyncHandler(authController.logout));

module.exports = router;
