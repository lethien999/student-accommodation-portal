const morgan = require('morgan');
const fs = require('fs');
const path = require('path');

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Create a write stream for access logs
const accessLogStream = fs.createWriteStream(
  path.join(logsDir, 'access.log'),
  { flags: 'a' }
);

// Custom token for response time in ms
morgan.token('response-time-ms', (req, res) => {
  const responseTime = res.getHeader('X-Response-Time');
  return responseTime ? `${responseTime}ms` : '-';
});

// Custom token for user ID if authenticated
morgan.token('user-id', (req) => {
  return req.user ? req.user.id : 'anonymous';
});

// Custom token for request body (sanitized - no passwords)
morgan.token('body', (req) => {
  if (req.body && Object.keys(req.body).length > 0) {
    const sanitizedBody = { ...req.body };
    if (sanitizedBody.password) sanitizedBody.password = '[HIDDEN]';
    if (sanitizedBody.confirmPassword) sanitizedBody.confirmPassword = '[HIDDEN]';
    return JSON.stringify(sanitizedBody);
  }
  return '-';
});

// Development format - colorful and detailed
const developmentFormat = ':method :url :status :response-time ms - :res[content-length] - User: :user-id';

// Production format - JSON for easier parsing
const productionFormat = JSON.stringify({
  method: ':method',
  url: ':url',
  status: ':status',
  responseTime: ':response-time ms',
  contentLength: ':res[content-length]',
  userAgent: ':user-agent',
  ip: ':remote-addr',
  userId: ':user-id',
  timestamp: ':date[iso]'
});

// Create morgan middleware based on environment
const createLogger = () => {
  const isDevelopment = process.env.NODE_ENV !== 'production';

  if (isDevelopment) {
    // In development, log to console with colors
    return morgan(developmentFormat, {
      skip: (req) => req.url === '/api/health' // Skip health check logs
    });
  } else {
    // In production, log to file
    return morgan(productionFormat, {
      stream: accessLogStream,
      skip: (req) => req.url === '/api/health'
    });
  }
};

// Simple console logger for application messages
const logger = {
  info: (message, meta = {}) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] INFO: ${message}`, Object.keys(meta).length > 0 ? meta : '');
  },

  error: (message, error = null) => {
    const timestamp = new Date().toISOString();
    console.error(`[${timestamp}] ERROR: ${message}`, error ? error.stack || error : '');
  },

  warn: (message, meta = {}) => {
    const timestamp = new Date().toISOString();
    console.warn(`[${timestamp}] WARN: ${message}`, Object.keys(meta).length > 0 ? meta : '');
  },

  debug: (message, meta = {}) => {
    if (process.env.NODE_ENV !== 'production') {
      const timestamp = new Date().toISOString();
      console.debug(`[${timestamp}] DEBUG: ${message}`, Object.keys(meta).length > 0 ? meta : '');
    }
  }
};

module.exports = {
  createLogger,
  logger
};
