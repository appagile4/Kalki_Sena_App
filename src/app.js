const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const hpp = require("hpp");
const mongoSanitize = require("express-mongo-sanitize");
const rateLimit = require("express-rate-limit");
const authRoutes = require("./routes/authRoutes");
const bookRoutes = require("./routes/bookRoutes");
const videoRoutes = require("./routes/videoRoutes");
const { notFound, errorHandler } = require("./middleware/errorHandler");

const app = express();

// 1. Security Headers
app.use(helmet());

// 2. Cross-Origin Resource Sharing
app.use(
  cors({
    origin: process.env.CLIENT_URL || "*",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    credentials: true,
  })
);

// 3. Rate Limiting for API routes (Authentication/Login endpoints are exempt)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Generous limit for general API routes
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Completely exempt authentication endpoints (login, signup, oauth) from rate limiting
    return (
      req.originalUrl.includes("/api/auth") ||
      req.path.startsWith("/auth")
    );
  },
  message: {
    success: false,
    message: "Too many requests from this IP, please try again after 15 minutes.",
  },
});
app.use("/api", limiter);

// 4. Body Parsers (increased to 50mb for image/avatar uploads)
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// 5. Data Sanitization against NoSQL Query Injection & Parameter Pollution
// (Express 5 compatible in-place sanitization for req.body, req.params, req.query)
app.use((req, res, next) => {
  if (req.body) mongoSanitize.sanitize(req.body);
  if (req.params) mongoSanitize.sanitize(req.params);
  if (req.query) mongoSanitize.sanitize(req.query);
  next();
});
app.use(hpp());

// 6. Base & Health Check Routes
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Welcome to Kalki Sena API",
    status: "healthy",
  });
});

app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "API is active and running",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
  });
});

// 7. Mount feature routes
app.use("/api/auth", authRoutes);
app.use("/api/books", bookRoutes);
app.use("/api/videos", videoRoutes);

// 8. 404 & Central Error Handling
app.use(notFound);
app.use(errorHandler);

module.exports = app;
