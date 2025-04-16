const express = require('express');
const router = express.Router();
const multer = require('multer');
const { storage } = require('../utils/cloudinary'); // 👈 Cloudinary storage
const Complaint = require('../models/Complaint');

// Multer configuration for uploading files to Cloudinary
const upload = multer({ storage });

// File a complaint route
router.post('/file', upload.single('image'), async (req, res) => {
  try {
    // Remove these logs
    // console.log('REQ FILE:', req.file); // Log Cloudinary file data
    // console.log('REQ BODY:', req.body);

    // Extract fields from the request body
    const { subject, name, address, description, lat, lng, userEmail } = req.body;

    // Validate required fields
    if (!userEmail) {
      return res.status(400).json({ message: 'User email is required.' });
    }

    // Create a new complaint
    const complaint = new Complaint({
      subject,
      name,
      address,
      description,
      userEmail,
      imageUrl: req.file?.path || '', // ✅ FIX: use 'path' instead of 'secure_url'
      location: {
        lat: parseFloat(lat),
        lng: parseFloat(lng),
        gmapUrl: `https://www.google.com/maps?q=${lat},${lng}`,
      },
      status: 'Pending', // Default status
    });

    // Save complaint to DB
    await complaint.save();
    res.status(200).json({ message: 'Complaint filed successfully' });
  } catch (error) {
    console.error('🔥 Error filing complaint:', error.message);
    res.status(500).json({ message: 'Server error. Could not file complaint.', error: error.message });
  }
});

// Get all complaints route
router.get('/all', async (req, res) => {
  try {
    const complaints = await Complaint.find();

    const updated = complaints.map((c) => ({
      _id: c._id,
      subject: c.subject,
      name: c.name,
      address: c.address,
      description: c.description,
      status: c.status,
      imageUrl: c.imageUrl,
      location: {
        lat: c.location?.lat,
        lng: c.location?.lng,
        gmapUrl: c.location?.lat && c.location?.lng
          ? `https://maps.google.com/?q=${c.location.lat},${c.location.lng}`
          : null
      },
      createdAt: c.createdAt,
    }));

    res.json(updated);
  } catch (error) {
    console.error('Error fetching complaints:', error);
    res.status(500).json({ error: 'Failed to fetch complaints' });
  }
});

// Update complaint status route
router.put('/update-status/:id', async (req, res) => {
  try {
    const { status } = req.body;
    await Complaint.findByIdAndUpdate(req.params.id, { status });
    res.json({ message: 'Status updated successfully' });
  } catch (err) {
    console.error('Status update error:', err);
    res.status(500).json({ message: 'Failed to update status' });
  }
});

// Get complaints by user route
router.get('/my-complaints', async (req, res) => {
  const { email } = req.query;
  try {
    const complaints = await Complaint.find({ userEmail: email });
    res.json(complaints);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch complaints' });
  }
});

module.exports = router;
