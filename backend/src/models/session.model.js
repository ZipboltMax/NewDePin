/**
 * User Session Model
 * MongoDB schema for auth sessions
 */
const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const sessionSchema = new mongoose.Schema({
  session_id: {
    type: String,
    default: () => `sess_${uuidv4().replace(/-/g, '').slice(0, 8)}`,
    unique: true,
  },
  user_id: {
    type: String,
    required: true,
    index: true,
  },
  session_token: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  expires_at: {
    type: Date,
    required: true,
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

// TTL index - auto-delete expired sessions
sessionSchema.index({ expires_at: 1 }, { expireAfterSeconds: 0 });

const UserSession = mongoose.model('UserSession', sessionSchema);

module.exports = UserSession;
