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

// Client device token registration (Both route conventions supported)
router.post("/register-token", protect, registerToken);
router.post("/devices/register", protect, registerToken);
router.post("/deregister-token", protect, deregisterToken);
router.post("/devices/unregister", protect, deregisterToken);

// User notification center (Both route conventions supported)
router.get("/my-notifications", protect, getMyNotifications);
router.get("/my", protect, getMyNotifications);
router.get("/", protect, getMyNotifications);
router.patch("/mark-all-read", protect, markAllAsRead);
router.patch("/read-all", protect, markAllAsRead);
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
