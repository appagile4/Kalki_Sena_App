const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      index: true,
    },
    title: {
      type: String,
      required: [true, "Notification title is required"],
      trim: true,
    },
    body: {
      type: String,
      required: [true, "Notification body is required"],
      trim: true,
    },
    type: {
      type: String,
      enum: [
        "ORDER_PLACED",
        "ORDER_STATUS_UPDATE",
        "OUT_FOR_DELIVERY",
        "ORDER_DELIVERED",
        "ORDER_CANCELLED",
        "REFUND_PROCESSED",
        "DRIVER_KYC_APPROVED",
        "DRIVER_KYC_REJECTED",
        "BROADCAST",
        "PROMOTION",
        "SYSTEM",
      ],
      default: "SYSTEM",
      index: true,
    },
    data: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },
    readAt: {
      type: Date,
      default: null,
    },
    broadcastId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "BroadcastNotification",
      default: null,
    },
    deliveryStatus: {
      type: String,
      enum: ["pending", "sent", "delivered", "failed"],
      default: "pending",
    },
    receiptId: {
      type: String,
      default: "",
    },
    error: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

// Pre-save synchronization so both 'recipient' and 'user' fields are always populated
notificationSchema.pre("save", function () {
  if (this.recipient && !this.user) {
    this.user = this.recipient;
  } else if (this.user && !this.recipient) {
    this.recipient = this.user;
  }
});

// Indexes for high performance querying & sorting
notificationSchema.index({ recipient: 1, isRead: 1, createdAt: -1 });
notificationSchema.index({ user: 1, isRead: 1, createdAt: -1 });

module.exports = mongoose.model("Notification", notificationSchema);
