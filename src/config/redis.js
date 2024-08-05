// redis.js
const redis = require('redis');

// Load environment variables from.env file
require('dotenv').config({ path: './config.env' });

const client = redis.createClient({
  url: process.env.REDIS_URL
});

client.on('error', (err) => console.error('Redis client error', err));

client.connect().then(() => {
  console.log('Connected to Redis');
});

module.exports = client;