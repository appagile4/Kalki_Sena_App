const mongoose = require("mongoose");

const bankDetailsSchema = new mongoose.Schema(
  {
    accountHolder: { type: String, default: "" },
    accountNumber: { type: String, default: "" },
    branchName: { type: String, default: "" },
    ifscCode: { type: String, default: "" },
  },
  { _id: false }
);

const bookOrderSchema = new mongoose.Schema(
  {
    orderId: {
      type: String,
      unique: true,
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    customerName: {
      type: String,
      required: [true, "Customer name is required"],
      trim: true,
    },
    customerEmail: {
      type: String,
      trim: true,
      default: "",
    },
    customerPhone: {
      type: String,
      trim: true,
      default: "",
    },
    book: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Book",
      default: null,
    },
    bookTitle: {
      type: String,
      default: "Economic Revolution to make Nepal A World Leader",
    },
    bookAppearance: {
      type: String,
      enum: ["physical", "digital"],
      required: [true, "Book appearance is required"],
    },
    pickupLocation: {
      type: String,
      default: "",
    },
    deliveryAddress: {
      type: String,
      default: "",
    },
    paymentMethod: {
      type: String,
      enum: ["esewa", "khalti", "qr", "bank"],
      required: [true, "Payment method is required"],
    },
    bankDetails: {
      type: bankDetailsSchema,
      default: null,
    },
    amount: {
      type: Number,
      required: true,
      default: 1000,
    },
    currency: {
      type: String,
      default: "NPR",
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "completed", "failed"],
      default: "completed",
    },
    orderStatus: {
      type: String,
      enum: [
        "confirmed",
        "processing",
        "ready_for_pickup",
        "shipped",
        "delivered",
        "cancelled",
      ],
      default: "confirmed",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("BookOrder", bookOrderSchema);
