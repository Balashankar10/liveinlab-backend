const express = require('express');
const router = express.Router();
const multer = require('multer');
const Complaint = require('../models/Complaint');

// Setup multer for image uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    const uniqueName = Date.now() + '-' + file.originalname;
    cb(null, uniqueName);
  }
});

const upload = multer({ storage });

// File a complaint
router.post('/file', upload.single('image'), async (req, res) => {
  try {
    const { subject, name, address, description, lat, lng, userEmail } = req.body;

    if (!userEmail) {
      return res.status(400).json({ message: 'User email is required.' });
    }

    const complaint = new Complaint({
      subject,
      name,
      address,
      description,
      userEmail, // 👈 Unique identifier
      imageUrl: req.file ? `/uploads/${req.file.filename}` : '',
      location: {
        lat: parseFloat(lat),
        lng: parseFloat(lng),
        gmapUrl: `https://www.google.com/maps?q=${lat},${lng}`
      },
      status: 'Pending'
    });

    await complaint.save(); // ✅ Save complaint to DB

    res.status(200).json({ message: 'Complaint filed successfully' }); // ✅ Send response
  } catch (error) {
    console.error('Error filing complaint:', error);
    res.status(500).json({ message: 'Server error. Could not file complaint.' });
  }
});




// Get all complaints
router.get('/all', async (req, res) => {
  try {
    const complaints = await Complaint.find();

    // Transform complaints to include image URL and Google Maps link
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


// ✅ Update complaint status using /update-status/:id
router.put('/update-status/:id', async (req, res) => {
  try {
    const { status } = req.body;
    await Complaint.findByIdAndUpdate(req.params.id, { status });
    res.json({ message: 'Status updated successfully' });
  } catch (err) {
    console.error('❌ Status update error:', err);
    res.status(500).json({ message: 'Failed to update status' });
  }
});

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
