require('dotenv').config();
const path = require('path');

module.exports = {
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  huggingface: {
    apiToken: process.env.HUGGINGFACE_API_TOKEN,
    model: process.env.HUGGINGFACE_MODEL || 'black-forest-labs/FLUX.1-schnell'
  },
  rateLimit: {
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 10,
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 900000
  },
  storage: {
    path: process.env.IMAGE_STORAGE_PATH || path.join(__dirname, '../generated_images'),
    maxSize: parseInt(process.env.MAX_IMAGE_SIZE) || 10485760
  }
};