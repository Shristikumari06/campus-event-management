/**
 * Rate Limiting Middleware
 * Protects authentication endpoints against brute-force attacks and abuse.
 */

const rateLimit = require('express-rate-limit');

// Rate limiter for authentication routes (login, signup, forgot-password)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // limit each IP to 50 requests per window
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: {
    success: false,
    message: 'Too many authentication attempts from this IP. Please try again after 15 minutes.',
    code: 'RATE_LIMIT_EXCEEDED'
  }
});

// General API limiter
const apiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 300, // limit each IP to 300 requests per minute
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests. Please slow down.',
    code: 'RATE_LIMIT_EXCEEDED'
  }
});

module.exports = {
  authLimiter,
  apiLimiter
};

