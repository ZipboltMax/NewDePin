/**
 * Investment Model
 * MongoDB schema for user investments
 */
const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const investmentSchema = new mongoose.Schema({
  investment_id: {
    type: String,
    default: () => `inv_${uuidv4().replace(/-/g, '').slice(0, 12)}`,
    unique: true,
    index: true,
  },
  user_id: {
    type: String,
    required: true,
    index: true,
  },
  plan_id: {
    type: String,
    required: true,
  },
  segment_id: {
    type: String,
    required: true,
  },
  amount: {
    type: Number,
    required: true,
    min: 0,
  },
  apy: {
    type: Number,
    required: true,
  },
  lock_period_days: {
    type: Number,
    required: true,
  },
  start_date: {
    type: Date,
    default: Date.now,
  },
  end_date: {
    type: Date,
    required: true,
  },
  status: {
    type: String,
    enum: ['active', 'completed', 'withdrawn', 'cancelled'],
    default: 'active',
  },
  rewards_earned: {
    type: Number,
    default: 0,
  },
  tx_hash: {
    type: String,
    default: null,
  },
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  toJSON: {
    transform: (doc, ret) => {
      delete ret._id;
      delete ret.__v;
      return ret;
    },
  },
});

const Investment = mongoose.model('Investment', investmentSchema);

module.exports = Investment;
