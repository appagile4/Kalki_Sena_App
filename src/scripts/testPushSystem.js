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

    // Find or pick a test user
    const testUser = await User.findOne({ role: "superadmin" }) || await User.findOne();
    if (!testUser) {
      console.error("No test user found in database to execute integration tests.");
      process.exit(1);
    }
    console.log(`\nUsing test user: ${testUser.fullName} (${testUser.email}, Role: ${testUser.role})`);

    // Test 2: Device Token Registration
    const mockToken = "ExponentPushToken[test_device_token_kalki]";
    const deviceRecord = await DeviceToken.findOneAndUpdate(
      { token: mockToken },
      {
        user: testUser._id,
        token: mockToken,
        platform: "android",
        deviceName: "Samsung Galaxy Test",
        appVersion: "1.0.0",
        isActive: true,
        lastActiveAt: new Date(),
      },
      { upsert: true, new: true }
    );
    assert(
      deviceRecord && deviceRecord.isActive === true && deviceRecord.token === mockToken,
      "3. Device Token upserted and linked to user account"
    );

    // Test 3: Multiple Device Support
    const mockToken2 = "ExponentPushToken[test_device_token_kalki_ios]";
    await DeviceToken.findOneAndUpdate(
      { token: mockToken2 },
      {
        user: testUser._id,
        token: mockToken2,
        platform: "ios",
        deviceName: "iPhone 15 Pro",
        appVersion: "1.0.0",
        isActive: true,
      },
      { upsert: true, new: true }
    );
    const userTokens = await DeviceToken.find({ user: testUser._id, isActive: true });
    assert(
      userTokens.length >= 2,
      `4. Multi-device support: User has ${userTokens.length} active registered devices`
    );

    // Test 4: In-App Notification Creation & Unread Counter
    const notif = await Notification.create({
      recipient: testUser._id,
      title: "Test In-App Notification",
      body: "Testing in-app notification center sync.",
      type: "SYSTEM",
      isRead: false,
    });
    assert(notif && notif._id, "5. In-app Notification successfully created in MongoDB");

    const unreadCountBefore = await Notification.countDocuments({
      recipient: testUser._id,
      isRead: false,
    });
    assert(unreadCountBefore > 0, `6. Unread count calculated correctly (${unreadCountBefore})`);

    // Test 5: Mark Notification as Read
    await Notification.findByIdAndUpdate(notif._id, { isRead: true, readAt: new Date() });
    const notifUpdated = await Notification.findById(notif._id);
    assert(notifUpdated.isRead === true, "7. Notification marked as read successfully");

    // Test 6: Automatic Order Notification Triggers & Customer Filtering
    const mockOrder = {
      orderId: "TEST-ORDER-" + Date.now(),
      user: testUser._id,
      customerName: testUser.fullName,
      bookAppearance: "physical",
    };

    // 6a: ORDER_PLACED -> Customer must receive
    await pushService.sendOrderNotification("ORDER_PLACED", mockOrder);
    const placedNotif = await Notification.findOne({
      recipient: testUser._id,
      type: "ORDER_PLACED",
      "data.orderId": mockOrder.orderId,
    });
    assert(
      placedNotif && placedNotif.title === "Order Placed Successfully!",
      "8. Automatic Order Success notification triggered for customer"
    );

    // 6b: Internal Event -> Customer must NOT receive
    const beforeCount = await Notification.countDocuments({
      recipient: testUser._id,
      "data.orderId": mockOrder.orderId,
    });
    await pushService.sendOrderNotification("VENDOR_CONFIRMED", mockOrder);
    await pushService.sendOrderNotification("DELIVERY_BOY_ASSIGNED", mockOrder);
    const afterCount = await Notification.countDocuments({
      recipient: testUser._id,
      "data.orderId": mockOrder.orderId,
    });
    assert(
      beforeCount === afterCount,
      "9. Customer Filtering Rule enforced: Internal vendor/driver events are NEVER delivered to customer"
    );

    // 6c: OUT_FOR_DELIVERY -> Customer must receive
    await pushService.sendOrderNotification("OUT_FOR_DELIVERY", mockOrder);
    const outNotif = await Notification.findOne({
      recipient: testUser._id,
      type: "OUT_FOR_DELIVERY",
      "data.orderId": mockOrder.orderId,
    });
    assert(
      outNotif && (outNotif.title.includes("Delivery") || outNotif.title.includes("Pickup")),
      "10. Automatic Out for Delivery / Ready for Pickup notification triggered for customer"
    );

    // Test 7: Super Admin Broadcast Management
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
      broadcast && broadcast.status === "sent" && broadcast.metrics.targetedCount > 0,
      `11. Super Admin broadcast successfully dispatched to ${broadcast.metrics.targetedCount} recipients`
    );

    // Verify broadcast created in-app notification records
    const broadcastNotifs = await Notification.find({ broadcastId: broadcast._id });
    assert(
      broadcastNotifs.length > 0,
      `12. Broadcast delivered to in-app notification centers (${broadcastNotifs.length} created)`
    );

    // Clean up test records
    await Notification.deleteMany({ _id: { $in: [notif._id, placedNotif?._id, outNotif?._id] } });
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
