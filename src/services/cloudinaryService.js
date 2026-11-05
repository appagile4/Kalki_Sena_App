const cloudinary = require("../config/cloudinary");

/**
 * Upload an image buffer or base64 data to Cloudinary
 * @param {Buffer|string} fileSource - Buffer from multer or base64 string or remote URL
 * @param {Object} options - Custom Cloudinary options
 * @returns {Promise<{ url: string, publicId: string }>}
 */
const uploadAvatarToCloudinary = async (fileSource, options = {}) => {
  const defaultOptions = {
    folder: "kalki_sena/avatars",
    resource_type: "image",
    transformation: [
      { width: 400, height: 400, crop: "fill", gravity: "face" },
      { quality: "auto" },
      { fetch_format: "auto" },
    ],
    ...options,
  };

  // If fileSource is a Buffer (from multer memoryStorage)
  if (Buffer.isBuffer(fileSource)) {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        defaultOptions,
        (error, result) => {
          if (error) {
            return reject(error);
          }
          resolve({
            url: result.secure_url,
            publicId: result.public_id,
          });
        }
      );
      uploadStream.end(fileSource);
    });
  }

  // If fileSource is a base64 string or URL
  if (typeof fileSource === "string") {
    // If it's a raw base64 string without data URI scheme, prepend it
    let uploadData = fileSource;
    if (
      !fileSource.startsWith("data:") &&
      !fileSource.startsWith("http://") &&
      !fileSource.startsWith("https://")
    ) {
      uploadData = `data:image/jpeg;base64,${fileSource}`;
    }

    const result = await cloudinary.uploader.upload(uploadData, defaultOptions);
    return {
      url: result.secure_url,
      publicId: result.public_id,
    };
  }

  throw new Error("Invalid file source provided for upload");
};

/**
 * Upload a book cover image buffer or base64 data to Cloudinary
 */
const uploadBookCoverToCloudinary = async (fileSource) => {
  return uploadAvatarToCloudinary(fileSource, {
    folder: "kalki_sena/books",
    transformation: [
      { width: 800, height: 1100, crop: "limit" },
      { quality: "auto" },
      { fetch_format: "auto" },
    ],
  });
};

/**
 * Delete an image from Cloudinary by public ID
 */
const deleteAvatarFromCloudinary = async (publicId) => {
  if (!publicId) return;
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (err) {
    console.error("Cloudinary delete error:", err);
  }
};

/**
 * Upload a video buffer or base64 data to Cloudinary
 * @param {Buffer|string} fileSource
 * @param {Object} options
 * @returns {Promise<{ url: string, publicId: string, duration?: number, bytes?: number }>}
 */
const uploadVideoToCloudinary = async (fileSource, options = {}) => {
  const defaultOptions = {
    folder: "kalki_sena/videos",
    resource_type: "video",
    chunk_size: 6000000,
    ...options,
  };

  // If fileSource is a Buffer (from multer memoryStorage)
  if (Buffer.isBuffer(fileSource)) {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        defaultOptions,
        (error, result) => {
          if (error) {
            return reject(error);
          }
          resolve({
            url: result.secure_url,
            publicId: result.public_id,
            duration: result.duration || 0,
            bytes: result.bytes || 0,
            format: result.format,
          });
        }
      );
      uploadStream.end(fileSource);
    });
  }

  // If fileSource is a base64 string or remote URL
  if (typeof fileSource === "string") {
    let uploadData = fileSource;
    if (
      !fileSource.startsWith("data:") &&
      !fileSource.startsWith("http://") &&
      !fileSource.startsWith("https://")
    ) {
      uploadData = `data:video/mp4;base64,${fileSource}`;
    }

    const result = await cloudinary.uploader.upload(uploadData, defaultOptions);
    return {
      url: result.secure_url,
      publicId: result.public_id,
      duration: result.duration || 0,
      bytes: result.bytes || 0,
      format: result.format,
    };
  }

  throw new Error("Invalid video file source provided");
};

/**
 * Delete a video from Cloudinary by public ID
 */
const deleteVideoFromCloudinary = async (publicId) => {
  if (!publicId) return;
  try {
    const res = await cloudinary.uploader.destroy(publicId, {
      resource_type: "video",
    });
    console.log(`[Cloudinary] Previous video deleted: ${publicId}`, res);
    return res;
  } catch (err) {
    console.error(`[Cloudinary] Video delete error (${publicId}):`, err.message);
  }
};

module.exports = {
  uploadAvatarToCloudinary,
  uploadBookCoverToCloudinary,
  deleteAvatarFromCloudinary,
  uploadVideoToCloudinary,
  deleteVideoFromCloudinary,
};
