// Workplace.js
const mongoose = require('mongoose');

const WorkspaceSchema = new mongoose.Schema({
  name: { type: String, required: true },
  user_ids: [{ type: String, ref: 'User' }],
}, { timestamps: true });

module.exports = mongoose.model('Workspace', WorkspaceSchema);
