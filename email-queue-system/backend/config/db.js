const mongoose = require('mongoose');
const config = require('./env');
const logger = require('../utils/logger');

async function connectDB() {
  try {
    await mongoose.connect(config.mongodbUri, {
      serverSelectionTimeoutMS: 10000,
    });
    logger.info('[DB] MongoDB connected');
  } catch (err) {
    logger.error(`[DB] MongoDB connection failed: ${err.message}`);
    throw err;
  }
}

async function disconnectDB() {
  try {
    await mongoose.disconnect();
    logger.info('[DB] MongoDB disconnected');
  } catch (err) {
    logger.error(`[DB] Error while disconnecting: ${err.message}`);
  }
}

module.exports = { connectDB, disconnectDB };