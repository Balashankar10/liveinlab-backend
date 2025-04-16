const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary'); // ✅ Correct import
const multer = require('multer');

// Cloudinary configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});


// Set up Cloudinary storage configuration for multer
const storage = new CloudinaryStorage({ // ✅ Must use 'new CloudinaryStorage(...)'
  cloudinary: cloudinary,
  params: {
    folder: 'villagers_uploads',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif'], // ✅ Underscore not camelCase
  },
});

module.exports = { storage };
