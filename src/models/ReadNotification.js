// ReadNotification.js
const mongoose = require('mongoose');

const ReadNotificationSchema = new mongoose.Schema({
  workspace_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Workspace', required: true },
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  source_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Source' },
  type: { type: String, required: true },
  message: { type: String, required: true },
  created_at: { type: Date, default: Date.now },
}, { timestamps: true });

// Add indexes
ReadNotificationSchema.index({ user_id: 1 });

module.exports = mongoose.model('ReadNotification', ReadNotificationSchema);
