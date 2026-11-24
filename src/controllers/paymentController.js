const Book = require("../models/Book");
const BookOrder = require("../models/BookOrder");
const Payment = require("../models/Payment");
const esewaService = require("../services/esewaService");
const pushService = require("../services/pushNotificationService");

// -------------------------------------------------------------
// 1. GET /api/books/featured
// Return the single featured book and current price
// -------------------------------------------------------------
exports.getFeaturedBook = async (req, res, next) => {
  try {
    let book = await Book.findOne();
    if (!book) {
      // Default book fallback
      book = {
        title: "Economic Revolution to make Nepal A World Leader",
        subtitle: "A Strategic Masterplan for Nepal's Economic Transformation",
        author: "Jay Sah (MR. 666)",
        coAuthor: "Dr. Uma Shankar Prasad",
        price: 1000,
        currency: "NPR",
        rating: 4.3,
        totalReviews: 248,
        aboutText:
          "Economic Revolution to make Nepal A World Leader outlines systematic economic reforms, free universal healthcare, digital public infrastructure, and youth empowerment.",
        summaryText:
          "After 10 lakh books are sold nationwide, the Kalkiism Research and Training Center guarantees a central government that will implement economic policies to provide free health, education, and legal services.",
      };
    }

    res.status(200).json({
      success: true,
      data: book,
    });
  } catch (error) {
    next(error);
  }
};

// -------------------------------------------------------------
// 2. POST /api/payments/esewa/initiate
// Initiates eSewa Native/Web Payment with server-calculated amount
// -------------------------------------------------------------
exports.initiateEsewaPayment = async (req, res, next) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required to purchase book.",
      });
    }

    const { bookAppearance = "digital", pickupLocation = "" } = req.body;

    // Fetch the single book
    const book = await Book.findOne();
    const bookPrice = book ? Number(book.price) || 1000 : 1000;
    const bookCurrency = book?.currency || "NPR";
    const bookTitle =
      book?.title || "Economic Revolution to make Nepal A World Leader";

    // If digital, check if user has already bought the digital book
    if (bookAppearance === "digital") {
      const existingPurchase = await BookOrder.findOne({
        user: user._id,
        bookAppearance: "digital",
        paymentStatus: "completed",
      });

      if (existingPurchase) {
        return res.status(400).json({
          success: false,
          alreadyPurchased: true,
          message:
            "You have already purchased the digital edition of this book. You can read it directly in My Book.",
          orderId: existingPurchase.orderId,
        });
      }
    }

    // Generate unique order ID and eSewa transaction UUID
    const timestamp = Date.now();
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const orderId = `KS-ORD-${timestamp}-${randomSuffix}`;
    const transactionUuid = `KS-TXN-${timestamp}-${Math.random()
      .toString(36)
      .substring(2, 7)
      .toUpperCase()}`;

    // 1. Create Pending BookOrder
    const order = await BookOrder.create({
      orderId,
      user: user._id,
      customerName: user.fullName || "Kalki Sena Reader",
      customerEmail: user.email || "",
      customerPhone: user.phone || "",
      book: book ? book._id : null,
      bookTitle,
      bookAppearance: bookAppearance === "physical" ? "physical" : "digital",
      pickupLocation: bookAppearance === "physical" ? pickupLocation : "",
      paymentMethod: "esewa",
      amount: bookPrice,
      currency: bookCurrency,
      paymentStatus: "pending",
      orderStatus: "processing",
      esewaTransactionUuid: transactionUuid,
    });

    // 2. Create Pending Payment record
    const payment = await Payment.create({
      order: order._id,
      user: user._id,
      book: book ? book._id : null,
      paymentMethod: "esewa",
      transactionUuid,
      amount: bookPrice,
      taxAmount: 0,
      totalAmount: bookPrice,
      currency: bookCurrency,
      status: "pending",
      environment: process.env.ESEWA_ENVIRONMENT || "UAT",
    });

    // Link payment to order
    order.payment = payment._id;
    await order.save();

    // 3. Generate official signed eSewa payloads (Intent App-to-App + Web form)
    const esewaPayload = esewaService.buildInitiatePayload(
      bookPrice,
      transactionUuid,
      {
        customer_name: user.fullName,
        customer_email: user.email,
        order_id: orderId,
      }
    );

    const esewaIntent = esewaService.buildIntentPayload(
      bookPrice,
      transactionUuid,
      {
        customer_name: user.fullName,
        customer_email: user.email,
        order_id: orderId,
      }
    );

    // Save generated signature to payment record
    payment.signature = esewaPayload.signature;
    await payment.save();

    const host = req.get("host") || "192.168.29.235:5000";
    const protocol = req.headers["x-forwarded-proto"] || req.protocol || "http";
    const callbackBase =
      process.env.ESEWA_CALLBACK_BASE_URL || `${protocol}://${host}`;

    // Create official direct payment session with eSewa API (returns 302 location)
    const sessionRes = await esewaService.createDirectPaymentSession(
      bookPrice,
      transactionUuid,
      {
        successUrl: `${callbackBase}/api/payments/esewa/callback/success`,
        failureUrl: `${callbackBase}/api/payments/esewa/callback/failure`,
      }
    );

    if (sessionRes.success && sessionRes.bookingUrl) {
      payment.bookingUrl = sessionRes.bookingUrl;
      await payment.save();
    }

    const fallbackGatewayUrl = `${callbackBase}/api/payments/esewa/pay-gateway/${transactionUuid}`;
    const gatewayUrl =
      sessionRes.success && sessionRes.bookingUrl
        ? sessionRes.bookingUrl
        : fallbackGatewayUrl;

    res.status(201).json({
      success: true,
      message: "eSewa payment initiated successfully",
      orderId: order.orderId,
      orderMongoId: order._id,
      transactionUuid,
      amount: bookPrice,
      currency: bookCurrency,
      gatewayUrl,
      directBookingUrl: sessionRes.bookingUrl || null,
      esewaIntent,
      esewaPayload,
      book: {
        id: book ? book._id : null,
        title: bookTitle,
        price: bookPrice,
        appearance: order.bookAppearance,
      },
    });
  } catch (error) {
    console.error("[initiateEsewaPayment] Error:", error);
    next(error);
  }
};

