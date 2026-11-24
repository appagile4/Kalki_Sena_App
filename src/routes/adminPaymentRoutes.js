const express = require("express");
const router = express.Router();
const {
  getAllPayments,
  getPaymentSummary,
  getPaymentById,
  reverifyPaymentWithEsewa,
} = require("../controllers/adminPaymentController");
const { protect, authorize } = require("../middleware/auth");

// Flexible authorization: verifies Bearer token and role; in development allows access if dev session
const adminAuth = (req, res, next) => {
  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    return protect(req, res, () => authorize("superadmin", "admin")(req, res, next));
  }
  if (process.env.NODE_ENV === "development") {
    return next();
  }
  return res.status(401).json({
    success: false,
    message: "Authorization token required to access Superadmin payment data.",
  });
};

router.use(adminAuth);

// Get aggregated transaction metrics
router.get("/summary", getPaymentSummary);

// Get list of all payments with search & filters
router.get("/", getAllPayments);

// Get individual payment audit trail
router.get("/:id", getPaymentById);

// Trigger on-demand eSewa re-verification
router.post("/:id/re-verify", reverifyPaymentWithEsewa);

module.exports = router;
