require("dotenv").config({ path: require("path").resolve(__dirname, "../../.env") });
const mongoose = require("mongoose");
const User = require("../models/User");

const SUPERADMIN_DATA = {
  fullName: process.env.SUPERADMIN_NAME || "Super Admin",
  email: (process.env.SUPERADMIN_EMAIL || "superadmin@kalkisena.org").toLowerCase().trim(),
  phone: process.env.SUPERADMIN_PHONE || "+91 9999999999",
  password: process.env.SUPERADMIN_PASSWORD || "SuperAdmin@123",
  role: "superadmin",
  gender: "Male",
  dob: "01/01/1990",
  isVerified: true,
  hasPassword: true,
  authProvider: "local",
};

const seedSuperadmin = async () => {
  try {
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
      throw new Error("MONGO_URI is missing in Backend/.env file");
    }

    console.log("Connecting to MongoDB...");
    await mongoose.connect(mongoUri);
    console.log("MongoDB Connected Successfully.");

    // Check if superadmin already exists
    let user = await User.findOne({ email: SUPERADMIN_DATA.email }).select("+password");

    if (user) {
      console.log(`User with email '${SUPERADMIN_DATA.email}' already exists. Updating to Superadmin...`);
      user.fullName = SUPERADMIN_DATA.fullName;
      user.role = "superadmin";
      user.isVerified = true;
      user.hasPassword = true;
      user.password = SUPERADMIN_DATA.password; // pre-save hook will hash it
      if (!user.phone) user.phone = SUPERADMIN_DATA.phone;
      await user.save();
      console.log("Superadmin updated successfully.");
    } else {
      console.log("Creating new Superadmin user...");
      user = await User.create(SUPERADMIN_DATA);
      console.log("Superadmin created successfully.");
    }

    console.log("\n=========================================");
    console.log("   SUPERADMIN CREDENTIALS SEEDED");
    console.log("=========================================");
    console.log(`   Email:    ${SUPERADMIN_DATA.email}`);
    console.log(`   Password: ${SUPERADMIN_DATA.password}`);
    console.log(`   Role:     ${user.role}`);
    console.log(`   ID:       ${user._id}`);
    console.log("=========================================\n");

    process.exit(0);
  } catch (error) {
    console.error("Error seeding superadmin:", error.message);
    process.exit(1);
  }
};

seedSuperadmin();
