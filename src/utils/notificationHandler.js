const Source = require('../models/Source');
const NotificationService = require('../services/NotificationService');
const redisClient = require('../config/redis');

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

      if (change.operationType === 'insert') {
        ({ _id, workspace_id, name } = change.fullDocument);
        changeType = 'source_added';
        message = `A new source "${name}" was added to your workspace.`;

        // Store the new document in Redis
        await redisClient.set(`source:${_id}`, JSON.stringify(change.fullDocument));
      } else if (change.operationType === 'delete') {
        const cachedDocument = await redisClient.get(`source:${change.documentKey._id}`);
        if (cachedDocument) {
          ({ _id, workspace_id, name } = JSON.parse(cachedDocument));
          changeType = 'source_removed';
          message = `The source "${name}" was removed from your workspace.`;

          // Remove the document from Redis
          await redisClient.del(`source:${change.documentKey._id}`);
        }
      } else if (change.operationType === 'update') {
        const cachedDocument = await redisClient.get(`source:${change.documentKey._id}`);
        if (cachedDocument) {
          ({ _id, workspace_id, name } = JSON.parse(cachedDocument));
          changeType = 'source_updated';
          message = `The source "${name}" was updated.`;

          // Update the document in Redis
          await redisClient.set(`source:${_id}`, JSON.stringify(change.updateDescription.updatedFields));
        }
      }

      // Create and send notification
      await NotificationService.createNotification(
        workspace_id,
        _id,
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
};

module.exports = watchSources;