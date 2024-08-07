const express = require('express');
const path = require('path');

const router = express.Router();

/**
 * @route GET /
 * @desc Serve the home page if the session exists, otherwise serve the login page.
 * @access Public
 */
router.get('/', (req, res) => {
  const userId = req.query.user;
  if (userId) {
    res.sendFile(path.join(__dirname, '../public/home.html')); // Serve the home page if session exists
  } else {
    res.sendFile(path.join(__dirname, '../public/login.html')); // Otherwise, serve the login page
  }
});

module.exports = router;