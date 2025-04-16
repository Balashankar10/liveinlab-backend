const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

// Cloudinary setup for image uploads
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

// Load environment variables
dotenv.config();

// ✅ Decode Google Credentials (for Railway)
if (process.env.GOOGLE_CREDENTIALS_B64) {
  const googleCredsPath = path.join(__dirname, 'google-credentials.json');
  fs.writeFileSync(
    googleCredsPath,
    Buffer.from(process.env.GOOGLE_CREDENTIALS_B64, 'base64')
  );
  process.env.GOOGLE_APPLICATION_CREDENTIALS = googleCredsPath;
}

// Initialize the app
const app = express();
app.use(cors());
app.use(express.json());

// Cloudinary configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Setup Multer with Cloudinary storage
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'villagers_uploads', // Folder name in Cloudinary
    allowed_formats: ['jpg', 'jpeg', 'png'], // Allowed image formats
  },
});

const upload = multer({ storage });

// ✅ Health Check route
app.get("/", (req, res) => {
  res.send("✅ Live-in-Lab backend is running!");
});

// 🔌 Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('❌ DB connection error:', err));

// 📦 Dynamically load models
const modelsPath = path.join(__dirname, 'models');
fs.readdirSync(modelsPath).forEach(file => {
  if (file.endsWith('.js')) {
    require(path.join(modelsPath, file));
  }
});

// 🛣️ Dynamically load routes
const routesPath = path.join(__dirname, 'routes');
fs.readdirSync(routesPath).forEach(file => {
  if (file.endsWith('.js')) {
    const route = require(path.join(routesPath, file));
    const routeName = file === 'index.js' ? '' : file.replace('.js', '');
    app.use(`/api/${routeName}`, route);
  }
});

// 🚀 Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
