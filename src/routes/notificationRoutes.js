const express = require("express");
const router = express.Router();
const {
  registerToken,
  deregisterToken,
  getMyNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  createBroadcast,
  getBroadcastHistory,
  getNotificationStats,
} = require("../controllers/notificationController");
const { protect, authorize } = require("../middleware/auth");

// Client device token registration
router.post("/register-token", protect, registerToken);
router.post("/deregister-token", protect, deregisterToken);

// User notification center
router.get("/my-notifications", protect, getMyNotifications);
router.patch("/mark-all-read", protect, markAllAsRead);
router.patch("/:id/read", protect, markAsRead);
router.delete("/:id", protect, deleteNotification);

// Admin & Superadmin Broadcast endpoints
router.post(
  "/broadcast",
  protect,
  authorize("superadmin", "admin"),
  createBroadcast
);
router.get(
  "/broadcast/history",
  protect,
  authorize("superadmin", "admin"),
  getBroadcastHistory
);
router.get(
  "/stats",
  protect,
  authorize("superadmin", "admin"),
  getNotificationStats
);

module.exports = router;
