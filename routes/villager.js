const express = require('express');
const router = express.Router();
const Villager = require('../models/Villager');

// 🟢 Register (email + password)
router.post('/register', async (req, res) => {
  try {
    const { email, password } = req.body;

    const existingUser = await Villager.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: 'Villager already exists' });
    }

    const newVillager = new Villager({ email, password });
    await newVillager.save();

    res.status(201).json({ message: 'Villager registered successfully' });
  } catch (err) {
    console.error("❌ Registration error:", err.message);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// 🟡 Login (email + password)
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await Villager.findOne({ email });

    if (!user || user.password !== password) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    res.status(200).json({ message: 'Login successful', user });
  } catch (err) {
    console.error("❌ Login error:", err.message);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
