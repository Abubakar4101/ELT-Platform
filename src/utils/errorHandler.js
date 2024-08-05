// errorHandler.js
/**
 * Error handling middleware
 * @param {Object} err - Error object
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @param {Function} next - Next middleware function
 */
const errorHandler = (err, req, res, next) => {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  };
  
  module.exports = errorHandler;  