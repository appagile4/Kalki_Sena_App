require("dotenv").config({ path: require("path").resolve(__dirname, "../../.env") });
const mongoose = require("mongoose");
const User = require("../models/User");

async function checkUsers() {
  await mongoose.connect(process.env.MONGO_URI);
  const admins = await User.find({ role: { $in: ["superadmin", "admin"] } }).select("+password");
  console.log("Found admins/superadmins count:", admins.length);
  for (const a of admins) {
    const isPwMatch1 = await a.matchPassword("SuperAdmin@123");
    const isPwMatch2 = await a.matchPassword("admin123");
    console.log({
      id: a._id.toString(),
      email: a.email,
      phone: a.phone,
      role: a.role,
      isVerified: a.isVerified,
      hasPassword: a.hasPassword,
      pwLength: a.password ? a.password.length : 0,
      matchesSuperAdmin123: isPwMatch1,
      matchesAdmin123: isPwMatch2,
    });
  }
  process.exit(0);
}

checkUsers().catch(console.error);
