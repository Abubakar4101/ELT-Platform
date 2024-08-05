// Source.js
const mongoose = require('mongoose');

const SourceSchema = new mongoose.Schema({
  name: { type: String, required: true },
  workspace_id: { type: String, ref: 'Workspace', required: true },
  type: { type: String, required: true },
  configuration: { type: Object, required: true },
}, { timestamps: true });

module.exports = mongoose.model('Source', SourceSchema);
