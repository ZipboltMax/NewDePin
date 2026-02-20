/**
 * MongoDB Database Connection
 * Uses Mongoose for MongoDB operations
 */
const mongoose = require('mongoose');
const env = require('./env');
const logger = require('../utils/logger');

const connectDB = async () => {
  try {
    // If MONGO_URL already contains the DB name (Atlas-style), use it directly
    // Otherwise append DB_NAME
    const mongoURI = env.MONGO_URL.includes('mongodb+srv') || env.MONGO_URL.includes('mongodb.net')
      ? env.MONGO_URL
      : `${env.MONGO_URL}/${env.DB_NAME}`;

    const options = {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    };

    await mongoose.connect(mongoURI, options);

    logger.info(`MongoDB connected successfully`);

    // Connection event handlers
    mongoose.connection.on('error', (err) => {
      logger.error('MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      logger.warn('MongoDB disconnected');
    });

    // Graceful shutdown
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      logger.info('MongoDB connection closed through app termination');
      process.exit(0);
    });

  } catch (error) {
    logger.error('MongoDB connection failed:', error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
