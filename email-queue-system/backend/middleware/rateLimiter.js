const rateLimit = require('express-rate-limit');

// General API limiter. Generous enough for the dashboard's 4s auto-sync polling.
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 1000,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests, please try again later.',
  },
});

// Strict limiter for form submissions (10 per minute per IP).
const enquiryLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many enquiries submitted. Please wait a moment and try again.',
  },
});

module.exports = { apiLimiter, enquiryLimiter };