// -------------------------------------------------------------
// 2b. GET /api/payments/esewa/pay-gateway/:transactionUuid
// Direct redirect to official eSewa booking URL
// -------------------------------------------------------------
exports.renderEsewaGatewayForm = async (req, res, next) => {
  try {
    const { transactionUuid } = req.params;
    const payment = await Payment.findOne({ transactionUuid });
    if (!payment) {
      return res.status(404).send("<h3>Payment transaction not found</h3>");
    }

    // If session booking URL already generated, redirect immediately
    if (payment.bookingUrl) {
      return res.redirect(payment.bookingUrl);
    }

    const host = req.get("host") || "192.168.29.235:5000";
    const protocol = req.headers["x-forwarded-proto"] || req.protocol || "http";
    const callbackBase =
      process.env.ESEWA_CALLBACK_BASE_URL || `${protocol}://${host}`;

    const sessionRes = await esewaService.createDirectPaymentSession(
      payment.totalAmount,
      payment.transactionUuid,
      {
        successUrl: `${callbackBase}/api/payments/esewa/callback/success`,
        failureUrl: `${callbackBase}/api/payments/esewa/callback/failure`,
      }
    );

    if (sessionRes.success && sessionRes.bookingUrl) {
      payment.bookingUrl = sessionRes.bookingUrl;
      await payment.save();
      return res.redirect(sessionRes.bookingUrl);
    }

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>eSewa Payment Portal</title>
  <style>
    body { background: #06152B; color: #FFFFFF; font-family: -apple-system, sans-serif; display: flex; align-items: center; justify-content: center; min-height: 100vh; text-align: center; margin: 0; padding: 24px; }
    .card { background: #0B1E38; border: 1px solid #183359; border-radius: 16px; padding: 32px 24px; max-width: 380px; width: 100%; box-shadow: 0 10px 30px rgba(0,0,0,0.5); }
    h2 { font-size: 20px; margin: 0 0 12px 0; }
    p { color: #8EA4BE; font-size: 14px; margin: 0 0 20px 0; line-height: 1.5; }
    .btn { display: inline-block; padding: 12px 24px; background: #60BB46; color: #fff; text-decoration: none; border-radius: 8px; font-weight: 700; }
  </style>
</head>
<body>
  <div class="card">
    <h2>eSewa Payment Portal</h2>
    <p>${sessionRes.error || "Unable to connect to eSewa. Please tap below to retry."}</p>
    <a href="${callbackBase}/api/payments/esewa/pay-gateway/${transactionUuid}" class="btn">Retry Connection</a>
  </div>
</body>
</html>`;

    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.send(html);
  } catch (error) {
    next(error);
  }
};

// -------------------------------------------------------------
// 2c. GET/POST /api/payments/esewa/callback/success
// Official eSewa Web redirect handler
// -------------------------------------------------------------
exports.handleEsewaSuccessCallback = async (req, res, next) => {
  try {
    const encodedData = req.query.data || req.body?.data;
    let decoded = null;
    let transactionUuid = "";
    let refId = "";

    if (encodedData) {
      decoded = esewaService.decodeBase64Response(encodedData);
      if (decoded) {
        transactionUuid = decoded.transaction_uuid;
        refId = decoded.transaction_code;
      }
    }

    if (!transactionUuid) {
      transactionUuid = req.query.transaction_uuid || req.query.oid || "";
    }
    if (!refId) {
      refId = req.query.refId || req.query.transaction_code || "";
    }

    // Auto-verify with eSewa servers if transactionUuid found
    if (transactionUuid) {
      try {
        const payment = await Payment.findOne({ transactionUuid }).populate("order");
        if (payment && payment.status !== "completed") {
          const serverCheck = await esewaService.verifyServerStatus(
            payment.totalAmount,
            payment.transactionUuid
          );

          if (serverCheck.verified || (decoded && decoded.status === "COMPLETE")) {
            const confirmedRef = serverCheck.refId || refId || `REF-${Date.now()}`;
            payment.status = "completed";
            payment.transactionCode = confirmedRef;
            payment.verifiedAt = new Date();
            payment.verifiedBy = "esewa_callback";
            payment.esewaResponseRaw = decoded || serverCheck.data;
            await payment.save();

            if (payment.order) {
              payment.order.paymentStatus = "completed";
              payment.order.orderStatus =
                payment.order.bookAppearance === "physical"
                  ? "ready_for_pickup"
                  : "confirmed";
              payment.order.esewaTransactionCode = confirmedRef;
              payment.order.esewaTransactionUuid = payment.transactionUuid;
              await payment.order.save();
            }

            await Book.updateOne({}, { $inc: { totalSold: 1 } });
          }
        }
      } catch (err) {
        console.error("Auto-verification error in callback:", err.message);
      }
    }

    // Deep link to Kalki Sena app
    const appDeepLink = `kalkisenadrive://payment-success?data=${encodeURIComponent(
      encodedData || ""
    )}&transaction_uuid=${encodeURIComponent(
      transactionUuid || ""
    )}&refId=${encodeURIComponent(refId || "")}`;

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Payment Successful - Kalki Sena</title>
  <style>
    body { background: #020b18; color: #fff; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; padding: 20px; box-sizing: border-box; }
    .card { background: #081E38; border: 1px solid #183359; border-radius: 20px; padding: 32px 24px; max-width: 400px; width: 100%; text-align: center; box-shadow: 0 10px 30px rgba(0,0,0,0.5); }
    .icon { width: 64px; height: 64px; background: #60BB46; border-radius: 32px; display: inline-flex; align-items: center; justify-content: center; font-size: 32px; color: #fff; margin-bottom: 20px; }
    h1 { font-size: 22px; margin: 0 0 12px 0; }
    p { color: #8EA4BE; font-size: 14px; margin: 0 0 24px 0; line-height: 1.5; }
    .btn { display: block; width: 100%; box-sizing: border-box; background: #60BB46; color: #fff; text-decoration: none; padding: 14px 20px; border-radius: 12px; font-weight: 700; font-size: 16px; margin-top: 12px; }
  </style>
  <script>
    window.onload = function() {
      window.location.href = "${appDeepLink}";
    };
  </script>
</head>
<body>
  <div class="card">
    <div class="icon">✓</div>
    <h1>Payment Confirmed!</h1>
    <p>Your payment with eSewa was successful. Returning to the Kalki Sena app...</p>
    <a href="${appDeepLink}" class="btn">Open Kalki Sena App</a>
  </div>
</body>
</html>`;

    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.send(html);
  } catch (error) {
    next(error);
  }
};

// -------------------------------------------------------------
// 2d. GET/POST /api/payments/esewa/callback/failure
// Official eSewa Web failure redirect handler
// -------------------------------------------------------------
exports.handleEsewaFailureCallback = async (req, res, next) => {
  const appDeepLink = `kalkisenadrive://payment-failure?message=Payment+cancelled+or+declined`;
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Payment Cancelled</title>
  <style>
    body { background: #020b18; color: #fff; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; padding: 20px; box-sizing: border-box; }
    .card { background: #081E38; border: 1px solid #183359; border-radius: 20px; padding: 32px 24px; max-width: 400px; width: 100%; text-align: center; }
    .icon { width: 64px; height: 64px; background: #EF4444; border-radius: 32px; display: inline-flex; align-items: center; justify-content: center; font-size: 32px; color: #fff; margin-bottom: 20px; }
    h1 { font-size: 22px; margin: 0 0 12px 0; }
    p { color: #8EA4BE; font-size: 14px; margin: 0 0 24px 0; line-height: 1.5; }
    .btn { display: block; width: 100%; box-sizing: border-box; background: #208AEF; color: #fff; text-decoration: none; padding: 14px 20px; border-radius: 12px; font-weight: 700; font-size: 16px; }
  </style>
  <script>
    window.onload = function() {
      window.location.href = "${appDeepLink}";
    };
  </script>
</head>
<body>
  <div class="card">
    <div class="icon">✕</div>
    <h1>Payment Cancelled</h1>
    <p>The eSewa payment process was cancelled or could not be completed.</p>
    <a href="${appDeepLink}" class="btn">Return to Kalki Sena App</a>
  </div>
</body>
</html>`;

  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.send(html);
};

// -------------------------------------------------------------
// 3. POST /api/payments/esewa/verify
// Independent Server-Side Verification with eSewa
// -------------------------------------------------------------
exports.verifyEsewaPayment = async (req, res, next) => {
  try {
    const user = req.user;
    const { transactionUuid, encodedData, refId, failure } = req.body;

    if (!transactionUuid) {
      return res.status(400).json({
        success: false,
        message: "Transaction UUID is required for payment verification.",
      });
    }

    // Find the payment record
    const payment = await Payment.findOne({ transactionUuid }).populate(
      "order"
    );
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: `Payment record with transaction UUID '${transactionUuid}' was not found.`,
      });
    }

    // Verify ownership
    const isOwner =
      user && payment.user && payment.user.toString() === user._id.toString();
    const isAdmin =
      user && (user.role === "superadmin" || user.role === "admin");

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to verify this transaction.",
      });
    }

    // Idempotency: If already completed, return success immediately
    if (payment.status === "completed") {
      return res.status(200).json({
        success: true,
        message: "Payment has already been verified and marked as completed.",
        paymentId: payment._id,
        orderId: payment.order?.orderId,
        refId: payment.transactionCode,
        status: "completed",
        alreadyVerified: true,
      });
    }

    // If client reported payment failure/cancellation
    if (failure || req.body.status === "cancelled" || req.body.status === "failed") {
      payment.status = req.body.status === "cancelled" ? "cancelled" : "failed";
      payment.failureReason =
        req.body.message || "Payment cancelled or rejected by user.";
      await payment.save();

      if (payment.order) {
        payment.order.paymentStatus = payment.status;
        payment.order.orderStatus = "cancelled";
        await payment.order.save();
        pushService.sendOrderNotification("CANCELLED", payment.order).catch((err) =>
          console.error("[OrderNotification] Failed to trigger cancel push:", err.message)
        );
      }

      return res.status(200).json({
        success: false,
        message: "Payment was marked as cancelled/failed.",
        status: payment.status,
      });
    }

    // Decode response payload if Base64 encoded string returned from eSewa redirect
    let decodedPayload = null;
    if (encodedData && typeof encodedData === "string") {
      decodedPayload = esewaService.decodeBase64Response(encodedData);
      if (decodedPayload) {
        esewaService.validateCallbackSignature(decodedPayload);
      }
    }

    // 4. Query eSewa Server-Side Status Verification API
    const serverCheck = await esewaService.verifyServerStatus(
      payment.totalAmount,
      payment.transactionUuid
    );

    // Consider verified if eSewa status API returns COMPLETE
    // Or if in UAT environment and a valid callback with transaction_code was received
    const isEsewaConfirmed =
      serverCheck.verified ||
      (decodedPayload &&
        decodedPayload.status === "COMPLETE" &&
        decodedPayload.transaction_uuid === payment.transactionUuid) ||
      (Boolean(refId) &&
        process.env.ESEWA_ENVIRONMENT === "UAT" &&
        serverCheck.status !== "CANCELED");

    if (isEsewaConfirmed) {
      const confirmedRefId =
        serverCheck.refId ||
        (decodedPayload && decodedPayload.transaction_code) ||
        refId ||
        `REF-${Date.now()}`;

      // Update payment record to COMPLETED
      payment.status = "completed";
      payment.transactionCode = confirmedRefId;
      payment.verifiedAt = new Date();
      payment.verifiedBy = serverCheck.verified
        ? "esewa_server_api"
        : "esewa_signed_callback";
      payment.esewaResponseRaw = serverCheck.data || decodedPayload;
      await payment.save();

      // Update linked BookOrder
      if (payment.order) {
        payment.order.paymentStatus = "completed";
        payment.order.orderStatus =
          payment.order.bookAppearance === "physical"
            ? "ready_for_pickup"
            : "confirmed";
        payment.order.esewaTransactionCode = confirmedRefId;
        payment.order.esewaTransactionUuid = payment.transactionUuid;
        await payment.order.save();
        pushService.sendOrderNotification("ORDER_PLACED", payment.order).catch((err) =>
          console.error("[OrderNotification] Failed to trigger order success push:", err.message)
        );
      }

      // Update total sold stats on Book model
      await Book.updateOne({}, { $inc: { totalSold: 1 } });

      return res.status(200).json({
        success: true,
        message: "Payment successfully verified with eSewa!",
        orderId: payment.order?.orderId,
        refId: confirmedRefId,
        amount: payment.totalAmount,
        currency: payment.currency,
        bookAppearance: payment.order?.bookAppearance || "digital",
        verifiedAt: payment.verifiedAt,
      });
    } else {
      // eSewa reported status is not complete (PENDING, NOT_FOUND, CANCELED, or FAILED)
      payment.status =
        serverCheck.status === "CANCELED"
          ? "cancelled"
          : serverCheck.status === "PENDING"
          ? "pending"
          : "failed";
      payment.failureReason = `eSewa reported status: ${serverCheck.status || "UNVERIFIED"}`;
      payment.esewaResponseRaw = serverCheck.data || decodedPayload;
      await payment.save();

      if (payment.order) {
        payment.order.paymentStatus = payment.status;
        await payment.order.save();
      }

      return res.status(400).json({
        success: false,
        message: `eSewa payment verification failed: ${payment.failureReason}`,
        status: payment.status,
      });
    }
  } catch (error) {
    console.error("[verifyEsewaPayment] Error:", error);
    next(error);
  }
};

// -------------------------------------------------------------
// 4. GET /api/payments/orders/:orderId/status
// Check order payment status
// -------------------------------------------------------------
exports.getOrderPaymentStatus = async (req, res, next) => {
  try {
    const { orderId } = req.params;
    const order = await BookOrder.findOne({
      $or: [{ orderId }, { _id: orderId.match(/^[0-9a-fA-F]{24}$/) ? orderId : null }],
    }).populate("payment");

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    res.status(200).json({
      success: true,
      data: {
        orderId: order.orderId,
        paymentStatus: order.paymentStatus,
        orderStatus: order.orderStatus,
        amount: order.amount,
        currency: order.currency,
        customerName: order.customerName,
        customerEmail: order.customerEmail,
        customerPhone: order.customerPhone,
        pickupLocation: order.pickupLocation,
        bookAppearance: order.bookAppearance,
        esewaTransactionCode: order.esewaTransactionCode,
        payment: order.payment,
      },
    });
  } catch (error) {
    next(error);
  }
};

// -------------------------------------------------------------
// 5. GET /api/books/my-purchase
// Check if logged-in user has verified ownership of the book
// -------------------------------------------------------------
exports.getMyPurchaseStatus = async (req, res, next) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    // Find any completed order for this user
    const completedOrder = await BookOrder.findOne({
      user: user._id,
      paymentStatus: "completed",
    })
      .sort({ createdAt: -1 })
      .populate("payment");

    if (!completedOrder) {
      return res.status(200).json({
        success: true,
        hasPurchased: false,
        message: "No active book purchase found for this user account.",
      });
    }

    // Fetch the single book details
    const book = await Book.findOne();

    res.status(200).json({
      success: true,
      hasPurchased: true,
      data: {
        orderId: completedOrder.orderId,
        bookAppearance: completedOrder.bookAppearance,
        pickupLocation: completedOrder.pickupLocation,
        purchasedAt: completedOrder.createdAt,
        verifiedAt: completedOrder.payment?.verifiedAt || completedOrder.updatedAt,
        esewaTransactionCode: completedOrder.esewaTransactionCode,
        amount: completedOrder.amount,
        currency: completedOrder.currency,
        book: {
          title: book?.title || completedOrder.bookTitle,
          subtitle: book?.subtitle,
          author: book?.author || "Jay Sah (MR. 666)",
          coAuthor: book?.coAuthor,
          coverImage: book?.coverImage,
          chapters: book?.chapters || [],
          aboutText: book?.aboutText,
          summaryText: book?.summaryText,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};
