const Payment = require("../models/Payment");
const BookOrder = require("../models/BookOrder");
const esewaService = require("../services/esewaService");

// -------------------------------------------------------------
// 1. GET /api/admin/payments
// List all payments with filter, search, pagination & user details
// -------------------------------------------------------------
exports.getAllPayments = async (req, res, next) => {
  try {
    const {
      status,
      search,
      page = 1,
      limit = 20,
      sortBy = "createdAt",
      order = "desc",
      appearance,
    } = req.query;

    const query = {};

    // Filter by payment status (completed, pending, failed, cancelled)
    if (status && status !== "all") {
      query.status = status;
    }

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
    const skip = (pageNum - 1) * limitNum;

    // Search filter across transaction IDs and codes
    let searchFilter = {};
    if (search && search.trim() !== "") {
      const searchRegex = new RegExp(search.trim(), "i");
      searchFilter = {
        $or: [
          { transactionUuid: searchRegex },
          { transactionCode: searchRegex },
        ],
      };
    }

    // Build base query
    const combinedQuery = { ...query, ...searchFilter };

    // Fetch payments populated with order and user
    let paymentsQuery = Payment.find(combinedQuery)
      .populate({
        path: "user",
        select: "fullName email phone role avatar createdAt",
      })
      .populate({
        path: "order",
        select:
          "orderId customerName customerEmail customerPhone bookAppearance pickupLocation paymentStatus orderStatus createdAt",
      })
      .populate({
        path: "book",
        select: "title price author coverImage",
      })
      .sort({ [sortBy]: order === "asc" ? 1 : -1 })
      .skip(skip)
      .limit(limitNum);

    const [payments, totalCount] = await Promise.all([
      paymentsQuery.exec(),
      Payment.countDocuments(combinedQuery),
    ]);

    // If search term was provided, we may also filter by user or order customer details in memory if needed
    let filteredPayments = payments;
    if (search && search.trim() !== "") {
      const term = search.trim().toLowerCase();
      filteredPayments = payments.filter((p) => {
        const u = p.user;
        const o = p.order;
        const matchUser =
          (u?.fullName && u.fullName.toLowerCase().includes(term)) ||
          (u?.email && u.email.toLowerCase().includes(term)) ||
          (u?.phone && u.phone.includes(term));
        const matchOrder =
          (o?.orderId && o.orderId.toLowerCase().includes(term)) ||
          (o?.customerName && o.customerName.toLowerCase().includes(term)) ||
          (o?.customerEmail && o.customerEmail.toLowerCase().includes(term)) ||
          (o?.customerPhone && o.customerPhone.includes(term));
        const matchTxn =
          (p.transactionUuid && p.transactionUuid.toLowerCase().includes(term)) ||
          (p.transactionCode && p.transactionCode.toLowerCase().includes(term));

        return matchUser || matchOrder || matchTxn;
      });
    }

    // Filter by bookAppearance if requested
    if (appearance && appearance !== "all") {
      filteredPayments = filteredPayments.filter(
        (p) => p.order?.bookAppearance === appearance
      );
    }

    res.status(200).json({
      success: true,
      data: filteredPayments,
      pagination: {
        total: totalCount,
        page: pageNum,
        limit: limitNum,
        pages: Math.ceil(totalCount / limitNum),
      },
    });
  } catch (error) {
    console.error("[getAllPayments] Error:", error);
    next(error);
  }
};

// -------------------------------------------------------------
// 2. GET /api/admin/payments/summary
// Aggregate statistics for Superadmin Dashboard KPIs
// -------------------------------------------------------------
exports.getPaymentSummary = async (req, res, next) => {
  try {
    const stats = await Payment.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
          totalAmount: { $sum: "$totalAmount" },
        },
      },
    ]);

    let verifiedRevenue = 0;
    let completedCount = 0;
    let pendingCount = 0;
    let failedCount = 0;
    let cancelledCount = 0;
    let totalTransactions = 0;

    stats.forEach((s) => {
      totalTransactions += s.count;
      if (s._id === "completed") {
        verifiedRevenue += s.totalAmount;
        completedCount = s.count;
      } else if (s._id === "pending") {
        pendingCount = s.count;
      } else if (s._id === "failed") {
        failedCount = s.count;
      } else if (s._id === "cancelled") {
        cancelledCount = s.count;
      }
    });

    // Also count by book appearance from orders
    const appearanceStats = await BookOrder.aggregate([
      {
        $group: {
          _id: "$bookAppearance",
          total: { $sum: 1 },
          completed: {
            $sum: { $cond: [{ $eq: ["$paymentStatus", "completed"] }, 1, 0] },
          },
        },
      },
    ]);

    res.status(200).json({
      success: true,
      data: {
        verifiedRevenue,
        completedCount,
        pendingCount,
        failedCount,
        cancelledCount,
        totalTransactions,
        appearanceBreakdown: appearanceStats,
        currency: "NPR",
      },
    });
  } catch (error) {
    console.error("[getPaymentSummary] Error:", error);
    next(error);
  }
};

// -------------------------------------------------------------
// 3. GET /api/admin/payments/:id
// Get single payment details with full audit log and raw eSewa payload
// -------------------------------------------------------------
exports.getPaymentById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const payment = await Payment.findById(id)
      .populate("user", "fullName email phone role avatar createdAt")
      .populate(
        "order",
        "orderId customerName customerEmail customerPhone bookAppearance pickupLocation paymentStatus orderStatus createdAt updatedAt"
      )
      .populate("book");

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment record not found.",
      });
    }

    res.status(200).json({
      success: true,
      data: payment,
    });
  } catch (error) {
    console.error("[getPaymentById] Error:", error);
    next(error);
  }
};

// -------------------------------------------------------------
// 4. POST /api/admin/payments/:id/re-verify
// Superadmin trigger to re-verify payment with eSewa servers
// -------------------------------------------------------------
exports.reverifyPaymentWithEsewa = async (req, res, next) => {
  try {
    const { id } = req.params;

    const payment = await Payment.findById(id).populate("order");
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment not found.",
      });
    }

    // Call eSewa Server-Side Status API
    const serverCheck = await esewaService.verifyServerStatus(
      payment.totalAmount,
      payment.transactionUuid
    );

    if (serverCheck.verified) {
      payment.status = "completed";
      payment.transactionCode = serverCheck.refId || payment.transactionCode || `REF-${Date.now()}`;
      payment.verifiedAt = new Date();
      payment.verifiedBy = `admin_reverify_${req.user?.email || "superadmin"}`;
      payment.esewaResponseRaw = serverCheck.data;
      await payment.save();

      if (payment.order) {
        payment.order.paymentStatus = "completed";
        payment.order.esewaTransactionCode = payment.transactionCode;
        payment.order.orderStatus =
          payment.order.bookAppearance === "physical"
            ? "ready_for_pickup"
            : "confirmed";
        await payment.order.save();
      }

      return res.status(200).json({
        success: true,
        message: "Payment successfully verified against eSewa servers!",
        data: payment,
      });
    } else {
      payment.esewaResponseRaw = serverCheck.data;
      if (serverCheck.status === "CANCELED") {
        payment.status = "cancelled";
      } else if (serverCheck.status === "FAILED") {
        payment.status = "failed";
      }
      await payment.save();

      return res.status(200).json({
        success: false,
        message: `eSewa reported status: ${serverCheck.status || "UNVERIFIED"}`,
        data: payment,
      });
    }
  } catch (error) {
    console.error("[reverifyPaymentWithEsewa] Error:", error);
    next(error);
  }
};
