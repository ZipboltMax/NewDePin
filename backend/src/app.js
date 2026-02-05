/**
 * Express Application Setup
 * Configures middleware and routes
 */
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const env = require('./config/env');
const routes = require('./routes');
const { notFoundHandler, errorHandler } = require('./middlewares/error.middleware');

const app = express();

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));

// CORS configuration
const corsOptions = {
  origin: env.CORS_ORIGINS === '*' 
    ? true 
    : env.CORS_ORIGINS.split(',').map(origin => origin.trim()),
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Session-ID'],
};
app.use(cors(corsOptions));

// Request parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Logging
if (env.isDevelopment()) {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// API routes with /api prefix
app.use('/api', routes);

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
