const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const ttsRoute = require("./routes/tts");

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use("/api/tts", ttsRoute);
// 📸 Serve uploaded images
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 🗂 Ensure uploads/ folder exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
  console.log('✅ uploads/ folder created');
}

// 🔌 MongoDB connection
mongoose.connect(process.env.MONGO_URI, {
 // useNewUrlParser: true,
 // useUnifiedTopology: true
}).then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('❌ DB connection error:', err));

// 📦 Load all models dynamically
const modelsPath = path.join(__dirname, 'models');
fs.readdirSync(modelsPath).forEach(file => {
  if (file.endsWith('.js')) {
    require(path.join(modelsPath, file));
  }
});

// 🛣️ Load routes
// 📦 Load all routes dynamically
const routesPath = path.join(__dirname, 'routes');
fs.readdirSync(routesPath).forEach(file => {
  if (file.endsWith('.js')) {
    const route = require(path.join(routesPath, file));
    const routeName = file.replace('.js', '');
    app.use(`/api/${routeName}`, route);
  }
});


// 🚀 Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
