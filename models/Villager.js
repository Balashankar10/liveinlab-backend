const mongoose = require('mongoose');

const VillagerSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  // Add more fields later if needed
});

module.exports = mongoose.model('Villager', VillagerSchema);
