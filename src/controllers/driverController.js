const DriverApplication = require("../models/DriverApplication");
const User = require("../models/User");
const {
  uploadDriverDocToCloudinary,
} = require("../services/cloudinaryService");

// Optional auth helper: extracts user from Bearer token if present
const extractUserIfAvailable = async (req) => {
  const jwt = require("jsonwebtoken");
  try {
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      const token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      if (decoded && decoded.id) {
        return await User.findById(decoded.id);
      }
    }
  } catch {
    // token invalid or missing, proceed unauthenticated
  }
  return null;
};

/**
 * Submit or update driver application
 * POST /api/driver/apply
 */
exports.submitApplication = async (req, res) => {
  try {
    const user = req.user || (await extractUserIfAvailable(req));

    const {
      fullName,
      email,
      phone,
      dob,
      gender,
      memberId,
      rideCity,
      vehicleType,
      vehicleMake,
      vehicleModel,
      manufactureYear,
      vehicleColor,
      seatCount,
      licensePlate,
      documents,
    } = req.body;

    const applicantEmail = (email || user?.email || "").toLowerCase().trim();
    if (!applicantEmail) {
      return res.status(400).json({
        success: false,
        message: "Email is required to submit a driver application.",
      });
    }

    // Basic required field validations
    if (!dob || !rideCity || !vehicleMake || !vehicleModel || !licensePlate) {
      return res.status(400).json({
        success: false,
        message:
          "Please provide all required vehicle and personal details to proceed.",
      });
    }

    // Check existing application
    let query = { email: applicantEmail };
    if (user?._id) {
      query = { $or: [{ userId: user._id }, { email: applicantEmail }] };
    }

    let application = await DriverApplication.findOne(query);

    if (application && application.status === "approved") {
      return res.status(400).json({
        success: false,
        message:
          "You already have an approved driver application. You are an active Kalki Sena driver partner.",
        data: application,
      });
    }

    const applicantName =
      fullName ||
      user?.fullName ||
      application?.fullName ||
      applicantEmail.split("@")[0] ||
      "driver";

    // Process all documents: if base64 or remote, upload to Cloudinary in applicant's separate folder
    const processedDocs = {};
    const docKeys = [
      "licenseFront",
      "licenseBack",
      "rcUploaded",
      "insuranceUploaded",
      "citizenshipFront",
      "citizenshipBack",
      "plateFront",
      "plateBack",
    ];

    if (documents && typeof documents === "object") {
      for (const key of docKeys) {
        const val = documents[key];
        if (val && typeof val === "string") {
          if (val.startsWith("http://") || val.startsWith("https://")) {
            // Already uploaded Cloudinary URL
            processedDocs[key] = val;
          } else if (val.startsWith("data:image") || val.length > 200) {
            try {
              const uploaded = await uploadDriverDocToCloudinary(
                val,
                applicantName,
                key
              );
              processedDocs[key] = uploaded.url;
            } catch (upErr) {
              console.warn(
                `[DriverController] Upload ${key} failed, saving as-is:`,
                upErr.message
              );
              processedDocs[key] = val;
            }
          } else {
            processedDocs[key] = val;
          }
        } else {
          processedDocs[key] = "";
        }
      }
    }

    const payload = {
      userId: user?._id || application?.userId,
      fullName: applicantName,
      email: applicantEmail,
      phone: phone || user?.phone || application?.phone || "",
      dob: dob.trim(),
      gender: gender || "Male",
      memberId: (memberId || "").trim(),
      rideCity: rideCity.trim(),
      vehicle: {
        vehicleType: vehicleType || "Car",
        make: vehicleMake.trim(),
        model: vehicleModel.trim(),
        manufactureYear: manufactureYear ? String(manufactureYear).trim() : "2022",
        color: vehicleColor ? vehicleColor.trim() : "White",
        seatCount: Number(seatCount) || 4,
        licensePlate: licensePlate.trim().toUpperCase(),
      },
      documents: {
        licenseFront: processedDocs.licenseFront || documents?.licenseFront || "",
        licenseBack: processedDocs.licenseBack || documents?.licenseBack || "",
        rcUploaded: processedDocs.rcUploaded || documents?.rcUploaded || "",
        insuranceUploaded: processedDocs.insuranceUploaded || documents?.insuranceUploaded || "",
        citizenshipFront: processedDocs.citizenshipFront || documents?.citizenshipFront || "",
        citizenshipBack: processedDocs.citizenshipBack || documents?.citizenshipBack || "",
        plateFront: processedDocs.plateFront || documents?.plateFront || "",
        plateBack: processedDocs.plateBack || documents?.plateBack || "",
      },
      status: "pending", // Reset to pending upon new submission
      rejectionReason: "",
      reviewedAt: null,
    };

    if (application) {
      Object.assign(application, payload);
      await application.save();
    } else {
      application = await DriverApplication.create(payload);
    }

    return res.status(201).json({
      success: true,
      message:
        "Your driver application has been successfully submitted and is under review.",
      data: application,
    });
  } catch (error) {
    console.error("[DriverController] submitApplication error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to submit driver application.",
    });
  }
};

/**
 * Check current user application status
 * GET /api/driver/my-status
 */
