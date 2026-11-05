const multer = require("multer");

// Use memory storage for direct Cloudinary streaming or buffer upload
const storage = multer.memoryStorage();

// Accept image files only
const fileFilter = (req, file, cb) => {
  if (
    file.mimetype.startsWith("image/") ||
    /\.(jpg|jpeg|png|webp|gif)$/i.test(file.originalname)
  ) {
    cb(null, true);
  } else {
    cb(new Error("Only image files (JPG, PNG, WebP, GIF) are allowed"), false);
  }
};

const upload = multer({
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  },
  fileFilter,
});

module.exports = upload;
