/**
 * User Model
 * MongoDB schema for user data with bcrypt password hashing
 */
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
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
  password: {
    type: String,
    required: true,
    minlength: 6,
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
      delete ret.password;
      return ret;
    },
  },
});

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Index for faster queries
userSchema.index({ user_id: 1 });

const User = mongoose.model('User', userSchema);

module.exports = User;
