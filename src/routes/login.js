const express = require('express');
const { v4: uuidv4 } = require('uuid');
const redisClient = require('../config/redis');
const User = require('../models/User');

const router = express.Router();

/**
 * @route POST /login
 * @desc Handle user login
 * @access Public
 */
router.post('/', async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (user) {
      const sessionId = uuidv4(); // Generate a unique session ID
      await redisClient.set(`session:${sessionId}`, JSON.stringify({ userId: user._id }), 'EX', 3600); // Store the session in Redis for 1 hour

      res.cookie('sessionId', sessionId, { httpOnly: true, maxAge: 3600 * 1000 }); // Set the session ID in a cookie
      res.json({ message: 'Login successful!' });
    } else {
      res.status(404).json({ error: 'User not found' });
    }
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;