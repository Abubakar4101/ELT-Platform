const mongoose = require('mongoose');

/**
 * Schema for users.
 * 
 * This schema defines the structure for users in the system.
 * Each user has a name, email, and can be part of multiple workspaces.
 */
const UserSchema = new mongoose.Schema({

  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  workspace_ids: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Workspace' }],
  
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);
