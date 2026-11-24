const mongoose = require("mongoose");

const broadcastNotificationSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Broadcast title is required"],
      trim: true,
    },
    body: {
      type: String,
      required: [true, "Broadcast body is required"],
      trim: true,
    },
    targetAudience: {
      type: String,
      enum: ["all", "user", "driver", "doctor", "admin", "individual"],
      default: "all",
      index: true,
    },
    targetUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    targetEmail: {
      type: String,
      trim: true,
      default: "",
    },
    screen: {
      type: String,
      default: "Home",
    },
    data: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    priority: {
      type: String,
      enum: ["default", "high"],
      default: "high",
    },
    sound: {
      type: String,
      default: "default",
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    status: {
      type: String,
      enum: ["draft", "scheduled", "sending", "sent", "failed"],
      default: "sent",
      index: true,
    },
    scheduledAt: {
      type: Date,
      default: null,
    },
    sentAt: {
      type: Date,
      default: null,
    },
    metrics: {
      targetedCount: { type: Number, default: 0 },
      tokensCount: { type: Number, default: 0 },
      successCount: { type: Number, default: 0 },
      failureCount: { type: Number, default: 0 },
      tickets: [
        {
          token: String,
          ticketId: String,
          status: String,
          message: String,
          details: mongoose.Schema.Types.Mixed,
        },
      ],
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "BroadcastNotification",
  broadcastNotificationSchema
);
