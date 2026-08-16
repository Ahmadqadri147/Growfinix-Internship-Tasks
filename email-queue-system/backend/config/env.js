require('dotenv').config();

const REQUIRED = ['MONGODB_URI', 'REDIS_HOST', 'REDIS_PORT', 'ADMIN_EMAIL'];

function validateEnv() {
  const missing = REQUIRED.filter((key) => !process.env[key]);
  if (missing.length) {
    throw new Error(
      `[CONFIG] Missing required environment variables: ${missing.join(', ')}. ` +
        'Copy backend/.env.example to backend/.env and fill in the values.'
    );
  }
}

validateEnv();

module.exports = {
  env: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT) || 5000,
  mongodbUri: process.env.MONGODB_URI,
  redis: {
    host: process.env.REDIS_HOST,
    port: Number(process.env.REDIS_PORT) || 6379,
    password: process.env.REDIS_PASSWORD || undefined,
  },
  smtp: {
    host: process.env.SMTP_HOST || '',
    port: Number(process.env.SMTP_PORT) || 587,
    user: process.env.SMTP_USER || '',
    password: process.env.SMTP_PASSWORD || '',
    fromName: process.env.SMTP_FROM_NAME || 'Growfinix Booking Desk',
    fromAddress:
      process.env.SMTP_USER && !process.env.SMTP_USER.includes('your_smtp_')
        ? process.env.SMTP_USER
        : process.env.ADMIN_EMAIL,
    secure: String(process.env.SMTP_DISABLE_TLS).toLowerCase() !== 'true',
  },
  adminEmail: process.env.ADMIN_EMAIL,
  corsOrigin: (process.env.CORS_ORIGIN || 'http://localhost:5173')
    .split(',')
    .map((o) => o.trim()),
};