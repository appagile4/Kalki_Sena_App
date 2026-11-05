const os = require("os");
const dotenv = require("dotenv");

// Handle uncaught exceptions before loading app
process.on("uncaughtException", (err) => {
  console.error(`[FATAL] Uncaught Exception: ${err.message}`);
  console.error(err.stack);
  process.exit(1);
});

// Load environment variables
dotenv.config();

const app = require("./app");
const connectDB = require("./config/db");

const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || "0.0.0.0";

// Helper to get local network IP address
const getLocalIP = () => {
  const interfaces = os.networkInterfaces();
  let fallback = null;
  for (const name of Object.keys(interfaces)) {
    for (const net of interfaces[name]) {
      if (
        net.family === "IPv4" &&
        !net.internal &&
        !net.address.startsWith("169.254")
      ) {
        if (/wi-fi|ethernet|wlan|lan/i.test(name)) {
          return net.address;
        }
        if (!fallback) fallback = net.address;
      }
    }
  }
  return fallback || "localhost";
};

// Connect to Database & Start Server
const startServer = async () => {
  // Connect to MongoDB
  await connectDB();

  const server = app.listen(PORT, HOST, () => {
    const localIP = getLocalIP();
    console.log(
      `[Server] Running in ${process.env.NODE_ENV || "development"} mode`
    );
    console.log(`[Server] Local:   http://localhost:${PORT}`);
    console.log(`[Server] Network: http://${localIP}:${PORT}`);
  });

  // Handle unhandled promise rejections
  process.on("unhandledRejection", (err) => {
    console.error(`[ERROR] Unhandled Rejection: ${err.message}`);
    server.close(() => process.exit(1));
  });

  // Graceful shutdown on SIGTERM / SIGINT
  const gracefulShutdown = () => {
    console.log("\n[Server] Shutting down gracefully...");
    server.close(() => {
      console.log("[Server] Closed all connections.");
      process.exit(0);
    });
  };

  process.on("SIGTERM", gracefulShutdown);
  process.on("SIGINT", gracefulShutdown);
};

startServer();
