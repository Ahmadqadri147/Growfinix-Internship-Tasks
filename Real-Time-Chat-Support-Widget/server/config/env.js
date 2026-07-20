import dotenv from 'dotenv';

dotenv.config();

/**
 * Centralized environment configuration.
 * Every other module reads config values from here instead of
 * touching process.env directly.
 */
const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';

export const env = {
  PORT: process.env.PORT || 5000,
  CLIENT_URL: clientUrl,
  // CORS accepts a single origin or a comma-separated list (e.g. for
  // staging + production frontends). An empty value falls back to the default.
  CLIENT_ORIGINS: clientUrl
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean),
  NODE_ENV: process.env.NODE_ENV || 'development',
};

export default env;
