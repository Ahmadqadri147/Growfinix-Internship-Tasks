const Redis = require('ioredis');
const config = require('./env');

// A single shared Redis connection factory.
// BullMQ requires maxRetriesPerRequest: null so a blocked
// connection is never returned during a retry.
function createRedisConnection() {
  return new Redis({
    host: config.redis.host,
    port: config.redis.port,
    password: config.redis.password,
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
    retryStrategy: (times) => Math.min(times * 1000, 5000),
  });
}

async function checkRedis(connection) {
  const pong = await connection.ping();
  if (pong !== 'PONG') throw new Error('Redis ping did not respond with PONG');
}

module.exports = { createRedisConnection, checkRedis };