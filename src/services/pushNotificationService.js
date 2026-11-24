const { Expo } = require("expo-server-sdk");
const DeviceToken = require("../models/DeviceToken");
const Notification = require("../models/Notification");
const BroadcastNotification = require("../models/BroadcastNotification");
const User = require("../models/User");

// Initialize Expo Push SDK Client
const expo = new Expo();

/**
 * Validate whether a token is a valid Expo push token
 */
const isValidExpoPushToken = (token) => {
  return Boolean(token && Expo.isExpoPushToken(token));
};

/**
 * Send raw push notifications via Expo Push API with chunking and token deactivation
 */
const sendRawExpoPush = async (messages) => {
  if (!messages || messages.length === 0) {
    return { successCount: 0, failureCount: 0, tickets: [] };
  }

  const chunks = expo.chunkPushNotifications(messages);
  const tickets = [];
  let successCount = 0;
  let failureCount = 0;
  const invalidTokens = [];

  for (const chunk of chunks) {
    try {
      const ticketChunk = await expo.sendPushNotificationsAsync(chunk);
      tickets.push(...ticketChunk);

      for (let i = 0; i < ticketChunk.length; i++) {
        const ticket = ticketChunk[i];
        const token = chunk[i]?.to;

        if (ticket.status === "ok") {
          successCount++;
        } else if (ticket.status === "error") {
          failureCount++;
          console.warn(`[PushNotification] Push ticket error for ${token}: ${ticket.message}`);

          // If device is not registered or credentials invalid, mark token inactive
          if (
            ticket.details?.error === "DeviceNotRegistered" ||
            ticket.details?.error === "InvalidCredentials"
          ) {
            invalidTokens.push(token);
          }
        }
      }
    } catch (error) {
      console.error("[PushNotification] Error sending push chunk:", error.message);
      failureCount += chunk.length;
    }
  }

  // Deactivate any invalid/expired tokens asynchronously
  if (invalidTokens.length > 0) {
    DeviceToken.updateMany(
      { token: { $in: invalidTokens } },
      { isActive: false }
    ).catch((err) =>
      console.error("[PushNotification] Failed to deactivate invalid tokens:", err.message)
    );
  }

  return { successCount, failureCount, tickets };
};

/**
 * Send a notification to an individual user (saves in DB and delivers to their devices)
 */
const sendToUser = async (userId, { title, body, type = "SYSTEM", data = {}, priority = "high", sound = "default", channelId = "default" }) => {
  try {
    if (!userId) return null;

    // 1. Create in-app Notification record
    const notification = await Notification.create({
      recipient: userId,
      title,
      body,
      type,
      data,
      deliveryStatus: "pending",
    });

    // 2. Query active tokens for this user
    const tokens = await DeviceToken.find({ user: userId, isActive: true });
    if (!tokens || tokens.length === 0) {
      notification.deliveryStatus = "sent";
      await notification.save();
      return notification;
    }

    // 3. Construct Expo push messages
    const validMessages = [];
    for (const record of tokens) {
      if (isValidExpoPushToken(record.token)) {
        validMessages.push({
          to: record.token,
          sound: sound || "default",
          title,
          body,
          priority: priority === "high" ? "high" : "default",
          channelId: channelId || (type.startsWith("ORDER") ? "orders" : "default"),
          data: {
            ...data,
            notificationId: notification._id.toString(),
            type,
          },
        });
      }
    }

    if (validMessages.length > 0) {
      const { successCount, failureCount, tickets } = await sendRawExpoPush(validMessages);
      notification.deliveryStatus = successCount > 0 ? "delivered" : failureCount > 0 ? "failed" : "sent";
      if (tickets[0]?.id) {
        notification.receiptId = tickets[0].id;
      }
      await notification.save();
    }

    return notification;
  } catch (error) {
    console.error(`[PushNotification] sendToUser error (${userId}):`, error.message);
    return null;
  }
};

/**
 * Send automatic order notification with strict customer filtering
 */
const sendOrderNotification = async (event, order, extraData = {}) => {
  try {
    if (!order) return;

    const orderId = order.orderId || (order._id ? order._id.toString() : "N/A");
    const customerId = order.user?._id || order.user;

    // STRICT CUSTOMER FILTERING:
    // Customers must receive:
    // - ORDER_PLACED
    // - OUT_FOR_DELIVERY / READY_FOR_PICKUP
    // - DELIVERED
    // - CANCELLED
    // - REFUND
    // Customers must NOT receive internal events like vendor confirmation or driver assignment.

    let title = "";
    let body = "";
    let type = "";
    let screen = "OrderDetails";

    switch (event) {
      case "ORDER_PLACED":
        title = "Order Placed Successfully!";
        body = `Your order #${orderId} has been placed successfully. We will notify you about further updates.`;
        type = "ORDER_PLACED";
        break;

      case "OUT_FOR_DELIVERY":
      case "ready_for_pickup":
        title = order.bookAppearance === "physical" ? "Order Ready For Pickup!" : "Order Out for Delivery!";
        body = `Your order #${orderId} is now ready for pickup / out for delivery.`;
        type = "OUT_FOR_DELIVERY";
        break;

      case "DELIVERED":
      case "delivered":
        title = "Order Delivered!";
        body = `Your order #${orderId} has been delivered successfully. Thank you for choosing Kalki Sena Drive!`;
        type = "ORDER_DELIVERED";
        break;

      case "CANCELLED":
      case "cancelled":
        title = "Order Cancelled";
        body = `Your order #${orderId} has been cancelled.`;
        type = "ORDER_CANCELLED";
        break;

      case "REFUND":
      case "refund":
        title = "Refund Processed";
        body = `Refund for your order #${orderId} has been processed successfully.`;
        type = "REFUND_PROCESSED";
        break;

      default:
        // Ignore internal events for customers
        return;
    }

    if (customerId) {
      await sendToUser(customerId, {
        title,
        body,
        type,
        data: {
          orderId,
          screen,
          ...extraData,
        },
        channelId: "orders",
        priority: "high",
      });
    }
  } catch (error) {
    console.error("[PushNotification] sendOrderNotification error:", error.message);
  }
};

