const UnreadNotification = require('../models/UnreadNotification');
const ReadNotification = require('../models/ReadNotification');
const redisClient = require('../config/redis');
const { getUsersByWorkspaceId } = require('../routes/getUsersByWorkspaceId');

/**
 * NotificationService class handles creating, updating, and managing notifications.
 */
class NotificationService {
  /**
   * Create a new notification and store it in both MongoDB and Redis.
   * @param {Object} workspaceId - Workspace ID.
   * @param {Object} sourceId - Source ID.
   * @param {String} type - Notification type.
   * @param {String} message - Notification message.
   * @returns {Object} The created notification.
   * @throws {Error} If there is an error creating the notification.
   */
  static async createNotification(workspaceId, sourceId, type, message) {
    try {
      // Retrieve user IDs from Redis if available, otherwise fetch from MongoDB
      let users = await getUsersByWorkspaceId(workspaceId);
      let userIds = users.map(user => user._id);
      
      // Create a new unread notification
      const notification = new UnreadNotification({
        workspace_id: workspaceId,
        user_ids: userIds,
        source_id: sourceId,
        type,
        message,
        created_at: new Date(),
      });

      // Save the new notification to MongoDB
      await notification.save();

      // Store the notification in Redis for quick access
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

      // Notify users in the workspace using WebSockets
      const io = global.io;
      userIds.forEach(userId => {
        redisClient.lPush(`missedEvents:${workspaceId}:${userId}`, JSON.stringify({ type, message }));
        
        // Emit notification event to connected users
        if(global.userId == userId) io.emit('notification', { type, message });
      });

      return notification;
    } catch (err) {
      console.error('Error creating notification:', err);
      throw err;
    }
  }

  /**
   * Mark a notification as read and update the list of unread user IDs.
   * @param {String} notificationId - Notification ID.
   * @param {String} userId - User ID.
   * @param {String} workspaceId - Workspace ID.
   * @returns {Object|null} The read notification or null if not found.
   * @throws {Error} If there is an error marking the notification as read.
   */
  static async markAsRead(notificationId, userId, workspaceId) {
    try {
      // Retrieve the list of user IDs from Redis or MongoDB
      let userIds = await redisClient.get(`user_ids:${notificationId}`);
      if (!userIds) {
        const unreadNotification = await UnreadNotification.findById(notificationId).select('user_ids');
        userIds = unreadNotification ? unreadNotification.user_ids : [];
        await redisClient.set(`user_ids:${notificationId}`, JSON.stringify(userIds));
      } else {
        userIds = JSON.parse(userIds);
      }

      // Check if the user ID is in the list of unread user IDs
      if (!userIds.includes(userId)) {
        console.log(`User ID ${userId} not found in the notification's user list.`);
        return null;
      }

      // Remove the user ID from the list of unread user IDs
      const updatedUserIds = userIds.filter(id => id !== userId);

      // Update the UnreadNotification document in MongoDB
      await UnreadNotification.findByIdAndUpdate(notificationId, { user_ids: updatedUserIds });

      // Update the list of unread user IDs in Redis
      await redisClient.set(`user_ids:${notificationId}`, JSON.stringify(updatedUserIds));

      // Retrieve the notification data from Redis
      const notifications = await redisClient.lRange(`notifications:${workspaceId}`, 0, -1);
      const notificationData = notifications.map(JSON.parse).find(n => n._id === notificationId);

      if (notificationData) {
        // Move the notification to the ReadNotification collection in MongoDB
        const readNotification = new ReadNotification({
          ...notificationData,
          user_id: userId,
        });
        await readNotification.save();

        // Remove the unread notification if there are no more unread user IDs
        if (updatedUserIds.length === 0) {
          await UnreadNotification.findByIdAndRemove(notificationId);
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