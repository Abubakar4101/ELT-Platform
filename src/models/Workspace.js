const mongoose = require('mongoose');

/**
 * Schema for workspaces.
 * 
 * This schema defines the structure for workspaces in the system.
 * Each workspace has a name and can contain multiple users.
 */
const WorkspaceSchema = new mongoose.Schema({

  name: { type: String, required: true },
  user_ids: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
  
}, { timestamps: true });

module.exports = mongoose.model('Workspace', WorkspaceSchema);
