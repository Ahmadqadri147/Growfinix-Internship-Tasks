import Redis from 'ioredis';
import config from './index';
import logger from '../utils/logger';

let redis: Redis | null = null;
let redisAvailable = false;

try {
  redis = new Redis(config.redis.url, {
    maxRetriesPerRequest: 1,
    retryStrategy() {
      return null; // Don't reconnect automatically
    },
    lazyConnect: true,
    connectTimeout: 2000,
  });

  redis.on('connect', () => {
    redisAvailable = true;
    logger.info('Redis connected successfully');
  });

  redis.on('error', () => {
    redisAvailable = false;
  });

  redis.on('close', () => {
    redisAvailable = false;
  });
} catch {
  logger.warn('Redis not available, using in-memory fallback');
}

export const isRedisAvailable = (): boolean => redisAvailable;

export const getRedis = (): Redis | null => {
  return redisAvailable ? redis : null;
};

export default redis;
