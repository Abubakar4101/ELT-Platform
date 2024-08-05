const express = require('express');
const redisClient = require('../config/redis');
const Workspace = require('../models/Workspace');

const router = express.Router();


/**
 * Helper function to fetch workspace IDs by user ID from the database.
 * @param {String} userId - User ID.
 * @returns {Array} List of workspace IDs.
 */
async function getWorkspacesByUserId(userId) {
  // Try to get workspace IDs from Redis
  let workspaces = await redisClient.get(`user:${userId}:workspaces`);
  if(!workspaces) {
    // If not found in Redis, fetch from the database
    workspaces = await Workspace.find({ user_ids: userId });
    // Store the fetched workspace IDs in Redis
    await redisClient.set(`user:${userId}:workspaces`, JSON.stringify(workspaces));
  }
  else {
    workspaces = JSON.parse(workspaces);
  }
  return workspaces;
}

/**
 * Route to get all workspaces of a user.
 * @route GET /users/:userId/workspaces
 * @param {String} userId - User ID.
 * @returns {Array} List of workspace IDs.
 */
router.get('/users/:userId/workspaces', async (req, res) => {
  const { userId } = req.params;
  try {
    // Try to get workspace IDs from Redis
    let workspaces = await getWorkspacesByUserId(userId);
    res.status(200).json({ workspaces });
  } catch (err) {
    console.error('Error fetching user workspaces:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
module.exports.getWorkspacesByUserId = getWorkspacesByUserId;