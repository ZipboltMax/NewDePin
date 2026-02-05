/**
 * Logger Utility
 * Simple logging utility with levels
 */
const env = require('../config/env');

const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

const getTimestamp = () => new Date().toISOString();

const logger = {
  info: (message, ...args) => {
    console.log(`${colors.green}[INFO]${colors.reset} ${getTimestamp()} - ${message}`, ...args);
  },
  
  warn: (message, ...args) => {
    console.warn(`${colors.yellow}[WARN]${colors.reset} ${getTimestamp()} - ${message}`, ...args);
  },
  
  error: (message, ...args) => {
    console.error(`${colors.red}[ERROR]${colors.reset} ${getTimestamp()} - ${message}`, ...args);
  },
  
  debug: (message, ...args) => {
    if (env.isDevelopment()) {
      console.log(`${colors.cyan}[DEBUG]${colors.reset} ${getTimestamp()} - ${message}`, ...args);
    }
  },
  
  request: (req) => {
    console.log(
      `${colors.blue}[REQUEST]${colors.reset} ${getTimestamp()} - ${req.method} ${req.originalUrl}`
    );
  },
};

module.exports = logger;