exports.getMyStatus = async (req, res) => {
  try {
    const user = req.user || (await extractUserIfAvailable(req));
    const emailParam = (req.query.email || "").toLowerCase().trim();

    if (!user && !emailParam) {
      return res.status(200).json({
        success: true,
        hasApplication: false,
        data: null,
      });
    }

    const conditions = [];
    if (user?._id) conditions.push({ userId: user._id });
    if (user?.email) conditions.push({ email: user.email.toLowerCase() });
    if (emailParam) conditions.push({ email: emailParam });

    const application = await DriverApplication.findOne({
      $or: conditions,
    }).sort({ updatedAt: -1 });

    if (!application) {
      return res.status(200).json({
        success: true,
        hasApplication: false,
        data: null,
      });
    }

    return res.status(200).json({
      success: true,
      hasApplication: true,
      data: application,
    });
  } catch (error) {
    console.error("[DriverController] getMyStatus error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch driver application status.",
    });
  }
};

/**
 * Admin: Get all driver applications
 * GET /api/driver/admin/applications
 */
exports.getAllApplications = async (req, res) => {
  try {
    const { status, search } = req.query;

    const filter = {};
    if (status && status !== "all") {
      filter.status = status;
    }

    if (search && search.trim()) {
      const regex = new RegExp(search.trim(), "i");
      filter.$or = [
        { fullName: regex },
        { email: regex },
        { phone: regex },
        { rideCity: regex },
        { "vehicle.licensePlate": regex },
        { "vehicle.make": regex },
        { "vehicle.model": regex },
      ];
    }

    const applications = await DriverApplication.find(filter)
      .sort({ createdAt: -1 })
      .populate("userId", "fullName email phone role avatar");

    const counts = {
      total: await DriverApplication.countDocuments(),
      pending: await DriverApplication.countDocuments({ status: "pending" }),
      approved: await DriverApplication.countDocuments({ status: "approved" }),
      rejected: await DriverApplication.countDocuments({ status: "rejected" }),
    };

    return res.status(200).json({
      success: true,
      count: applications.length,
      stats: counts,
      data: applications,
    });
  } catch (error) {
    console.error("[DriverController] getAllApplications error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to retrieve driver applications.",
    });
  }
};

/**
 * Admin: Approve driver application
 * PATCH /api/driver/admin/:id/approve
 */
exports.approveApplication = async (req, res) => {
  try {
    const { id } = req.params;
    const application = await DriverApplication.findById(id);

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Driver application not found.",
      });
    }

    application.status = "approved";
    application.reviewedAt = new Date();
    application.rejectionReason = "";
    if (req.user?._id) {
      application.reviewedBy = req.user._id;
    }
    await application.save();

    // Upgrade linked user role to driver
    if (application.userId) {
      await User.findByIdAndUpdate(application.userId, { role: "driver" });
    } else if (application.email) {
      await User.findOneAndUpdate(
        { email: application.email },
        { role: "driver" }
      );
    }

    return res.status(200).json({
      success: true,
      message: `Driver application for ${application.fullName} approved successfully. User role upgraded to Driver.`,
      data: application,
    });
  } catch (error) {
    console.error("[DriverController] approveApplication error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to approve driver application.",
    });
  }
};

/**
 * Admin: Reject driver application
 * PATCH /api/driver/admin/:id/reject
 */
exports.rejectApplication = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const application = await DriverApplication.findById(id);

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Driver application not found.",
      });
    }

    application.status = "rejected";
    application.rejectionReason =
      reason || "Documents provided did not meet verification criteria.";
    application.reviewedAt = new Date();
    if (req.user?._id) {
      application.reviewedBy = req.user._id;
    }
    await application.save();

    return res.status(200).json({
      success: true,
      message: `Driver application for ${application.fullName} has been rejected.`,
      data: application,
    });
  } catch (error) {
    console.error("[DriverController] rejectApplication error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to reject driver application.",
    });
  }
};

/**
 * Admin: Driver Application Stats
 * GET /api/driver/admin/stats
 */
exports.getStats = async (req, res) => {
  try {
    const counts = {
      total: await DriverApplication.countDocuments(),
      pending: await DriverApplication.countDocuments({ status: "pending" }),
      approved: await DriverApplication.countDocuments({ status: "approved" }),
      rejected: await DriverApplication.countDocuments({ status: "rejected" }),
    };

    return res.status(200).json({
      success: true,
      data: counts,
    });
  } catch (error) {
    console.error("[DriverController] getStats error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch driver stats.",
    });
  }
};

/**
 * Upload single driver document to Cloudinary in applicant's separate folder
 * POST /api/driver/upload-document
 */
exports.uploadDocument = async (req, res) => {
  try {
    const { image, docType, applicantName } = req.body;
    let fileSource = image;

    if (req.file) {
      fileSource = req.file.buffer;
    }

    if (!fileSource) {
      return res.status(400).json({
        success: false,
        message: "No image file or base64 data provided for upload.",
      });
    }

    const folderName =
      applicantName || req.user?.fullName || req.user?.email || "applicant";

    const result = await uploadDriverDocToCloudinary(
      fileSource,
      folderName,
      docType || "document"
    );

    return res.status(200).json({
      success: true,
      message: "Document uploaded to Cloudinary successfully",
      url: result.url,
      publicId: result.publicId,
    });
  } catch (error) {
    console.error("[DriverController] uploadDocument error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to upload document to Cloudinary",
    });
  }
};
