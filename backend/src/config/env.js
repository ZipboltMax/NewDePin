/**
 * Environment Configuration
 * Loads and validates environment variables
 */
require('dotenv').config();

const env = {
  // Server
  PORT: process.env.PORT || 8001,
  NODE_ENV: process.env.NODE_ENV || 'development',
  
  // Database
  MONGO_URL: process.env.MONGO_URL || 'mongodb://localhost:27017',
  DB_NAME: process.env.DB_NAME || 'test_database',
  
  // CORS
  CORS_ORIGINS: process.env.CORS_ORIGINS || '*',
  
  // JWT
  JWT_SECRET: process.env.JWT_SECRET || 'default_jwt_secret',
  JWT_EXPIRY: process.env.JWT_EXPIRY || '7d',
  
  // Stripe
  STRIPE_API_KEY: process.env.STRIPE_API_KEY || '',
  
  // Wallet Configuration
  wallets: {
    METAMASK_ENABLED: process.env.METAMASK_ENABLED === 'true',
    TRUST_WALLET_ENABLED: process.env.TRUST_WALLET_ENABLED === 'true',
    WALLETCONNECT_ENABLED: process.env.WALLETCONNECT_ENABLED === 'true',
    WALLETCONNECT_PROJECT_ID: process.env.WALLETCONNECT_PROJECT_ID || '',
    SUPPORTED_CHAIN_IDS: (process.env.SUPPORTED_CHAIN_IDS || '1,137,56').split(',').map(Number),
  },
  
  // Helper methods
  isDevelopment: () => env.NODE_ENV === 'development',
  isProduction: () => env.NODE_ENV === 'production',
};

module.exports = env;
