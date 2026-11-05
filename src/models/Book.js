const mongoose = require("mongoose");

const chapterSchema = new mongoose.Schema({
  chapterNumber: { type: Number, required: true },
  title: { type: String, required: true },
  pageRange: { type: String, required: true },
  excerpt: { type: String, default: "" },
});

const reviewSchema = new mongoose.Schema({
  reviewerName: { type: String, required: true },
  rating: { type: Number, default: 5 },
  heading: { type: String, default: "" },
  comment: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const clinicSchema = new mongoose.Schema({
  id: { type: String, required: true },
  name: { type: String, required: true },
  branch: { type: String, default: "" },
  distance: { type: String, default: "" },
  timing: { type: String, default: "9 AM - 6 PM" },
  address: { type: String, default: "" },
  phone: { type: String, default: "+977-1-4782000" },
  city: { type: String, default: "Kathmandu" },
  latitude: { type: Number, required: true, default: 27.6915 },
  longitude: { type: Number, required: true, default: 85.3420 },
});

const promoVideoSchema = new mongoose.Schema({
  title: { type: String, default: "Message from MR.666" },
  videoUrl: {
    type: String,
    default:
      "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
  },
  videoPublicId: { type: String, default: "" },
  thumbnailUrl: {
    type: String,
    default:
      "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=600&auto=format&fit=crop&q=80",
  },
  thumbnailPublicId: { type: String, default: "" },
  description: {
    type: String,
    default:
      "A visionary message from founder Jay Sah (MR. 666) regarding the youth economic revolution and free education mission.",
  },
  duration: { type: Number, default: 0 },
  bytes: { type: Number, default: 0 },
  updatedAt: { type: Date, default: Date.now },
});

const bookSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Book title is required"],
      trim: true,
    },
    subtitle: {
      type: String,
      default: "Buy the Book. Build a Gen Z Wave.",
    },
    author: {
      type: String,
      required: [true, "Author name is required"],
      trim: true,
    },
    coAuthor: {
      type: String,
      default: "Dr. Uma Shankar Prasad (Economist, T.V.)",
    },
    price: {
      type: Number,
      required: [true, "Book price is required"],
      default: 1000,
    },
    currency: {
      type: String,
      default: "NPR",
    },
    coverImage: {
      type: String,
      default: "/assets/images/bookcover.png",
    },
    authorAvatar: {
      type: String,
      default: "/assets/images/avatar.png",
    },
    rating: {
      type: Number,
      default: 4.3,
    },
    totalReviews: {
      type: Number,
      default: 124,
    },
    whyBuy: {
      title: {
        type: String,
        default: "Why you will buy this Book?",
      },
      leadText: {
        type: String,
        default:
          "Buy the Book. Build a Gen Z Wave. If you live outside of valley, By buying this book, you help create a Gen Z wave of 1 lakh students who will receive free coaching in Kathmandu Valley.",
      },
      points: [
        {
          type: String,
        },
      ],
      highlight: {
        type: String,
        default: "One book. One movement. One future.",
      },
    },
    aboutText: {
      type: String,
      default:
        "Economic Revolution to make Nepal A World Leader outlines systematic economic reforms, free universal healthcare, digital public infrastructure, and life-changing education.",
    },
    summaryText: {
      type: String,
      default:
        "After 10 lakh books are sold nationwide, within 30 days the Kalkiism Research and Training Center guarantees a central government that will implement economic policies to provide free health, education, and legal services to all 3 crore Nepalis.",
    },
    appearances: {
      type: [String],
      enum: ["physical", "digital"],
      default: ["physical", "digital"],
    },
    pickupClinics: [clinicSchema],
    chapters: [chapterSchema],
    reviews: [reviewSchema],
    promoVideo: {
      type: promoVideoSchema,
      default: () => ({}),
    },
    totalSold: {
      type: Number,
      default: 1420,
    },
    targetGoal: {
      type: Number,
      default: 1000000, // 10 Lakh books
    },
    stockQuantity: {
      type: Number,
      default: 50000,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Book", bookSchema);
