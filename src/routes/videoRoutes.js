const express = require("express");
const router = express.Router();
const {
  getPromoVideo,
  uploadPromoVideo,
  uploadPromoThumbnail,
  updatePromoVideoDetails,
  deletePromoVideo,
} = require("../controllers/videoController");
const upload = require("../middleware/upload");
const { uploadVideo } = require("../middleware/upload");

// Public / Fetch video
router.get("/promo", getPromoVideo);

// Video Upload (Single video file up to 100MB)
// Automatically deletes previous Cloudinary video
router.post("/upload", uploadVideo.single("video"), uploadPromoVideo);

// Video Thumbnail Upload
router.post("/thumbnail", upload.single("thumbnail"), uploadPromoThumbnail);

// Update Video Metadata (title, description, urls)
router.put("/promo", updatePromoVideoDetails);

// Delete Video from Cloudinary
router.delete("/promo", deletePromoVideo);

module.exports = router;
