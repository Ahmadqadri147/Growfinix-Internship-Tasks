const nodemailer = require('nodemailer');
const config = require('../config/env');
const logger = require('../utils/logger');

// Build the nodemailer transport once. When SMTP_HOST is empty we use
// the JSON transport so the full pipeline (queue → worker → template →
// "delivery") runs locally without real credentials. Never log passwords.
let transporter;

function isSmtpConfigured() {
  const host = config.smtp.host || '';
  const user = config.smtp.user || '';
  const password = config.smtp.password || '';
  
  if (!host || user.includes('your_smtp_') || password.includes('your_smtp_')) {
    return false;
  }
  return true;
}

function getTransporter() {
  if (transporter) return transporter;

  if (isSmtpConfigured()) {
    transporter = nodemailer.createTransport({
      host: config.smtp.host,
      port: config.smtp.port,
      secure: config.smtp.secure && config.smtp.port === 465,
      auth: { user: config.smtp.user, pass: config.smtp.password },
    });
    logger.info(`[EMAIL] SMTP transport ready → ${config.smtp.host}:${config.smtp.port}`);
  } else {
    // DEV FALLBACK ONLY — captures messages as JSON instead of sending.
    transporter = nodemailer.createTransport({
      jsonTransport: true,
    });
    logger.warn(
      '[EMAIL] SMTP not configured — using JSON transport (dev mode). ' +
        'Set SMTP_HOST/SMTP_USER/SMTP_PASSWORD in backend/.env to send real emails.'
    );
  }
  return transporter;
}

// Simulate real-world latency so the sync-vs-queue demo is meaningful.
const DEMO_DELAY_MS = Number(process.env.EMAIL_DEMO_DELAY_MS) || 1200;

async function sendEmail({ to, subject, html }) {
  const transport = getTransporter();
  const from = `"${config.smtp.fromName}" <${config.smtp.fromAddress}>`;

  const start = Date.now();
  const info = await transport.sendMail({ from, to, subject, html });

  // Honest demo: only add artificial delay in dev mode when using JSON transport.
  if (!isSmtpConfigured() && config.env !== 'production') {
    await new Promise((resolve) => setTimeout(resolve, DEMO_DELAY_MS));
  }

  const elapsed = Date.now() - start;
  logger.success(
    `[EMAIL] Message dispatched to ${to} (${info.messageId}) in ${elapsed}ms`
  );
  return info;
}

module.exports = { sendEmail, isSmtpConfigured };