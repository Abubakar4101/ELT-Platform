const express = require('express');
const redisClient = require('../config/redis');
const Workspace = require('../models/Workspace');
const mongoose = require('mongoose');

const router = express.Router();

/**
 * Helper function to fetch workspace IDs by user ID from the database or Redis cache.
 * @param {String} userId - The ID of the user.
 * @returns {Array} List of workspace IDs.
 */
async function getWorkspacesByUserId(userId) {
  // Try to get workspace IDs from Redis cache
  let workspaces = await redisClient.get(`user:${userId}:workspaces`);
  if (!workspaces) {
    // If not found in Redis, fetch from the database
    workspaces = await Workspace.find({ user_ids: userId });
    // Store the fetched workspace IDs in Redis cache
    await redisClient.set(`user:${userId}:workspaces`, JSON.stringify(workspaces), 'EX', 3600);
  } else {
    workspaces = JSON.parse(workspaces);
  }
  return workspaces;
}

/**
 * Route to get all workspaces of a user.
 * @route GET /users/:userId/workspaces
 * @param {String} userId - The ID of the user.
 * @returns {Array} List of workspace IDs.
 */
router.get('/users/:userId/workspaces', async (req, res) => {
  const { userId } = req.params;
  try {
    // Fetch workspace IDs by user ID
    let workspaces = await getWorkspacesByUserId(mongoose.Types.ObjectId.createFromHexString(userId));
    res.status(200).json({ workspaces });
  } catch (err) {
    console.error('Error fetching user workspaces:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
module.exports.getWorkspacesByUserId = getWorkspacesByUserId;