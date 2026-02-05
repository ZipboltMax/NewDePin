/**
 * Models Index
 * Export all models from single entry point
 */
const User = require('./user.model');
const UserSession = require('./session.model');
const Investment = require('./investment.model');
const PaymentTransaction = require('./payment.model');

module.exports = {
  User,
  UserSession,
  Investment,
  PaymentTransaction,
};
