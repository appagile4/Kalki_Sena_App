const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || "x8vpeeyg",
  api_key: process.env.CLOUDINARY_API_KEY || "178442332451356",
  api_secret: process.env.CLOUDINARY_API_SECRET || "y8D-UR3xBoXGPPNhg0LAINn_m50",
  secure: true,
});

module.exports = cloudinary;
