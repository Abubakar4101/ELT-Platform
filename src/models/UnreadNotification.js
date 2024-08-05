// UnreadNotification.js
const mongoose = require('mongoose');

const UnreadNotificationSchema = new mongoose.Schema({
  workspace_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Workspace', required: true },
  user_ids: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }],
  source_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Source' },
  type: { type: String, required: true },
  message: { type: String, required: true },
  created_at: { type: Date, default: Date.now },
}, { timestamps: true });

module.exports = mongoose.model('UnreadNotification', UnreadNotificationSchema);