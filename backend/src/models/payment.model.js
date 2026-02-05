/**
 * Payment Transaction Model
 * MongoDB schema for payment records
 */
const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const paymentSchema = new mongoose.Schema({
  transaction_id: {
    type: String,
    default: () => `txn_${uuidv4().replace(/-/g, '').slice(0, 12)}`,
    unique: true,
    index: true,
  },
  user_id: {
    type: String,
    required: true,
    index: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  currency: {
    type: String,
    default: 'usd',
  },
  payment_method: {
    type: String,
    enum: ['stripe', 'crypto'],
    required: true,
  },
  session_id: {
    type: String,
    default: null,
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'expired', 'refunded'],
    default: 'pending',
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
}, {
  toJSON: {
    transform: (doc, ret) => {
      delete ret._id;
      delete ret.__v;
      return ret;
    },
  },
});

const PaymentTransaction = mongoose.model('PaymentTransaction', paymentSchema);

module.exports = PaymentTransaction;
