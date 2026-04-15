const mongoose = require('mongoose');
const { env } = require('./env');
const logger = require('./logger');

const connectDB = async () => {
  try {
    mongoose.set('strictQuery', true);
    await mongoose.connect(env.mongoUri, {
      autoIndex: !env.isProduction,
      serverSelectionTimeoutMS: 10000,
    });
    logger.info('MongoDB connected successfully');
  } catch (err) {
    logger.fatal({ err }, 'MongoDB connection error');
    process.exit(1);
  }
};

module.exports = connectDB;
