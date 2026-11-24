const express = require("express");
const router = express.Router();
const {
  initiateEsewaPayment,
  renderEsewaGatewayForm,
  verifyEsewaPayment,
  getOrderPaymentStatus,
  handleEsewaSuccessCallback,
  handleEsewaFailureCallback,
} = require("../controllers/paymentController");
const { protect } = require("../middleware/auth");

// Direct redirect to official eSewa booking URL
router.get("/esewa/pay-gateway/:transactionUuid", renderEsewaGatewayForm);

// Callbacks from eSewa web portal
router.all("/esewa/callback/success", handleEsewaSuccessCallback);
router.all("/esewa/callback/failure", handleEsewaFailureCallback);

// Initiate eSewa payment (returns HMAC-SHA256 signature and transaction UUID)
router.post("/esewa/initiate", protect, initiateEsewaPayment);

// Verify payment independently with eSewa servers
router.post("/esewa/verify", protect, verifyEsewaPayment);

// Check order payment status
router.get("/orders/:orderId/status", protect, getOrderPaymentStatus);

module.exports = router;
