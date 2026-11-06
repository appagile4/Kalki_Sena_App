const express = require("express");
const router = express.Router();
const driverController = require("../controllers/driverController");
const upload = require("../middleware/upload");
const { protect } = require("../middleware/auth");

// Public / Mobile Applicant routes
router.post("/apply", driverController.submitApplication);
router.get("/my-status", driverController.getMyStatus);
router.post(
  "/upload-document",
  upload.single("file"),
  driverController.uploadDocument
);

// Admin review & listing routes
router.get("/admin/applications", driverController.getAllApplications);
router.get("/admin/stats", driverController.getStats);
router.patch("/admin/:id/approve", driverController.approveApplication);
router.patch("/admin/:id/reject", driverController.rejectApplication);

module.exports = router;
