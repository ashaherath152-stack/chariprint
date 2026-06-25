// middleware/upload.js

const multer = require('multer');
const path = require('path');
const fs = require('fs');
const sharp = require('sharp');

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_SIZE = parseInt(
  process.env.MAX_UPLOAD_SIZE || '5242880',
  10
);

function makeStorage(subfolder) {
  const dest = path.join(
    __dirname,
    '..',
    'public',
    'uploads',
    subfolder
  );

  return multer.diskStorage({
    destination: (req, file, cb) => {
      fs.mkdirSync(dest, { recursive: true });
      cb(null, dest);
    },

    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase();

      const safeName =
        `${subfolder}-${Date.now()}-${Math.round(Math.random() * 1000000)}${ext}`;

      cb(null, safeName);
    },
  });
}

function fileFilter(req, file, cb) {
  if (ALLOWED_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only JPG, PNG, and WEBP images are allowed.'));
  }
}

const uploadProduct = multer({
  storage: makeStorage('products'),
  fileFilter,
  limits: {
    fileSize: MAX_SIZE,
  },
});

const uploadGallery = multer({
  storage: makeStorage('gallery'),
  fileFilter,
  limits: {
    fileSize: MAX_SIZE,
  },
});

async function optimizeImage(filePath) {
  try {
    const tempPath = filePath + '.tmp';

    await sharp(filePath)
      .resize({
        width: 1200,
        withoutEnlargement: true,
      })
      .jpeg({
        quality: 80,
      })
      .toFile(tempPath);

    fs.unlinkSync(filePath);
    fs.renameSync(tempPath, filePath);
  } catch (err) {
    console.error('Image optimization failed:', err);
  }
}

module.exports = {
  uploadProduct,
  uploadGallery,
  optimizeImage,
};
