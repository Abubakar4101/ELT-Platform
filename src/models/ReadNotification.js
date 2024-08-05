// ReadNotification.js
const mongoose = require('mongoose');

const ReadNotificationSchema = new mongoose.Schema({
  workspace_id: { type: String, ref: 'Workspace', required: true },
  user_id: { type: String, ref: 'User', required: true },
  source_id: { type: String, ref: 'Source' },
  type: { type: String, required: true },
  message: { type: String, required: true },
  created_at: { type: Date, default: Date.now },
}, { timestamps: true });

// Add indexes
ReadNotificationSchema.index({ user_id: 1 });

module.exports = mongoose.model('ReadNotification', ReadNotificationSchema);