/**
 * Super Admin Broadcast Engine
 */
const sendBroadcast = async ({
  title,
  body,
  targetAudience = "all",
  targetUser = null,
  targetEmail = "",
  screen = "Home",
  data = {},
  priority = "high",
  sound = "default",
  senderId = null,
  scheduledAt = null,
}) => {
  try {
    // 1. Resolve recipients based on target audience
    let userQuery = {};

    if (targetAudience === "individual") {
      if (targetUser) {
        userQuery = { _id: targetUser };
      } else if (targetEmail) {
        userQuery = { email: targetEmail.trim().toLowerCase() };
      }
    } else if (targetAudience === "user") {
      userQuery = { role: "user" };
    } else if (targetAudience === "driver") {
      userQuery = { role: "driver" };
    } else if (targetAudience === "doctor") {
      userQuery = { role: "doctor" };
    } else if (targetAudience === "admin") {
      userQuery = { role: { $in: ["admin", "superadmin"] } };
    } else {
      // "all"
      userQuery = {};
    }

    const recipients = await User.find(userQuery).select("_id email role");
    const recipientIds = recipients.map((u) => u._id);

    // 2. Create Broadcast Record in DB
    const broadcast = await BroadcastNotification.create({
      title,
      body,
      targetAudience,
      targetUser: targetAudience === "individual" ? recipientIds[0] || null : null,
      targetEmail: targetEmail || "",
      screen: screen || "Home",
      data,
      priority,
      sound,
      sender: senderId,
      status: scheduledAt && new Date(scheduledAt) > new Date() ? "scheduled" : "sending",
      scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
      sentAt: scheduledAt && new Date(scheduledAt) > new Date() ? null : new Date(),
      metrics: {
        targetedCount: recipientIds.length,
        tokensCount: 0,
        successCount: 0,
        failureCount: 0,
        tickets: [],
      },
    });

    // If scheduled for future, return early
    if (scheduledAt && new Date(scheduledAt) > new Date()) {
      return broadcast;
    }

    if (recipientIds.length === 0) {
      broadcast.status = "sent";
      await broadcast.save();
      return broadcast;
    }

    // 3. Create in-app Notification records for all recipients in bulk
    const notificationDocs = recipientIds.map((userId) => ({
      recipient: userId,
      title,
      body,
      type: "BROADCAST",
      data: {
        ...data,
        screen: screen || "Home",
        broadcastId: broadcast._id.toString(),
      },
      broadcastId: broadcast._id,
      deliveryStatus: "pending",
    }));

    await Notification.insertMany(notificationDocs, { ordered: false });

    // 4. Find all active tokens for target recipients
    const activeTokens = await DeviceToken.find({
      user: { $in: recipientIds },
      isActive: true,
    });

    broadcast.metrics.tokensCount = activeTokens.length;

    // 5. Build Expo Push messages
    const pushMessages = [];
    for (const item of activeTokens) {
      if (isValidExpoPushToken(item.token)) {
        pushMessages.push({
          to: item.token,
          sound: sound || "default",
          title,
          body,
          priority: priority === "high" ? "high" : "default",
          channelId: "default",
          data: {
            ...data,
            screen: screen || "Home",
            broadcastId: broadcast._id.toString(),
            type: "BROADCAST",
          },
        });
      }
    }

    if (pushMessages.length > 0) {
      const { successCount, failureCount, tickets } = await sendRawExpoPush(pushMessages);
      broadcast.metrics.successCount = successCount;
      broadcast.metrics.failureCount = failureCount;
      broadcast.metrics.tickets = tickets.map((t, idx) => ({
        token: pushMessages[idx]?.to || "",
        ticketId: t.id || "",
        status: t.status || "unknown",
        message: t.message || "",
        details: t.details || {},
      }));
    }

    broadcast.status = "sent";
    await broadcast.save();

    return broadcast;
  } catch (error) {
    console.error("[PushNotification] sendBroadcast error:", error.message);
    throw error;
  }
};

module.exports = {
  isValidExpoPushToken,
  sendRawExpoPush,
  sendToUser,
  sendOrderNotification,
  sendBroadcast,
};
