/**
 * Authentication Controller
 * Handles user authentication with email/password, bcrypt, and JWT
 */
const jwt = require('jsonwebtoken');
const { User } = require('../models');
const { sendSuccess, sendError } = require('../utils/response');
const logger = require('../utils/logger');
const env = require('../config/env');

/**
 * Generate JWT token for a user
 */
const generateToken = (user) => {
  return jwt.sign(
    { user_id: user.user_id, email: user.email },
    env.JWT_SECRET,
    { expiresIn: env.JWT_EXPIRY || '7d' }
  );
};

/**
 * POST /api/auth/register
 * Register a new user with email and password
 */
const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return sendError(res, 'Name, email, and password are required', 400);
    }

    if (password.length < 6) {
      return sendError(res, 'Password must be at least 6 characters', 400);
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return sendError(res, 'Email already registered', 409);
    }

    // Create user (password is hashed by pre-save hook)
    const user = await User.create({ name, email, password });

    // Generate JWT
    const token = generateToken(user);

    logger.info(`User registered: ${user.email}`);

    return sendSuccess(res, {
      user: user.toJSON(),
      token,
    }, 'Registration successful', 201);

  } catch (error) {
    logger.error('Register error:', error.message);
    return sendError(res, 'Registration failed', 500);
  }
};

/**
 * POST /api/auth/login
 * Login with email and password
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return sendError(res, 'Email and password are required', 400);
    }

    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return sendError(res, 'Invalid email or password', 401);
    }

    // Compare password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return sendError(res, 'Invalid email or password', 401);
    }

    // Generate JWT
    const token = generateToken(user);

    logger.info(`User logged in: ${user.email}`);

    return sendSuccess(res, {
      user: user.toJSON(),
      token,
    }, 'Login successful');

  } catch (error) {
    logger.error('Login error:', error.message);
    return sendError(res, 'Login failed', 500);
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
 * Logout (client-side token removal, server-side acknowledgment)
 */
const logout = async (req, res) => {
  return sendSuccess(res, null, 'Logged out successfully');
};

module.exports = {
  register,
  login,
  getCurrentUser,
  logout,
};
