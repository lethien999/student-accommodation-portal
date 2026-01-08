const rateLimit = require('express-rate-limit');

// General API rate limiter
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10000, // Relaxed for Dev
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again after 15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Strict limiter for authentication routes
const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 1000, // Relaxed for Dev
  message: {
    success: false,
    message: 'Too many authentication attempts, please try again after an hour'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Strict limiter for creating content (reviews, accommodations)
const createLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 1000, // Relaxed for Dev
  message: {
    success: false,
    message: 'Too many create requests, please try again later'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = {
  apiLimiter,
  authLimiter,
  createLimiter
};
