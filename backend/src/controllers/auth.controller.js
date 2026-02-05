/**
 * Authentication Controller
 * Handles user authentication via Emergent OAuth
 */
const axios = require('axios');
const { v4: uuidv4 } = require('uuid');
const { User, UserSession } = require('../models');
const { sendSuccess, sendError } = require('../utils/response');
const logger = require('../utils/logger');

/**
 * POST /api/auth/session
 * Exchange Emergent OAuth session_id for app session
 */
const createSession = async (req, res) => {
  try {
    const { session_id } = req.body;
    
    if (!session_id) {
      return sendError(res, 'session_id required', 400);
    }
    
    // Call Emergent Auth to get user data
    const authResponse = await axios.get(
      'https://demobackend.emergentagent.com/auth/v1/env/oauth/session-data',
      { headers: { 'X-Session-ID': session_id } }
    );
    
    const userData = authResponse.data;
    
    if (!userData || !userData.email) {
      return sendError(res, 'Invalid session_id', 401);
    }
    
    // Find or create user
    let user = await User.findOne({ email: userData.email });
    
    if (user) {
      // Update existing user
      user.name = userData.name;
      user.picture = userData.picture || user.picture;
      await user.save();
    } else {
      // Create new user
      user = await User.create({
        email: userData.email,
        name: userData.name,
        picture: userData.picture,
      });
    }
    
    // Create session
    const sessionToken = `sess_${uuidv4().replace(/-/g, '')}`;
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
    
    await UserSession.create({
      user_id: user.user_id,
      session_token: sessionToken,
      expires_at: expiresAt,
    });
    
    // Set cookie
    res.cookie('session_token', sessionToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      path: '/',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
    
    logger.info(`User logged in: ${user.email}`);
    
    return sendSuccess(res, {
      user: user.toJSON(),
      session_token: sessionToken,
    }, 'Login successful');
    
  } catch (error) {
    logger.error('Create session error:', error.message);
    
    if (error.response?.status === 401 || error.response?.status === 400) {
      return sendError(res, 'Invalid session_id', 401);
    }
    
    return sendError(res, 'Authentication failed', 500);
  }
};

/**
 * GET /api/auth/me
 * Get current authenticated user
 */
const getCurrentUser = async (req, res) => {
  return sendSuccess(res, req.user, 'User retrieved');
};

/**
 * POST /api/auth/logout
 * Logout and clear session
 */
const logout = async (req, res) => {
  try {
    const sessionToken = req.cookies?.session_token || req.sessionToken;
    
    if (sessionToken) {
      await UserSession.deleteOne({ session_token: sessionToken });
    }
    
    res.clearCookie('session_token', { path: '/' });
    
    return sendSuccess(res, null, 'Logged out successfully');
  } catch (error) {
    logger.error('Logout error:', error);
    return sendError(res, 'Logout failed', 500);
  }
};

module.exports = {
  createSession,
  getCurrentUser,
  logout,
};
