const http = require('http');
const mongoose = require('mongoose');
const redis = require('redis');
const dotenv = require('dotenv');

const port = 3000;
dotenv.config();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URL)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));

// Connect to Redis
const redisClient = redis.createClient({
    url: REDIS_URL
  });
redisClient.on('connect', () => {
  console.log('Connected to Redis');
});

redisClient.on('error', (err) => {
  console.log('Redis error: ', err);
});

redisClient.connect();

// Create an HTTP server
const server = http.createServer((req, res) => {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/plain');
  res.end('Hello World\n');
});

server.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`);
});