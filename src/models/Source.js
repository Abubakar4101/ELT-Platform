const mongoose = require('mongoose');

/**
 * Schema for data sources.
 * 
 * This schema defines the structure for sources that provide data to the workspace.
 * Each source has a name, type, configuration, and is associated with a specific workspace.
 */
const SourceSchema = new mongoose.Schema({

  name: { type: String, required: true },
  workspace_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Workspace', required: true },
  type: { type: String, required: true },
  configuration: { type: Object, required: true }
  
}, { timestamps: true });

module.exports = mongoose.model('Source', SourceSchema);
