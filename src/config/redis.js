const redis = require('redis');

// Load environment variables from .env file
require('dotenv').config({ path: './config.env' });

// Create a Redis client instance using the connection URL from environment variables
const client = redis.createClient({
  url: process.env.REDIS_URL
});

// Log any errors that occur with the Redis client
client.on('error', (err) => console.error('Redis client error', err));

// Connect to the Redis server and log a successful connection
client.connect().then(() => {
  console.log('Connected to Redis');
});

module.exports = client;
