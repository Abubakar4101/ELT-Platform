const UnreadNotification = require('../models/UnreadNotification');
const ReadNotification = require('../models/ReadNotification');
const redisClient = require('../config/redis');
const { getUsersByWorkspaceId } = require('../routes/getUsersByWorkspaceId');

class NotificationService {
  /**
   * Create a new notification and store it in Redis.
   * @param {Object} workspaceId - Workspace ID.
   * @param {Object} sourceId - Source ID.
   * @param {String} type - Notification type.
   * @param {String} message - Notification message.
   * @returns {Object} The created notification.
   * @throws {Error} If there is an error creating the notification.
   */
  static async createNotification(workspaceId, sourceId, type, message) {
    try {
      // Retrieve user IDs from Redis if not found then from MongoDB
        let users = await getUsersByWorkspaceId(workspaceId);
        let userIds = users.map(user => user._id);
        
      // Create new notification
      const notification = new UnreadNotification({
        workspace_id: workspaceId,
        user_ids: userIds,
        source_id: sourceId,
        type,
        message,
        created_at: new Date(),
      });

      // Save to MongoDB
      await notification.save();

      // Save to Redis
      await redisClient.lPush(
        `notifications:${workspaceId}`,
        JSON.stringify({
          _id: notification._id,
          workspace_id: workspaceId,
          source_id: sourceId,
          type,
          message,
          created_at: notification.created_at,
        })
      );

      // Notify users in the workspace
      const io = global.io;
      userIds.forEach(userId => {
        io.to(workspaceId.toString()).emit('notification', { type, message });
        redisClient.lPush(`missedEvents:${workspaceId}:${userId}`, JSON.stringify({ type, message }));
        io.on('acknowledge', (acknowledged) =>{
          console.log("acknowledged", acknowledged);
          // Remove acknowledged notification from Redis
          redisClient.lRem(`missedEvents:${workspaceId}:${userId}`, 0, JSON.stringify({ type, message }));
        })
          
      });
      // , (acknowledged) => {
      //   console.log("from change stream: ", acknowledged);
      //   // Store missed events in Redis if not acknowledged
      //   if (!acknowledged) {
      //     redisClient.lPush(`missedEvents:${workspaceId}:${userId}`, JSON.stringify({ type, message }));
      //   }
      // }
      return notification;
    } catch (err) {
      console.error('Error creating notification:', err);
      throw err;
    }
  }

  /**
   * Mark a notification as read and update the user_ids in UnreadNotification.
   * @param {String} notificationId - Notification ID.
   * @param {String} userId - User ID.
   * @param {String} workspaceId - Workspace ID.
   * @returns {Object|null} The read notification or null if not found.
   * @throws {Error} If there is an error marking the notification as read.
   */
  static async markAsRead(notificationId, userId, workspaceId) {
    try {
      // Retrieve user_ids from Redis or MongoDB
      let userIds = await redisClient.get(`user_ids:${notificationId}`);
      if (!userIds) {
        const unreadNotification = await UnreadNotification.findById(notificationId).select('user_ids');
        userIds = unreadNotification ? unreadNotification.user_ids : [];
        await redisClient.set(`user_ids:${notificationId}`, JSON.stringify(userIds));
      } else {
        userIds = JSON.parse(userIds);
      }

      // Check if userId exists in userIds array
      if (!userIds.includes(userId)) {
        console.log(`User ID ${userId} not found in the notification's user list.`);
        return null;
      }

      // Remove userId from userIds array
      const updatedUserIds = userIds.filter(id => id !== userId);

      // Update the UnreadNotification document
      await UnreadNotification.findByIdAndUpdate(notificationId, { user_ids: updatedUserIds });

      // Update Redis cache
      await redisClient.set(`user_ids:${notificationId}`, JSON.stringify(updatedUserIds));

      // Retrieve notification from Redis
      const notifications = await redisClient.lRange(`notifications:${workspaceId}`, 0, -1);
      const notificationData = notifications.map(JSON.parse).find(n => n._id === notificationId);

      if (notificationData) {
        // Move notification to ReadNotification collection
        const readNotification = new ReadNotification({
          ...notificationData,
          user_id: userId,
        });
        await readNotification.save();

        // Remove from MongoDB if no more user IDs
        if (updatedUserIds.length === 0) {
          await UnreadNotification.findByIdAndRemove(notificationId);
          // Remove from Redis cache
          await redisClient.lRem(`notifications:${workspaceId}`, 0, JSON.stringify(notificationData));
        }

        return readNotification;
      }
      return null;
    } catch (err) {
      console.error('Error marking notification as read:', err);
      throw err;
    }
  }
}

module.exports = NotificationService;