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

module.exports = {
  uploadAvatarToCloudinary,
  deleteAvatarFromCloudinary,
};
