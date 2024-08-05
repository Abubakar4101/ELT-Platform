const express = require('express');
const redisClient = require('../config/redis');
const User = require('../models/User');

const router = express.Router();

/**
 * Helper function to fetch users by workspace ID from the database.
 * @param {String} workspaceId - Workspace ID.
 * @returns {Array} List of user documents.
 */
async function getUsersByWorkspaceId(workspaceId) {
  // Fetch user documents from the redis by workspace ID
  let users = await redisClient.get(`workspace:${workspaceId}:users`);
  if (!users) {
    // If not found in Redis, fetch from the database
    users = await User.find({ workspace_ids: workspaceId });
    // Store the fetched user documents in Redis
    await redisClient.set(`workspace:${workspaceId}:users`, JSON.stringify(users));
  } else {
    users = JSON.parse(users);
  }
  return users;
}

/**
 * Route to get all members of a workspace.
 * @route GET /workspaces/:workspaceId/members
 * @param {String} workspaceId - Workspace ID.
 * @returns {Array} List of user documents.
 */
router.get('/workspaces/:workspaceId/members', async (req, res) => {
  const { workspaceId } = req.params;
  try {
    // Try to get user documents from Redis
    let users = await getUsersByWorkspaceId(workspaceId);    
    res.status(200).json({ users });
  } catch (err) {
    console.error('Error fetching workspace members:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
module.exports.getUsersByWorkspaceId = getUsersByWorkspaceId;
