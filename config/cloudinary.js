const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
require('dotenv').config();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Test Cloudinary connection
async function testCloudinaryConnection() {
  try {
    const result = await cloudinary.api.ping();
    console.log('✅ Cloudinary connected successfully');
    return true;
  } catch (error) {
    console.error('❌ Cloudinary connection failed:', error.message);
    return false;
  }
}

// Create Cloudinary storage for multer
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'bac-informatique-exams',
    allowed_formats: ['pdf'],
    resource_type: 'raw', // For non-image files like PDFs
    public_id: (req, file) => {
      const { subject, year, session, fileType } = req.body;
      const suffix = fileType === 'correction' ? '_correction' : '';
      return `${subject}_${year}_${session}${suffix}`;
    },
  },
});

// Upload file to Cloudinary
async function uploadToCloudinary(filePath, options = {}) {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      resource_type: 'raw',
      folder: 'bac-informatique-exams',
      ...options
    });
    return result;
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw error;
  }
}

// Delete file from Cloudinary
async function deleteFromCloudinary(publicId) {
  try {
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: 'raw'
    });
    return result;
  } catch (error) {
    console.error('Cloudinary delete error:', error);
    throw error;
  }
}

// Get file URL from Cloudinary
function getCloudinaryUrl(publicId) {
  return cloudinary.url(publicId, {
    resource_type: 'raw',
    secure: true
  });
}

// Get optimized URL for viewing (if supported)
function getOptimizedUrl(publicId) {
  return cloudinary.url(publicId, {
    resource_type: 'raw',
    secure: true,
    flags: 'attachment' // Force download instead of inline viewing for security
  });
}

module.exports = {
  cloudinary,
  storage,
  testCloudinaryConnection,
  uploadToCloudinary,
  deleteFromCloudinary,
  getCloudinaryUrl,
  getOptimizedUrl
};
