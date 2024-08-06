const Source = require('../models/Source');
const Workspace = require('../models/Workspace');
const NotificationService = require('../services/NotificationService');
const redisClient = require('../config/redis');
const mongoose = require('mongoose');


/**
 * Watch the Source collection for changes and notify users.
 */
const watchSources = async () => {
  // Get the last resume token from Redis
  let resumeToken = await redisClient.get('sourceResumeToken');
  resumeToken = resumeToken ? JSON.parse(resumeToken) : null;

  // Start the change stream with the resume token if it exists
  const changeStream = Source.watch([], { resumeAfter: resumeToken });

  changeStream.on('change', async (change) => {
    try {
      let changeType = '';
      let _id = '';
      let workspace_id = '';
      let name = '';
      let message = '';
      let sendNotification = false

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

          // Update the document in Redis
          await redisClient.set(`source:${_id}`, JSON.stringify(change.updateDescription.updatedFields));
          sendNotification = true;
        }
      }

      // Create and send notification
       if(sendNotification) await NotificationService.createNotification(
        new mongoose.Types.ObjectId(workspace_id),
        new mongoose.Types.ObjectId(_id),
        changeType,
        message
      );

      // Save the resume token to Redis
      await redisClient.set('sourceResumeToken', JSON.stringify(change._id));
    } catch (err) {
      console.error('Error handling source change:', err);
    }
  });

  // Handle error events
  changeStream.on('error', async (error) => {
    console.error('Change stream error:', error);
    if (error.hasErrorLabel('ResumableChangeStreamError')) {
      // The error is resumable, restart the change stream
      await watchSources();
    }
  });

  // Helper for create proper notification message
  const getWorkspace = async (workspaceId) => {
    // Get Workspace from Redis
    let workspace = await redisClient.get(`workspace:${workspaceId}`);
    if (!workspace) {
      // If not found in Redis, fetch from the database
      workspace = await Workspace.findById(workspaceId);
      // Store the fetched workspace in Redis
      await redisClient.set(`workspace:${workspaceId}`, JSON.stringify(workspace));
    } else {
      workspace = JSON.parse(workspace);
    }

    return workspace;
  };

};

module.exports = watchSources;