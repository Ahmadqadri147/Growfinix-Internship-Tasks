const config = require('./config/env');
const { connectDB, disconnectDB } = require('./config/db');
const { createRedisConnection, checkRedis } = require('./config/redis');
const { createWorker } = require('./workers/emailWorker');
const logger = require('./utils/logger');

// Standalone worker process — completely independent from the API.
let redisConnection;
let worker;

async function start() {
  try {
    await connectDB();

    redisConnection = createRedisConnection();
    await checkRedis(redisConnection);
    logger.success(`[REDIS] Connected → ${config.redis.host}:${config.redis.port}`);

    worker = createWorker(redisConnection);
    logger.success('[WORKER] BullMQ worker started — listening on emailQueue');
    logger.info('[WORKER] Press Ctrl+C to stop');
  } catch (err) {
    logger.error(`[WORKER] Failed to start: ${err.message}`);
    process.exit(1);
  }
}

async function shutdown(signal) {
  logger.warn(`[WORKER] Received ${signal} — shutting down gracefully…`);
  const finish = setTimeout(() => process.exit(1), 10000);
  try {
    await worker.close();
    await redisConnection.quit();
    await disconnectDB();
    clearTimeout(finish);
    process.exit(0);
  } catch (err) {
    logger.error(`[WORKER] Shutdown error: ${err.message}`);
    clearTimeout(finish);
    process.exit(1);
  }
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

process.on('unhandledRejection', (reason) => {
  logger.error(`[WORKER] Unhandled rejection: ${reason?.message || reason}`);
});
process.on('uncaughtException', (err) => {
  logger.error(`[WORKER] Uncaught exception: ${err.message}`);
  process.exit(1);
});

start();