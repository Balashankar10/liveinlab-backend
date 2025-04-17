const mongoose = require('mongoose');

const complaintSchema = new mongoose.Schema({
  subject: String,
  name: String,
  address: String,
  description: String,
  imageUrl: String,
  location: {
    lat: Number,
    lng: Number,
    gmapUrl: String
  },
  userEmail: String,
  status: {
    type: String,
    enum: ['Pending', 'Working', 'Completed', 'Rejected'],
    default: 'Pending'
  }
});

module.exports = mongoose.model('Complaint', complaintSchema);
