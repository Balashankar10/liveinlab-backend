const mongoose = require('mongoose');

const AdminSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  // Add more fields later if needed
});

module.exports = mongoose.model('Admin', AdminSchema);
