const DeviceToken = require("../models/DeviceToken");
const Notification = require("../models/Notification");
const BroadcastNotification = require("../models/BroadcastNotification");
const User = require("../models/User");
const pushService = require("../services/pushNotificationService");

// 1. POST /api/notifications/register-token
exports.registerToken = async (req, res, next) => {
  try {
    const token = req.body.token || req.body.pushToken || req.body.expoPushToken;
    const { platform, deviceId, deviceName, appVersion } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: "Device push token is required",
      });
    }

    if (!pushService.isValidExpoPushToken(token)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Expo push token format",
      });
    }

    // Upsert token in DeviceToken collection
    const updated = await DeviceToken.findOneAndUpdate(
      { token },
      {
        user: req.user._id,
        token,
        expoPushToken: token,
        platform: platform || "unknown",
        deviceId: deviceId || "",
        deviceName: deviceName || "",
        appVersion: appVersion || "",
        isActive: true,
        lastActiveAt: new Date(),
        lastUsedAt: new Date(),
      },
      { upsert: true, returnDocument: "after", setDefaultsOnInsert: true }
    );

    res.status(200).json({
      success: true,
      message: "Device token registered successfully",
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};

// 2. POST /api/notifications/deregister-token (e.g. On Logout)
exports.deregisterToken = async (req, res, next) => {
  try {
    const token = req.body.token || req.body.pushToken || req.body.expoPushToken;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: "Device token is required",
      });
    }

    await DeviceToken.updateMany(
      {
        $or: [{ token }, { expoPushToken: token }],
        user: req.user._id,
      },
      { isActive: false }
    );

    res.status(200).json({
      success: true,
      message: "Device token deregistered successfully",
    });
  } catch (error) {
    next(error);
  }
};

// 3. GET /api/notifications/my-notifications
exports.getMyNotifications = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 30;
    const skip = (page - 1) * limit;

    const userFilter = {
      $or: [{ recipient: req.user._id }, { user: req.user._id }],
    };

    const [notifications, total, unreadCount] = await Promise.all([
      Notification.find(userFilter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Notification.countDocuments(userFilter),
      Notification.countDocuments({ ...userFilter, isRead: false }),
    ]);

    res.status(200).json({
      success: true,
      data: notifications,
      unreadCount,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

// 4. PATCH /api/notifications/:id/read
exports.markAsRead = async (req, res, next) => {
  try {
    const userFilter = {
      _id: req.params.id,
      $or: [{ recipient: req.user._id }, { user: req.user._id }],
    };

    const notification = await Notification.findOneAndUpdate(
      userFilter,
      { isRead: true, readAt: new Date() },
      { returnDocument: "after" }
    );

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found",
      });
    }

    const unreadCount = await Notification.countDocuments({
      $or: [{ recipient: req.user._id }, { user: req.user._id }],
      isRead: false,
    });

    res.status(200).json({
      success: true,
      message: "Notification marked as read",
      data: notification,
      unreadCount,
    });
  } catch (error) {
    next(error);
  }
};

// 5. PATCH /api/notifications/mark-all-read
exports.markAllAsRead = async (req, res, next) => {
  try {
    await Notification.updateMany(
      {
        $or: [{ recipient: req.user._id }, { user: req.user._id }],
        isRead: false,
      },
      { isRead: true, readAt: new Date() }
    );

    res.status(200).json({
      success: true,
      message: "All notifications marked as read",
      unreadCount: 0,
    });
  } catch (error) {
    next(error);
  }
};

// 6. DELETE /api/notifications/:id
exports.deleteNotification = async (req, res, next) => {
  try {
    const notification = await Notification.findOneAndDelete({
      _id: req.params.id,
      $or: [{ recipient: req.user._id }, { user: req.user._id }],
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found",
      });
    }

    const unreadCount = await Notification.countDocuments({
      $or: [{ recipient: req.user._id }, { user: req.user._id }],
      isRead: false,
    });

    res.status(200).json({
      success: true,
      message: "Notification deleted successfully",
      unreadCount,
    });
  } catch (error) {
    next(error);
  }
};

// 7. POST /api/notifications/broadcast (Admin / Superadmin only)
exports.createBroadcast = async (req, res, next) => {
  try {
    const {
      title,
      body,
      targetAudience,
      targetUser,
      targetEmail,
      screen,
      data,
      priority,
      sound,
      scheduledAt,
    } = req.body;

    if (!title || !body) {
      return res.status(400).json({
        success: false,
        message: "Notification title and body are required",
      });
    }

    const broadcast = await pushService.sendBroadcast({
      title,
      body,
      targetAudience: targetAudience || "all",
      targetUser,
      targetEmail,
      screen: screen || "Home",
      data: data || {},
      priority: priority || "high",
      sound: sound || "default",
      senderId: req.user._id,
      scheduledAt,
    });

    res.status(201).json({
      success: true,
      message: "Broadcast notification sent successfully",
      data: broadcast,
    });
  } catch (error) {
    next(error);
  }
};

// 8. GET /api/notifications/broadcast/history (Admin / Superadmin only)
exports.getBroadcastHistory = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const [broadcasts, total] = await Promise.all([
      BroadcastNotification.find()
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("sender", "fullName email role")
        .populate("targetUser", "fullName email"),
      BroadcastNotification.countDocuments(),
    ]);

    res.status(200).json({
      success: true,
      data: broadcasts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

// 9. GET /api/notifications/stats (Admin / Superadmin only)
exports.getNotificationStats = async (req, res, next) => {
  try {
    const [
      totalDevices,
      activeDevices,
      androidDevices,
      iosDevices,
      totalBroadcasts,
      totalInAppNotifications,
    ] = await Promise.all([
      DeviceToken.countDocuments(),
      DeviceToken.countDocuments({ isActive: true }),
      DeviceToken.countDocuments({ platform: "android", isActive: true }),
      DeviceToken.countDocuments({ platform: "ios", isActive: true }),
      BroadcastNotification.countDocuments(),
      Notification.countDocuments(),
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalDevices,
        activeDevices,
        androidDevices,
        iosDevices,
        totalBroadcasts,
        totalInAppNotifications,
      },
    });
  } catch (error) {
    next(error);
  }
};
