const mongoose = require("mongoose");

const driverApplicationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },
    fullName: {
      type: String,
      required: [true, "Full name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      lowercase: true,
      trim: true,
      index: true,
    },
    phone: {
      type: String,
      trim: true,
      default: "",
    },
    dob: {
      type: String,
      required: [true, "Date of birth is required"],
      trim: true,
    },
    gender: {
      type: String,
      enum: ["Male", "Female", "Other"],
      required: [true, "Gender is required"],
      default: "Male",
    },
    memberId: {
      type: String,
      trim: true,
      default: "",
    },
    rideCity: {
      type: String,
      required: [true, "City is required"],
      trim: true,
    },
    vehicle: {
      vehicleType: {
        type: String,
        enum: ["Car", "Bike", "Scooter", "Taxi"],
        required: [true, "Vehicle type is required"],
        default: "Car",
      },
      make: {
        type: String,
        required: [true, "Vehicle make is required"],
        trim: true,
      },
      model: {
        type: String,
        required: [true, "Vehicle model is required"],
        trim: true,
      },
      manufactureYear: {
        type: String,
        required: [true, "Manufacture year is required"],
        trim: true,
      },
      color: {
        type: String,
        required: [true, "Vehicle color is required"],
        trim: true,
      },
      seatCount: {
        type: Number,
        required: [true, "Seat count is required"],
        default: 4,
      },
      licensePlate: {
        type: String,
        required: [true, "License plate number is required"],
        uppercase: true,
        trim: true,
      },
    },
    documents: {
      licenseFront: { type: String, default: "uploaded" },
      licenseBack: { type: String, default: "uploaded" },
      rcUploaded: { type: String, default: "uploaded" },
      insuranceUploaded: { type: String, default: "uploaded" },
      citizenshipFront: { type: String, default: "uploaded" },
      citizenshipBack: { type: String, default: "uploaded" },
      plateFront: { type: String, default: "uploaded" },
      plateBack: { type: String, default: "uploaded" },
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
      index: true,
    },
    rejectionReason: {
      type: String,
      default: "",
    },
    reviewedAt: {
      type: Date,
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("DriverApplication", driverApplicationSchema);
