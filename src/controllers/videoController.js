const Book = require("../models/Book");
const {
  uploadVideoToCloudinary,
  deleteVideoFromCloudinary,
  uploadAvatarToCloudinary,
  deleteAvatarFromCloudinary,
} = require("../services/cloudinaryService");

// Default video values
const DEFAULT_VIDEO = {
  title: "Message from MR.666",
  videoUrl:
    "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
  videoPublicId: "",
  thumbnailUrl:
    "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=600&auto=format&fit=crop&q=80",
  thumbnailPublicId: "",
  description:
    "A visionary message from founder Jay Sah (MR. 666) regarding the youth economic revolution and free education mission.",
  duration: 0,
  bytes: 0,
};

/**
 * @route   GET /api/videos/promo
 * @desc    Get current promotional video & thumbnail
 * @access  Public
 */
exports.getPromoVideo = async (req, res, next) => {
  try {
    let book = await Book.findOne();
    if (!book) {
      return res.status(200).json({
        success: true,
        data: DEFAULT_VIDEO,
      });
    }

    const videoData =
      book.promoVideo && book.promoVideo.videoUrl
        ? book.promoVideo
        : DEFAULT_VIDEO;

    res.status(200).json({
      success: true,
      data: videoData,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/videos/upload
 * @desc    Upload video to Cloudinary; automatically deletes previous video from Cloudinary
 * @access  Public / Superadmin
 */
exports.uploadPromoVideo = async (req, res, next) => {
  try {
    if (!req.file && !req.body.video) {
      return res.status(400).json({
        success: false,
        message: "Please upload a video file or provide a video data payload",
      });
    }

    let book = await Book.findOne();
    if (!book) {
      book = await Book.create({
        title: "Economic Revolution to make Nepal A World Leader",
        author: "Jay Sah (MR. 666)",
        price: 1000,
        promoVideo: DEFAULT_VIDEO,
      });
    }

    // 1. Delete previous video from Cloudinary if existing public ID exists
    const previousPublicId = book.promoVideo?.videoPublicId;
    if (previousPublicId) {
      console.log(`[Cloudinary] Deleting previous video: ${previousPublicId}`);
      try {
        await deleteVideoFromCloudinary(previousPublicId);
      } catch (delErr) {
        console.warn(`[Cloudinary] Failed to delete previous video:`, delErr.message);
      }
    }

    // 2. Upload new video to Cloudinary
    let uploadResult;
    if (req.file) {
      uploadResult = await uploadVideoToCloudinary(req.file.buffer, {
        folder: "kalki_sena/videos",
      });
    } else {
      uploadResult = await uploadVideoToCloudinary(req.body.video, {
        folder: "kalki_sena/videos",
      });
    }

    // 3. Update database with new video details
    if (!book.promoVideo) {
      book.promoVideo = { ...DEFAULT_VIDEO };
    }

    book.promoVideo.videoUrl = uploadResult.url;
    book.promoVideo.videoPublicId = uploadResult.publicId;
    book.promoVideo.duration = uploadResult.duration || 0;
    book.promoVideo.bytes = uploadResult.bytes || 0;
    book.promoVideo.updatedAt = new Date();

    if (req.body.title) {
      book.promoVideo.title = req.body.title;
    }
    if (req.body.description) {
      book.promoVideo.description = req.body.description;
    }

    await book.save();

    res.status(200).json({
      success: true,
      message: previousPublicId
        ? "New video uploaded to Cloudinary; previous video was automatically deleted."
        : "Video uploaded to Cloudinary successfully.",
      data: book.promoVideo,
    });
  } catch (error) {
    console.error("[uploadPromoVideo Error]:", error);
    next(error);
  }
};

/**
 * @route   POST /api/videos/thumbnail
 * @desc    Upload video thumbnail to Cloudinary; deletes previous thumbnail
 * @access  Public / Superadmin
 */
exports.uploadPromoThumbnail = async (req, res, next) => {
  try {
    if (!req.file && !req.body.image) {
      return res.status(400).json({
        success: false,
        message: "Please upload an image file or provide an image payload",
      });
    }

    let book = await Book.findOne();
    if (!book) {
      book = await Book.create({
        title: "Economic Revolution to make Nepal A World Leader",
        author: "Jay Sah (MR. 666)",
        price: 1000,
        promoVideo: DEFAULT_VIDEO,
      });
    }

    // Delete previous thumbnail from Cloudinary if it exists
    const prevThumbnailPublicId = book.promoVideo?.thumbnailPublicId;
    if (prevThumbnailPublicId) {
      try {
        await deleteAvatarFromCloudinary(prevThumbnailPublicId);
      } catch (err) {
        console.warn("[Cloudinary] Failed to delete old thumbnail:", err.message);
      }
    }

    // Upload new thumbnail
    const fileSource = req.file ? req.file.buffer : req.body.image;
    const uploadResult = await uploadAvatarToCloudinary(fileSource, {
      folder: "kalki_sena/videos/thumbnails",
      transformation: [
        { width: 800, height: 450, crop: "fill" },
        { quality: "auto" },
        { fetch_format: "auto" },
      ],
    });

    if (!book.promoVideo) {
      book.promoVideo = { ...DEFAULT_VIDEO };
    }

    book.promoVideo.thumbnailUrl = uploadResult.url;
    book.promoVideo.thumbnailPublicId = uploadResult.publicId;
    book.promoVideo.updatedAt = new Date();

    await book.save();

    res.status(200).json({
      success: true,
      message: "Thumbnail uploaded to Cloudinary successfully",
      thumbnailUrl: uploadResult.url,
      data: book.promoVideo,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PUT /api/videos/promo
 * @desc    Update video title and description
 * @access  Public / Superadmin
 */
exports.updatePromoVideoDetails = async (req, res, next) => {
  try {
    const { title, description, videoUrl, thumbnailUrl } = req.body;

    let book = await Book.findOne();
    if (!book) {
      book = await Book.create({
        title: "Economic Revolution to make Nepal A World Leader",
        author: "Jay Sah (MR. 666)",
        price: 1000,
        promoVideo: {
          ...DEFAULT_VIDEO,
          title: title || DEFAULT_VIDEO.title,
          description: description || DEFAULT_VIDEO.description,
        },
      });
    } else {
      if (!book.promoVideo) {
        book.promoVideo = { ...DEFAULT_VIDEO };
      }
      if (title) book.promoVideo.title = title;
      if (description) book.promoVideo.description = description;
      if (videoUrl) book.promoVideo.videoUrl = videoUrl;
      if (thumbnailUrl) book.promoVideo.thumbnailUrl = thumbnailUrl;
      book.promoVideo.updatedAt = new Date();
      await book.save();
    }

    res.status(200).json({
      success: true,
      message: "Video details updated successfully",
      data: book.promoVideo,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   DELETE /api/videos/promo
 * @desc    Delete current video from Cloudinary and reset
 * @access  Superadmin
 */
exports.deletePromoVideo = async (req, res, next) => {
  try {
    let book = await Book.findOne();
    if (book && book.promoVideo?.videoPublicId) {
      await deleteVideoFromCloudinary(book.promoVideo.videoPublicId);
    }
    if (book && book.promoVideo?.thumbnailPublicId) {
      await deleteAvatarFromCloudinary(book.promoVideo.thumbnailPublicId);
    }

    if (book) {
      book.promoVideo = { ...DEFAULT_VIDEO };
      await book.save();
    }

    res.status(200).json({
      success: true,
      message: "Video deleted from Cloudinary and reset to default",
      data: DEFAULT_VIDEO,
    });
  } catch (error) {
    next(error);
  }
};
