const express = require('express');
const path = require('path');

const router = express.Router();

/**
 * @route GET /
 * @desc Serve home page if session exists, otherwise login page
 * @access Public
 */
router.get('/', (req, res) => {
  if (req.userId) {
    res.sendFile(path.join(__dirname, '../public/home.html')); // Serve the home page if session exists
  } else {
    res.sendFile(path.join(__dirname, '../public/login.html')); // Otherwise serve the login page
  }
});

module.exports = router;