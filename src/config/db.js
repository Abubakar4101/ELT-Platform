const mongoose = require('mongoose');

// Load environment variables from .env file
require('dotenv').config({ path: './config.env' });

/**
 * Connect to MongoDB using Mongoose
 */
const connectDB = async () => {
  try {
    // Attempt to connect to the MongoDB database using the connection URL from environment variables
    await mongoose.connect(process.env.MONGO_URL);
    console.log('MongoDB connected'); // Log successful connection
  } catch (err) {
    // Log any errors that occur during the connection attempt and exit the process
    console.error('Error connecting to MongoDB:', err.message);
    process.exit(1);
  }
};

module.exports = connectDB;
