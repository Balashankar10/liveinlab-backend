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

// Google Cloud Text-to-Speech setup
const { TextToSpeechClient } = require('@google-cloud/text-to-speech');

// Load environment variables
dotenv.config();

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

// ✅ Initialize Google Cloud Text-to-Speech client using environment variables
const client = new TextToSpeechClient({
  credentials: {
    client_email: process.env.GOOGLE_CLIENT_EMAIL,
    private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),  // Replace \n escape sequences
  },
  projectId: process.env.GOOGLE_PROJECT_ID,
});

// 🗣️ Endpoint for converting text to speech
app.post("/api/tts/speak", async (req, res) => {
  const { text } = req.body;  // Get the text from the request body

  // Check if text is provided
  if (!text || text.trim() === "") {
    return res.status(400).send("Text is required");
  }

  const request = {
    input: { text },  // The text to be converted into speech
    voice: {
      languageCode: "ta-IN",  // Tamil language code
      name: "ta-IN-Wavenet-A", // Voice name (choose a Tamil voice here)
    },
    audioConfig: {
      audioEncoding: "MP3", // The audio format to return
    },
  };

  try {
    // Request speech synthesis from Google Cloud Text-to-Speech API
    const [response] = await client.synthesizeSpeech(request);
    res.set("Content-Type", "audio/mpeg");  // Set response type to audio
    res.send(response.audioContent);  // Send the audio content to the client
  } catch (error) {
    console.error("TTS Error:", error);
    res.status(500).send("Failed to generate speech");
  }
});

// 🚀 Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

