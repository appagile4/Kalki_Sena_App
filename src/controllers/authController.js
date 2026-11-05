const User = require("../models/User");
const Otp = require("../models/Otp");
const generateOtp = require("../utils/generateOtp");
const { sendOtpEmail } = require("../services/emailService");
const { uploadAvatarToCloudinary } = require("../services/cloudinaryService");
const bcrypt = require("bcryptjs");
const { OAuth2Client } = require("google-auth-library");
const googleClient = new OAuth2Client();

/**
 * @desc    Register a new user
 * @route   POST /api/auth/signup
 * @access  Public
 */
const signup = async (req, res, next) => {
  try {
    const { fullName, email, phone, dob, gender, password, avatar } = req.body;

    // Check if email already registered
    const existingEmail = await User.findOne({ email: email.toLowerCase() });
    if (existingEmail) {
      return res.status(400).json({
        success: false,
        message: "An account with this email address already exists.",
      });
    }

    // Check if phone number already registered
    const existingPhone = await User.findOne({ phone: phone.trim() });
    if (existingPhone) {
      return res.status(400).json({
        success: false,
        message: "An account with this phone number already exists.",
      });
    }

    // Handle avatar upload to Cloudinary if provided
    let avatarUrl = "";
    if (avatar && typeof avatar === "string" && avatar.trim()) {
      const cleanAvatar = avatar.trim();
      if (cleanAvatar.startsWith("http://") || cleanAvatar.startsWith("https://")) {
        avatarUrl = cleanAvatar;
      } else {
        try {
          const uploadRes = await uploadAvatarToCloudinary(cleanAvatar);
          avatarUrl = uploadRes.url;
        } catch (uploadErr) {
          console.warn("[Cloudinary] Upload in signup fallback to direct storage:", uploadErr.message);
          avatarUrl = cleanAvatar;
        }
      }
    }

    // Create user
    const user = await User.create({
      fullName: fullName.trim(),
      email: email.toLowerCase().trim(),
      phone: phone.trim(),
      dob: dob ? dob.trim() : "",
      gender: gender || "Male",
      password,
      avatar: avatarUrl,
    });

    // Generate JWT Token
    const token = user.generateAuthToken();

    res.status(201).json({
      success: true,
      message: "Account created successfully",
      token,
      user,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Authenticate user & get token
 * @route   POST /api/auth/login
 * @access  Public
 */
const login = async (req, res, next) => {
  try {
    const { identifier, password } = req.body;
    const cleanIdentifier = identifier.trim();

    // Check whether identifier is email or phone
    const isEmail = cleanIdentifier.includes("@");

    let query;
    if (isEmail) {
      query = { email: cleanIdentifier.toLowerCase() };
    } else {
      // Allow matching either exact phone or stripped digit variation
      const digitsOnly = cleanIdentifier.replace(/\D/g, "");
      query = {
        $or: [
          { phone: cleanIdentifier },
          { phone: { $regex: digitsOnly + "$", $options: "i" } },
        ],
      };
    }

    // Find user with password selected
    const user = await User.findOne(query).select("+password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Your Email/Phone or Password is incorrect. Please try again!",
      });
    }

    // Verify password
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Your Email/Phone or Password is incorrect. Please try again!",
      });
    }

    // Generate JWT Token
    const token = user.generateAuthToken();

    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Send OTP to user's email
 * @route   POST /api/auth/send-otp
 * @access  Public
 */
const sendOtp = async (req, res, next) => {
  try {
    const { email, type = "signup", name } = req.body;

    if (!email || !email.trim()) {
      return res.status(400).json({
        success: false,
        message: "Email address is required",
      });
    }

    const cleanEmail = email.toLowerCase().trim();

    // If forgot_password, ensure user exists
    let userName = name || "User";
    if (type === "forgot_password") {
      const user = await User.findOne({ email: cleanEmail });
      if (!user) {
        return res.status(404).json({
          success: false,
          message: "No account found with this email address.",
        });
      }
      userName = user.fullName || "User";
    }

    // Generate 5-digit OTP
    const otp = generateOtp();

    // Remove any existing active OTP for this email and type
    await Otp.deleteMany({ email: cleanEmail, type });

    // Store new OTP document (expires in 10 minutes)
    await Otp.create({
      email: cleanEmail,
      otp,
      type,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
    });

    // Send email via Nodemailer
    await sendOtpEmail({
      to: cleanEmail,
      otp,
      type,
      name: userName,
    });

    res.status(200).json({
      success: true,
      message: `Verification code sent to ${cleanEmail}`,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Resend OTP to user's email
 * @route   POST /api/auth/resend-otp
 * @access  Public
 */
const resendOtp = async (req, res, next) => {
  try {
    const { email, type = "resend" } = req.body;

    if (!email || !email.trim()) {
      return res.status(400).json({
        success: false,
        message: "Email address is required",
      });
    }

    const cleanEmail = email.toLowerCase().trim();

    // Look for user to personalize email
    const user = await User.findOne({ email: cleanEmail });
    const userName = user ? user.fullName : "User";

    // Generate 5-digit OTP
    const otp = generateOtp();

    // Replace previous OTPs
    await Otp.deleteMany({ email: cleanEmail });

    // Store new OTP
    await Otp.create({
      email: cleanEmail,
      otp,
      type,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
    });

    // Send email via Nodemailer
    await sendOtpEmail({
      to: cleanEmail,
      otp,
      type: "resend",
      name: userName,
    });

    res.status(200).json({
      success: true,
      message: `A new verification code has been sent to ${cleanEmail}`,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Verify OTP
 * @route   POST /api/auth/verify-otp
 * @access  Public
 */
const verifyOtp = async (req, res, next) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: "Email and OTP code are required",
      });
    }

    const cleanEmail = email.toLowerCase().trim();
    const cleanOtp = String(otp).trim();

    // Find the latest valid OTP document
    const record = await Otp.findOne({
      email: cleanEmail,
      otp: cleanOtp,
      expiresAt: { $gt: new Date() },
    });

    if (!record) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired verification code. Please request a new one.",
      });
    }

    // Mark user as verified if they exist
    const user = await User.findOneAndUpdate(
      { email: cleanEmail },
      { isVerified: true },
      { new: true }
    );

    let token = null;
    if (user) {
      token = user.generateAuthToken();
    }

    res.status(200).json({
      success: true,
      message: "Verification successful!",
      token,
      user,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Forgot Password - Send Reset OTP
 * @route   POST /api/auth/forgot-password
 * @access  Public
 */
const forgotPassword = async (req, res, next) => {
  try {
    const { identifier } = req.body;

    if (!identifier || !identifier.trim()) {
      return res.status(400).json({
        success: false,
        message: "Please enter your email or phone number",
      });
    }

    const cleanId = identifier.trim();
    const isEmail = cleanId.includes("@");

    let query;
    if (isEmail) {
      query = { email: cleanId.toLowerCase() };
    } else {
      const digitsOnly = cleanId.replace(/\D/g, "");
      query = {
        $or: [
          { phone: cleanId },
          { phone: { $regex: digitsOnly + "$", $options: "i" } },
        ],
      };
    }

    const user = await User.findOne(query);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "No account found matching this email or phone number.",
      });
    }

    // Generate 5-digit OTP
    const otp = generateOtp();

    // Replace previous OTPs for this email
    await Otp.deleteMany({ email: user.email });

    // Store new OTP
    await Otp.create({
      email: user.email,
      otp,
      type: "forgot_password",
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
    });

    // Send email with Nodemailer
    await sendOtpEmail({
      to: user.email,
      otp,
      type: "forgot_password",
      name: user.fullName || "User",
    });

    res.status(200).json({
      success: true,
      message: `Password reset code sent to ${user.email}`,
      email: user.email,
      phone: user.phone,
      name: user.fullName,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Reset Password with OTP
 * @route   POST /api/auth/reset-password
 * @access  Public
 */
const resetPassword = async (req, res, next) => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Email, OTP code, and new password are required.",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "New password must be at least 6 characters long.",
      });
    }

    const cleanEmail = email.toLowerCase().trim();
    const cleanOtp = String(otp).trim();

    // Verify OTP
    const record = await Otp.findOne({
      email: cleanEmail,
      otp: cleanOtp,
      expiresAt: { $gt: new Date() },
    });

    if (!record) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired verification code.",
      });
    }

    // Find User
    const user = await User.findOne({ email: cleanEmail }).select("+password");
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    // Remove the OTP after successful use
    await Otp.deleteMany({ email: cleanEmail });

    res.status(200).json({
      success: true,
      message: "Password changed successfully! You can now log in.",
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get current authenticated user profile
 * @route   GET /api/auth/me
 * @access  Private
 */
const getMe = async (req, res) => {
  res.status(200).json({
    success: true,
    user: req.user,
  });
};

/**
 * @desc    Upload profile avatar image to Cloudinary and update MongoDB
 * @route   POST /api/auth/upload-avatar or PUT /api/auth/avatar
 * @access  Public / Private
 */
const uploadAvatar = async (req, res, next) => {
  try {
    let fileSource = null;

    if (req.file && req.file.buffer) {
      fileSource = req.file.buffer;
    } else if (req.body.image || req.body.avatar) {
      fileSource = req.body.image || req.body.avatar;
    }

    if (!fileSource) {
      return res.status(400).json({
        success: false,
        message: "No image file or base64 data provided in request.",
      });
    }

    // Upload image to Cloudinary (with graceful fallback to MongoDB if key lacks create permissions)
    let uploadRes = null;
    let isCloudinarySuccess = false;

    try {
      uploadRes = await uploadAvatarToCloudinary(fileSource);
      isCloudinarySuccess = true;
    } catch (cldErr) {
      console.warn(
        `[Cloudinary] Upload failed (${cldErr.message}). Cloudinary Access Key 178442332451356 lacks 'create' (Upload) permissions in Cloudinary Console.`
      );

      // Graceful Fallback: store base64 directly in MongoDB so profile photo is updated without failing
      let fallbackDataUri = null;
      if (typeof fileSource === "string") {
        fallbackDataUri = fileSource.startsWith("data:")
          ? fileSource
          : `data:image/jpeg;base64,${fileSource}`;
      } else if (Buffer.isBuffer(fileSource)) {
        fallbackDataUri = `data:image/jpeg;base64,${fileSource.toString("base64")}`;
      }

      if (fallbackDataUri) {
        uploadRes = {
          url: fallbackDataUri,
          publicId: `mongo_fallback_${Date.now()}`,
        };
      } else {
        return res.status(403).json({
          success: false,
          message:
            "Cloudinary Access Key lacks 'create' (Upload) permissions. Please enable Write/Create permissions for key 178442332451356 in Cloudinary Console (Settings > Access Keys).",
        });
      }
    }

    let updatedUser = null;
    // If authenticated via Bearer token, automatically update MongoDB user
    if (req.user && req.user._id) {
      updatedUser = await User.findByIdAndUpdate(
        req.user._id,
        { avatar: uploadRes.url },
        { new: true, runValidators: true }
      );
    } else if (req.body.userId || req.body.email) {
      const query = req.body.userId
        ? { _id: req.body.userId }
        : { email: req.body.email.toLowerCase() };
      updatedUser = await User.findOneAndUpdate(
        query,
        { avatar: uploadRes.url },
        { new: true, runValidators: true }
      );
    }

    res.status(200).json({
      success: true,
      message: isCloudinarySuccess
        ? "Avatar uploaded to Cloudinary and saved to MongoDB successfully"
        : "Avatar saved to MongoDB successfully (Enable 'Create' permission in Cloudinary for CDN hosting)",
      avatarUrl: uploadRes.url,
      publicId: uploadRes.publicId,
      user: updatedUser,
    });
  } catch (error) {
    if (error.message && error.message.includes('actions=["create"]')) {
      return res.status(403).json({
        success: false,
        message:
          "Cloudinary Access Key lacks 'create' (Upload) permissions. Please enable Write/Create permissions for key 178442332451356 in Cloudinary Console (Settings > Access Keys).",
      });
    }
    next(error);
  }
};

/**
 * @desc    Update user profile data in MongoDB
 * @route   PUT /api/auth/profile
 * @access  Private
 */
const updateProfile = async (req, res, next) => {
  try {
    const { fullName, phone, dob, gender, avatar } = req.body;
    const updateData = {};

    if (fullName) updateData.fullName = fullName.trim();
    if (phone) updateData.phone = phone.trim();
    if (dob) updateData.dob = dob.trim();
    if (gender) updateData.gender = gender;
    if (avatar) updateData.avatar = avatar.trim();

    const user = await User.findByIdAndUpdate(req.user._id, updateData, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      message: "Profile updated successfully in MongoDB",
      user,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Log out user / clear session
 * @route   POST /api/auth/logout
 * @access  Public / Private
 */
const logout = async (req, res) => {
  res.status(200).json({
    success: true,
    message: "Logged out successfully",
  });
};

/**
 * @desc    Google Sign-In Authentication
 * @route   POST /api/auth/google
 * @access  Public
 */
const googleLogin = async (req, res, next) => {
  try {
    const { idToken, dob, gender } = req.body;

    if (!idToken) {
      return res.status(400).json({
        success: false,
        message: "Google ID Token is required",
      });
    }

    // Verify Google ID Token with Google OAuth2Client
    let ticket;
    try {
      const allowedAudiences = [
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_WEB_CLIENT_ID,
        process.env.GOOGLE_IOS_CLIENT_ID,
        "284669757325-8i1iivlfkge4s3itcmu4b27qr5iu9b10.apps.googleusercontent.com",
        "284669757325-c1vm3h23si9e9hk7ued21o3020tbtt8p.apps.googleusercontent.com",
        "284669757325-vr2oqodqkpk2tpb0u46nvb09plbriuq5.apps.googleusercontent.com",
      ].filter(Boolean);

      ticket = await googleClient.verifyIdToken({
        idToken,
        audience: allowedAudiences,
      });
    } catch (verifyError) {
      console.error("[Google Auth] ID Token verification failed:", verifyError.message);
      return res.status(401).json({
        success: false,
        message: "Invalid or expired Google authentication token. Please try again.",
      });
    }

    const payload = ticket.getPayload();
    if (!payload) {
      return res.status(401).json({
        success: false,
        message: "Unable to retrieve Google user information",
      });
    }

    const { sub: googleId, email, name, picture, email_verified } = payload;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Google account does not have an associated email address",
      });
    }

    if (!email_verified) {
      return res.status(400).json({
        success: false,
        message: "Google email address is not verified. Please verify your email with Google.",
      });
    }

    const cleanEmail = email.toLowerCase().trim();

    // 1. Check if user exists by stable googleId
    let user = await User.findOne({ googleId });

    if (user) {
      // Check if account is suspended / blocked
      if (user.isBlocked) {
        return res.status(403).json({
          success: false,
          message: "Your account has been suspended or blocked. Please contact support.",
        });
      }

      // Update avatar or name if missing
      let modified = false;
      if (!user.avatar && picture) {
        user.avatar = picture;
        modified = true;
      }
      if (!user.fullName && name) {
        user.fullName = name;
        modified = true;
      }
      if (!user.dob && dob) {
        user.dob = dob;
        modified = true;
      }
      if ((!user.gender || user.gender === "Male") && gender) {
        user.gender = gender;
        modified = true;
      }
      if (modified) {
        await user.save();
      }
    } else {
      // 2. Check if user exists with the same email (Secure Account Linking)
      user = await User.findOne({ email: cleanEmail });

      if (user) {
        if (user.isBlocked) {
          return res.status(403).json({
            success: false,
            message: "Your account has been suspended or blocked. Please contact support.",
          });
        }

        // Link Google ID to existing account securely (Google proved email ownership)
        user.googleId = googleId;
        user.isVerified = true;
        if (!user.avatar && picture) {
          user.avatar = picture;
        }
        if (!user.dob && dob) {
          user.dob = dob;
        }
        if ((!user.gender || user.gender === "Male") && gender) {
          user.gender = gender;
        }
        await user.save();
      } else {
        // 3. New User Registration via Google
        user = await User.create({
          fullName: name || "Google User",
          email: cleanEmail,
          googleId,
          authProvider: "google",
          avatar: picture || "",
          dob: dob || "",
          gender: gender || "Male",
          role: "user",
          isVerified: true,
          hasPassword: false,
        });
      }
    }

    // Generate Application JWT Token
    const token = user.generateAuthToken();

    res.status(200).json({
      success: true,
      message: "Google login successful",
      token,
      user,
      data: {
        user,
        accessToken: token,
        token,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Set password (for Google OAuth users or users without password) & optionally update DOB/Gender
 * @route   POST /api/auth/set-password
 * @access  Private (JWT protected)
 */
const setPassword = async (req, res, next) => {
  try {
    const { password, dob, gender } = req.body;

    if (!password || typeof password !== "string" || password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password is required and must be at least 6 characters long",
      });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Assign new password (pre-save hook will hash it and set hasPassword = true)
    user.password = password;
    user.hasPassword = true;

    if (dob && typeof dob === "string" && dob.trim()) {
      user.dob = dob.trim();
    }

    if (gender && ["Male", "Female", "Other"].includes(gender)) {
      user.gender = gender;
    }

    await user.save();

    // Fetch sanitized user object without password
    const updatedUser = await User.findById(req.user._id);

    res.status(200).json({
      success: true,
      message: "Password and profile updated successfully",
      user: updatedUser,
      data: {
        user: updatedUser,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  signup,
  login,
  googleLogin,
  setPassword,
  sendOtp,
  resendOtp,
  verifyOtp,
  forgotPassword,
  resetPassword,
  getMe,
  uploadAvatar,
  updateProfile,
  logout,
};
