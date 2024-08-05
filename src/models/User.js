// User.js
const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  workspace_ids: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Workspace' }],
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);
