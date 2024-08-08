const Source = require('../models/Source');
const Workspace = require('../models/Workspace');
const NotificationService = require('../services/NotificationService');
const redisClient = require('../config/redis');
const mongoose = require('mongoose');

/**
 * Watches the Source collection for changes and notifies users accordingly.
 */
const watchSources = async () => {
  // Retrieve the last resume token from Redis to resume watching from where it left off
  let resumeToken = await redisClient.get('sourceResumeToken');
  resumeToken = resumeToken ? JSON.parse(resumeToken) : null;

  // Start watching the Source collection for changes
  const changeStream = Source.watch([], { resumeAfter: resumeToken });

  // Handle change events in the Source collection
  changeStream.on('change', async (change) => {
    try {
      // Initialize variables to store change details
      let changeType = '';
      let _id = '';
      let workspace_id = '';
      let name = '';
      let message = '';
      let sendNotification = false;

      // Handle different types of change operations
      if (change.operationType === 'insert') {
        ({ _id, workspace_id, name } = change.fullDocument);
        let workspace = await getWorkspace(workspace_id);
        if (workspace) {
          changeType = 'source_added';
          message = `A new source "${name}" was added to ${workspace.name}.`;

          // Store the new document in Redis
          await redisClient.set(`source:${_id}`, JSON.stringify({ ...change.fullDocument, workspaceName: workspace.name }));
          sendNotification = true;
        }
      } else if (change.operationType === 'delete') {
        const cachedDocument = await redisClient.get(`source:${change.documentKey._id}`);
        if (cachedDocument) {
          ({ _id, workspace_id, name, workspaceName } = JSON.parse(cachedDocument));
          changeType = 'source_removed';
          message = `The source "${name}" was removed from ${workspaceName}.`;

          // Remove the document from Redis
          await redisClient.del(`source:${change.documentKey._id}`);
          sendNotification = true;
        }
      } else if (change.operationType === 'update') {
        const cachedDocument = await redisClient.get(`source:${change.documentKey._id}`);
        if (cachedDocument) {
          ({ _id, workspace_id, name, workspaceName } = JSON.parse(cachedDocument));
          changeType = 'source_updated';
          message = `The source "${name}" was updated in ${workspaceName}.`;

          // Update the document in Redis with the new changes
          await redisClient.set(`source:${_id}`, JSON.stringify(change.updateDescription.updatedFields));
          sendNotification = true;
        }
      }

      // If a notification should be sent, create and send it
      if (sendNotification) {
        await NotificationService.createNotification(
          new mongoose.Types.ObjectId(workspace_id),
          new mongoose.Types.ObjectId(_id),
          changeType,
          message
        );
      }

      // Save the current resume token to Redis to maintain state
      await redisClient.set('sourceResumeToken', JSON.stringify(change._id));
    } catch (err) {
      console.error('Error handling source change:', err);
    }
  });

  // Handle error events from the change stream
  changeStream.on('error', async (error) => {
    console.error('Change stream error:', error);
    if (error.hasErrorLabel('ResumableChangeStreamError')) {
      // If the error is resumable, restart the change stream
      await watchSources();
    }
  });

  /**
   * Helper function to fetch workspace details from Redis or MongoDB.
   * @param {String} workspaceId - Workspace ID.
   * @returns {Object} Workspace document.
   */
  const getWorkspace = async (workspaceId) => {
    // Try to get the workspace details from Redis
    let workspace = await redisClient.get(`workspace:${workspaceId}`);
    if (!workspace) {
      // If not found in Redis, fetch from MongoDB
      workspace = await Workspace.findById(workspaceId);
      // Store the fetched workspace in Redis for quick future access
      await redisClient.set(`workspace:${workspaceId}`, JSON.stringify(workspace), 'EX', 3600);
    } else {
      workspace = JSON.parse(workspace);
    }

    return workspace;
  };

  return changeStream;
};

module.exports = watchSources;