/**
 * User Model
 * MongoDB schema for user data
 */
const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');
const { ROLES } = require('../constants/roles');

const userSchema = new mongoose.Schema({
  user_id: {
    type: String,
    default: () => `user_${uuidv4().replace(/-/g, '').slice(0, 12)}`,
    unique: true,
    index: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  picture: {
    type: String,
    default: null,
  },
  wallet_address: {
    type: String,
    default: null,
    index: true,
  },
  wallet_type: {
    type: String,
    default: null,
  },
  chain_id: {
    type: Number,
    default: null,
  },
  role: {
    type: String,
    enum: Object.values(ROLES),
    default: ROLES.USER,
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
  updated_at: {
    type: Date,
    default: Date.now,
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

// Index for faster queries
userSchema.index({ user_id: 1 });

const User = mongoose.model('User', userSchema);

module.exports = User;
