const uploadGallery = multer({
  storage: makeStorage('gallery'),
  fileFilter,
  limits: { fileSize: MAX_SIZE },
});

async function optimizeImage(filePath) {
  try {
    const tempPath = filePath + '.tmp';

    await sharp(filePath)
      .resize({ width: 1200, withoutEnlargement: true })
      .jpeg({ quality: 80 })
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
