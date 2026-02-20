/**
 * Authentication Middleware
 * Validates JWT tokens and attaches user to request
 */
const jwt = require('jsonwebtoken');
const { User } = require('../models');
const { sendError } = require('../utils/response');
const logger = require('../utils/logger');
const env = require('../config/env');

/**
 * Extract JWT token from request
 */
const extractToken = (req) => {
  // Check Authorization header
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  return null;
};

/**
 * Authentication middleware - requires valid JWT
 */
const requireAuth = async (req, res, next) => {
  try {
    const token = extractToken(req);

    if (!token) {
      return sendError(res, 'Authentication required', 401);
    }

    // Verify JWT
    const decoded = jwt.verify(token, env.JWT_SECRET);

    // Find user
    const user = await User.findOne({ user_id: decoded.user_id });

    if (!user) {
      return sendError(res, 'User not found', 401);
    }

    // Attach user to request
    req.user = user.toJSON();

    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return sendError(res, 'Token expired', 401);
    }
    if (error.name === 'JsonWebTokenError') {
      return sendError(res, 'Invalid token', 401);
    }
    logger.error('Auth middleware error:', error);
    return sendError(res, 'Authentication failed', 500);
  }
};

/**
 * Optional authentication - attaches user if valid JWT exists
 */
const optionalAuth = async (req, res, next) => {
  try {
    const token = extractToken(req);

    if (token) {
      const decoded = jwt.verify(token, env.JWT_SECRET);
      const user = await User.findOne({ user_id: decoded.user_id });
      if (user) {
        req.user = user.toJSON();
      }
    }

    next();
  } catch (error) {
    // Continue without auth on error
    next();
  }
};

module.exports = {
  requireAuth,
  optionalAuth,
  extractToken,
};
