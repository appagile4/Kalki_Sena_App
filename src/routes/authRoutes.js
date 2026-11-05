const express = require("express");
const rateLimit = require("express-rate-limit");
const {
  signup,
  login,
  sendOtp,
  resendOtp,
  verifyOtp,
  forgotPassword,
  resetPassword,
  getMe,
  uploadAvatar,
  updateProfile,
  logout,
} = require("../controllers/authController");
const {
  validateSignup,
  validateLogin,
} = require("../middleware/validator");
const { protect } = require("../middleware/auth");
const upload = require("../middleware/upload");

const router = express.Router();

// Middleware to support avatar file from various form-data field names
const handleAvatarFile = (req, res, next) => {
  upload.fields([
    { name: "avatar", maxCount: 1 },
    { name: "image", maxCount: 1 },
    { name: "file", maxCount: 1 },
  ])(req, res, (err) => {
    if (err) {
      return res.status(400).json({ success: false, message: err.message });
    }
    if (req.files) {
      req.file =
        (req.files.avatar && req.files.avatar[0]) ||
        (req.files.image && req.files.image[0]) ||
        (req.files.file && req.files.file[0]) ||
        null;
    }
    next();
  });
};

// Optional protect middleware (attaches user if Bearer token present)
const optionalProtect = async (req, res, next) => {
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    return protect(req, res, next);
  }
  next();
};

// Rate limiter for authentication endpoints (prevent brute-force attacks)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30, // 30 attempts per 15 minutes
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many attempts. Please try again after 15 minutes.",
  },
});

// Stricter rate limiter specifically for sending emails (prevent spam)
const otpLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 10, // 10 OTP requests per 5 minutes per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many OTP requests. Please wait a few minutes before trying again.",
  },
});

// Core Authentication
router.post("/signup", authLimiter, validateSignup, signup);
router.post("/login", authLimiter, validateLogin, login);
router.post("/logout", optionalProtect, logout);
router.get("/me", protect, getMe);

// OTP & Password Reset
router.post("/send-otp", otpLimiter, sendOtp);
router.post("/resend-otp", otpLimiter, resendOtp);
router.post("/verify-otp", authLimiter, verifyOtp);
router.post("/forgot-password", otpLimiter, forgotPassword);
router.post("/reset-password", authLimiter, resetPassword);

// Profile & Avatar (Cloudinary & MongoDB)
router.post("/upload-avatar", optionalProtect, handleAvatarFile, uploadAvatar);
router.put("/avatar", protect, handleAvatarFile, uploadAvatar);
router.put("/profile", protect, updateProfile);

module.exports = router;
