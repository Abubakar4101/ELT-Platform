// UnreadNotification.js
const mongoose = require('mongoose');

const UnreadNotificationSchema = new mongoose.Schema({
  workspace_id: { type: String, ref: 'Workspace', required: true },
  user_ids: [{ type: String, ref: 'User', required: true }],
  source_id: { type: String, ref: 'Source' },
  type: { type: String, required: true },
  message: { type: String, required: true },
  created_at: { type: Date, default: Date.now },
}, { timestamps: true });

module.exports = mongoose.model('UnreadNotification', UnreadNotificationSchema);