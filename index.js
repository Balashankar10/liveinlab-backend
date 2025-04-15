const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

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

const app = express();
app.use(cors());
app.use(express.json());

// ✅ Health Check
app.get("/", (req, res) => {
  res.send("✅ Live-in-Lab backend is running!");
});

// ✅ Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 🗂 Ensure uploads/ folder exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
  console.log('✅ uploads/ folder created');
}

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
