const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const config = require('./config/env');
const { connectDB, disconnectDB } = require('./config/db');
const { createRedisConnection, checkRedis } = require('./config/redis');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');
const { apiLimiter } = require('./middleware/rateLimiter');
const { emailQueue, closeQueue } = require('./queues/emailQueue');
const enquiryRoutes = require('./routes/enquiryRoutes');
const emailRoutes = require('./routes/emailRoutes');
const queueRoutes = require('./routes/queueRoutes');
const logger = require('./utils/logger');

const app = express();

app.use(helmet());
app.use(
  cors({
    origin: config.corsOrigin,
    credentials: false,
  })
);
app.use(express.json({ limit: '100kb' }));
app.use(apiLimiter);

app.get('/api/health', (req, res) => {
  res.json({ success: true, data: { status: 'ok', uptime: process.uptime() } });
});

app.use('/api/enquiries', enquiryRoutes);
app.use('/api/emails', emailRoutes);
app.use('/api/queue', queueRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

let redisConnection;

async function start() {
  try {
    await connectDB();

    // Fail fast with a clear message if Redis is unreachable.
    redisConnection = createRedisConnection();
    await checkRedis(redisConnection);
    logger.success(`[REDIS] Connected → ${config.redis.host}:${config.redis.port}`);

    app.listen(config.port, () => {
      logger.success(`[API] Server running on http://localhost:${config.port}`);
      logger.info(`[API] Queue: ${emailQueue.name} | Worker must be started separately (npm run worker)`);
    });
  } catch (err) {
    logger.error(`[API] Failed to start: ${err.message}`);
    process.exit(1);
  }
}

async function shutdown(signal) {
  logger.warn(`[API] Received ${signal} — shutting down gracefully…`);
  const timers = [];
  const finish = setTimeout(() => process.exit(1), 10000);
  timers.push(finish);

  try {
    await closeQueue();
    if (redisConnection) await redisConnection.quit();
    await disconnectDB();
    clearTimeout(finish);
    process.exit(0);
  } catch (err) {
    logger.error(`[API] Shutdown error: ${err.message}`);
    clearTimeout(finish);
    process.exit(1);
  }
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

process.on('unhandledRejection', (reason) => {
  logger.error(`[API] Unhandled rejection: ${reason?.message || reason}`);
});
process.on('uncaughtException', (err) => {
  logger.error(`[API] Uncaught exception: ${err.message}`);
  process.exit(1);
});

if (require.main === module) {
  start();
}

module.exports = app;