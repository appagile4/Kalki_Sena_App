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

// Accept video files (MP4, MOV, WebM, MKV)
const videoFilter = (req, file, cb) => {
  if (
    file.mimetype.startsWith("video/") ||
    /\.(mp4|mov|webm|mkv|avi|m4v)$/i.test(file.originalname)
  ) {
    cb(null, true);
  } else {
    cb(new Error("Only video files (MP4, MOV, WebM, MKV) are allowed"), false);
  }
};

const uploadVideo = multer({
  storage,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB limit for video
  },
  fileFilter: videoFilter,
});

module.exports = upload;
module.exports.uploadVideo = uploadVideo;
