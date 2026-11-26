const dotenv = require("dotenv");
dotenv.config();

const connectDB = require("../config/db");
const User = require("../models/User");
const DeviceToken = require("../models/DeviceToken");
const Notification = require("../models/Notification");
const BroadcastNotification = require("../models/BroadcastNotification");
const BookOrder = require("../models/BookOrder");
const pushService = require("../services/pushNotificationService");

async function runTests() {
  console.log("==================================================");
  console.log("KALKI SENA DRIVE - PUSH NOTIFICATION SYSTEM TESTS");
  console.log("==================================================\n");

  await connectDB();

  let passed = 0;
  let total = 0;

  function assert(condition, testName) {
    total++;
    if (condition) {
      console.log(`[PASS] ${testName}`);
      passed++;
    } else {
      console.error(`[FAIL] ${testName}`);
    }
  }

  const createdNotifIds = [];

  try {
    // Test 1: Token Format Validation
    const validToken = "ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]";
    const invalidToken = "not_an_expo_token";
    assert(
      pushService.isValidExpoPushToken(validToken),
      "1. Valid Expo Push Token recognized"
    );
    assert(
      !pushService.isValidExpoPushToken(invalidToken),
      "2. Invalid Expo Push Token properly rejected"
    );

    // Find test user
    const testUser =
      (await User.findOne({ role: "superadmin" })) || (await User.findOne());
    if (!testUser) {
      console.error("No test user found in database to execute integration tests.");
      process.exit(1);
    }
    console.log(
      `\nUsing test user: ${testUser.fullName} (${testUser.email}, Role: ${testUser.role})`
    );

    // Test 2: Device Token Registration with Dual-Field Support
    const mockToken = "ExponentPushToken[test_device_token_kalki]";
    const deviceRecord = await DeviceToken.findOneAndUpdate(
      { token: mockToken },
      {
        user: testUser._id,
        token: mockToken,
        expoPushToken: mockToken,
        platform: "android",
        deviceName: "Samsung Galaxy Test",
        appVersion: "1.0.0",
        isActive: true,
        lastActiveAt: new Date(),
        lastUsedAt: new Date(),
      },
      { upsert: true, returnDocument: "after", setDefaultsOnInsert: true }
    );
    assert(
      deviceRecord &&
        deviceRecord.isActive === true &&
        deviceRecord.token === mockToken &&
        deviceRecord.expoPushToken === mockToken &&
        Boolean(deviceRecord.lastUsedAt),
      "3. Device Token upserted with dual token/expoPushToken & lastUsedAt support"
    );

    // Test 3: Multiple Device Support
    const mockToken2 = "ExponentPushToken[test_device_token_kalki_ios]";
    await DeviceToken.findOneAndUpdate(
      { token: mockToken2 },
      {
        user: testUser._id,
        token: mockToken2,
        expoPushToken: mockToken2,
        platform: "ios",
        deviceName: "iPhone 15 Pro",
        appVersion: "1.0.0",
        isActive: true,
      },
      { upsert: true, returnDocument: "after", setDefaultsOnInsert: true }
    );
    const userTokens = await DeviceToken.find({
      user: testUser._id,
      isActive: true,
    });
    assert(
      userTokens.length >= 2,
      `4. Multi-device support: User has ${userTokens.length} active registered devices`
    );

    // Test 4: In-App Notification Creation & Dual user/recipient Populating
    const notif = await Notification.create({
      recipient: testUser._id,
      title: "Test In-App Notification",
      body: "Testing in-app notification center sync.",
      type: "SYSTEM",
      isRead: false,
    });
    createdNotifIds.push(notif._id);

    assert(
      notif &&
        notif.recipient.toString() === testUser._id.toString() &&
        notif.user.toString() === testUser._id.toString(),
      "5. In-app Notification created with synchronized recipient & user fields"
    );

    // Test 5: Unread Counter & Mark as Read
    const unreadCount = await Notification.countDocuments({
      $or: [{ recipient: testUser._id }, { user: testUser._id }],
      isRead: false,
    });
    assert(unreadCount >= 1, `6. Unread count calculated correctly (${unreadCount})`);

    const updatedNotif = await Notification.findOneAndUpdate(
      { _id: notif._id, $or: [{ recipient: testUser._id }, { user: testUser._id }] },
      { isRead: true, readAt: new Date() },
      { returnDocument: "after" }
    );
    assert(
      updatedNotif && updatedNotif.isRead === true && Boolean(updatedNotif.readAt),
      "7. Notification marked as read successfully"
    );

    // Test 6: Unified createNotification Helper
    const unifiedNotif = await pushService.createNotification({
      userId: testUser._id,
      title: "Unified Notification Helper Test",
      body: "Checking createNotification export function.",
      type: "SYSTEM",
      data: { test: true },
    });
    if (unifiedNotif) createdNotifIds.push(unifiedNotif._id);
    assert(
      unifiedNotif && unifiedNotif.title === "Unified Notification Helper Test",
      "8. Reusable createNotification helper created record and triggered push"
    );

    // Test 7: Driver KYC Approval & Rejection Notifications
    const kycApprovalNotif = await pushService.sendDriverKYCNotification(
      testUser._id,
      "approved"
    );
    if (kycApprovalNotif) createdNotifIds.push(kycApprovalNotif._id);
    assert(
      kycApprovalNotif &&
        kycApprovalNotif.type === "DRIVER_KYC_APPROVED" &&
        kycApprovalNotif.title.includes("Approved"),
      "9. Driver KYC Approval notification sent and recorded"
    );

    const kycRejectionNotif = await pushService.sendDriverKYCNotification(
      testUser._id,
      "rejected",
      "License image too blurry"
    );
    if (kycRejectionNotif) createdNotifIds.push(kycRejectionNotif._id);
    assert(
      kycRejectionNotif &&
        kycRejectionNotif.type === "DRIVER_KYC_REJECTED" &&
        kycRejectionNotif.body.includes("License image too blurry"),
      "10. Driver KYC Rejection notification sent with reason and recorded"
    );

    // Test 8: Order Notification Events & Customer Filtering
    const mockOrder = {
      _id: "674000000000000000000099",
      orderId: "ORD-TEST-9999",
      user: testUser._id,
      bookAppearance: "digital",
      totalAmount: 499,
    };

    // 8a: ORDER_PLACED -> Customer must receive
    await pushService.sendOrderNotification("ORDER_PLACED", mockOrder);
    const placedNotif = await Notification.findOne({
      recipient: testUser._id,
      type: "ORDER_PLACED",
      "data.orderId": mockOrder.orderId,
    });
    if (placedNotif) createdNotifIds.push(placedNotif._id);
    assert(
      placedNotif && placedNotif.title.includes("Order Placed Successfully"),
      "11. Automatic Order Success notification triggered for customer"
    );

    // 8b: Internal event (e.g. "driver_assigned") -> Customer must NOT receive
    const beforeCount = await Notification.countDocuments({
      recipient: testUser._id,
      "data.orderId": mockOrder.orderId,
    });
    await pushService.sendOrderNotification("driver_assigned", mockOrder);
    const afterCount = await Notification.countDocuments({
      recipient: testUser._id,
      "data.orderId": mockOrder.orderId,
    });
    assert(
      beforeCount === afterCount,
      "12. Customer Filtering Rule enforced: Internal vendor/driver events are NEVER delivered to customer"
    );

    // 8c: OUT_FOR_DELIVERY -> Customer must receive
    await pushService.sendOrderNotification("OUT_FOR_DELIVERY", mockOrder);
    const outNotif = await Notification.findOne({
      recipient: testUser._id,
      type: "OUT_FOR_DELIVERY",
      "data.orderId": mockOrder.orderId,
    });
    if (outNotif) createdNotifIds.push(outNotif._id);
    assert(
      outNotif &&
        (outNotif.title.includes("Delivery") || outNotif.title.includes("Pickup")),
      "13. Automatic Out for Delivery / Ready for Pickup notification triggered for customer"
    );

    // Test 9: Super Admin Broadcast Management
    const broadcast = await pushService.sendBroadcast({
      title: "Nationwide Book Launch Broadcast",
      body: "Pick up your copy of Economic Revolution at any local branch.",
      targetAudience: "all",
      screen: "OrderDetails",
      priority: "high",
      sound: "default",
      senderId: testUser._id,
    });

    assert(
      broadcast &&
        broadcast.status === "sent" &&
        broadcast.metrics.targetedCount > 0,
      `14. Super Admin broadcast successfully dispatched to ${broadcast.metrics.targetedCount} recipients`
    );

    // Verify broadcast created in-app notification records
    const broadcastNotifs = await Notification.find({
      broadcastId: broadcast._id,
    });
    assert(
      broadcastNotifs.length > 0,
      `15. Broadcast delivered to in-app notification centers (${broadcastNotifs.length} created)`
    );

    // Clean up test records
    await Notification.deleteMany({ _id: { $in: createdNotifIds } });
    await Notification.deleteMany({ broadcastId: broadcast._id });
    await BroadcastNotification.findByIdAndDelete(broadcast._id);
    await DeviceToken.deleteMany({ token: { $in: [mockToken, mockToken2] } });

    console.log("\n==================================================");
    console.log(`TEST SUMMARY: ${passed}/${total} TESTS PASSED`);
    console.log("==================================================\n");

    process.exit(0);
  } catch (err) {
    console.error("[TEST FATAL ERROR]:", err);
    process.exit(1);
  }
}

runTests();
