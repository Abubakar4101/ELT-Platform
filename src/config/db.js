// db.js
const mongoose = require('mongoose');
const dummyData = require('../utils/dummyData');

// Load environment variables from.env file
require('dotenv').config({ path: './config.env' });

/**
 * Connect to MongoDB using Mongoose
 */
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    //dummyData();
    console.log('MongoDB connected');
  } catch (err) {
    console.error('Error connecting to MongoDB:', err.message);
    process.exit(1);
  }
};

module.exports = connectDB;
