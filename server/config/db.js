const mongoose = require('mongoose');
const { env } = require('./env');

const connectDB = async () => {
  try {
    mongoose.set('strictQuery', true);
    await mongoose.connect(env.mongoUri, {
      autoIndex: !env.isProduction,
      serverSelectionTimeoutMS: 10000,
    });
    console.log('✅ MongoDB connected successfully');
  } catch (err) {
    console.log({ err }, 'MongoDB connection error');
    process.exit(1);
  }
};

module.exports = connectDB;
