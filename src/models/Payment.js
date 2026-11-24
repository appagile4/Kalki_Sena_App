const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "BookOrder",
      required: true,
      index: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    book: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Book",
      default: null,
    },
    paymentMethod: {
      type: String,
      enum: ["esewa", "khalti", "bank", "qr"],
      default: "esewa",
    },
    transactionUuid: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    transactionCode: {
      type: String,
      default: "",
      trim: true,
      index: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    taxAmount: {
      type: Number,
      default: 0,
    },
    totalAmount: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      default: "NPR",
    },
    status: {
      type: String,
      enum: ["pending", "completed", "failed", "cancelled"],
      default: "pending",
      index: true,
    },
    signature: {
      type: String,
      default: "",
    },
    bookingUrl: {
      type: String,
      default: "",
    },
    esewaResponseRaw: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    verifiedAt: {
      type: Date,
      default: null,
    },
    verifiedBy: {
      type: String,
      default: "",
    },
    failureReason: {
      type: String,
      default: "",
    },
    environment: {
      type: String,
      enum: ["UAT", "PRODUCTION"],
      default: process.env.ESEWA_ENVIRONMENT || "UAT",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Payment", paymentSchema);
