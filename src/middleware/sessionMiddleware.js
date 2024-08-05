const redisClient = require('../config/redis');
const cookie = require('cookie');

const sessionMiddleware = async (req, res, next) => {
  const cookies = cookie.parse(req.headers.cookie || '');
  const sessionId = cookies.sessionId;

  if (sessionId) {
    try {
      const session = await redisClient.get(`session:${sessionId}`);
      if (session) {
        req.userId = JSON.parse(session).userId;
        global.userId = req.userId;
      }
    } catch (error) {
      console.error('Error fetching session from Redis:', error);
    }
  }
  next();
};

module.exports = sessionMiddleware;