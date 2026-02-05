/**
 * Authentication Middleware
 * Validates session tokens and attaches user to request
 */
const { User, UserSession } = require('../models');
const { sendError } = require('../utils/response');
const logger = require('../utils/logger');

/**
 * Extract session token from request
 */
const extractToken = (req) => {
  // Check cookie first
  if (req.cookies && req.cookies.session_token) {
    return req.cookies.session_token;
  }
  
  // Check Authorization header
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  
  return null;
};

/**
 * Authentication middleware - requires valid session
 */
const requireAuth = async (req, res, next) => {
  try {
    const sessionToken = extractToken(req);
    
    if (!sessionToken) {
      return sendError(res, 'Authentication required', 401);
    }
    
    // Find session
    const session = await UserSession.findOne({ session_token: sessionToken });
    
    if (!session) {
      return sendError(res, 'Invalid session', 401);
    }
    
    // Check expiry
    if (new Date(session.expires_at) < new Date()) {
      await UserSession.deleteOne({ session_token: sessionToken });
      return sendError(res, 'Session expired', 401);
    }
    
    // Find user
    const user = await User.findOne({ user_id: session.user_id });
    
    if (!user) {
      return sendError(res, 'User not found', 401);
    }
    
    // Attach user to request
    req.user = user.toJSON();
    req.sessionToken = sessionToken;
    
    next();
  } catch (error) {
    logger.error('Auth middleware error:', error);
    return sendError(res, 'Authentication failed', 500);
  }
};

/**
 * Optional authentication - attaches user if valid session exists
 */
const optionalAuth = async (req, res, next) => {
  try {
    const sessionToken = extractToken(req);
    
    if (sessionToken) {
      const session = await UserSession.findOne({ session_token: sessionToken });
      
      if (session && new Date(session.expires_at) > new Date()) {
        const user = await User.findOne({ user_id: session.user_id });
        if (user) {
          req.user = user.toJSON();
          req.sessionToken = sessionToken;
        }
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
