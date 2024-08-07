const redisClient = require('../config/redis');
const cookie = require('cookie');

/**
 * Middleware to handle user session based on cookies.
 * 
 * This middleware extracts the session ID from cookies, fetches the session data from Redis,
 * and attaches the user ID to the request object for further use in the application.
 * 
 * @param {Object} req - The HTTP request object
 * @param {Object} res - The HTTP response object
 * @param {Function} next - The next middleware function in the stack
 */
const sessionMiddleware = async (req, res, next) => {
  // Parse cookies from the request headers
  const cookies = cookie.parse(req.headers.cookie || '');
  const sessionId = cookies.sessionId;

  if (sessionId) {
    try {
      // Attempt to retrieve the session data from Redis using the session ID
      const session = await redisClient.get(`session:${sessionId}`);
      if (session) {
        // If session data is found, parse it and attach the user ID to the request object
        req.userId = JSON.parse(session).userId;
        // Also, store the user ID globally (for demonstration purposes)
        global.userId = req.userId;
      }
    } catch (error) {
      // Log any errors that occur while fetching the session from Redis
      console.error('Error fetching session from Redis:', error);
    }
  }

  // Proceed to the next middleware function
  next();
};

module.exports = sessionMiddleware;
