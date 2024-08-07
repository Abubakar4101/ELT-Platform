const mongoose = require('mongoose');

/**
 * Schema for read notifications.
 * 
 * This schema defines the structure for notifications that have been read by users.
 * Each notification is linked to a specific workspace, user, and potentially a source.
 */
const ReadNotificationSchema = new mongoose.Schema({

  workspace_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Workspace', required: true },
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  source_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Source' },
  type: { type: String, required: true },
  message: { type: String, required: true },
  created_at: { type: Date, default: Date.now }
  
}, { timestamps: true });

// Index to improve query performance by user_id
ReadNotificationSchema.index({ user_id: 1 });

module.exports = mongoose.model('ReadNotification', ReadNotificationSchema);
