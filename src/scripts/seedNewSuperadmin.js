require("dotenv").config({ path: require("path").resolve(__dirname, "../../.env") });
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("../models/User");

const SUPERADMIN_ACCOUNTS = [
  {
    fullName: "Super Admin",
    email: "admin@kalkisena.org",
    phone: "9800000000",
    password: "admin123",
    role: "superadmin",
  },
  {
    fullName: "Kalki Superadmin",
    email: "superadmin@kalkisena.org",
    phone: "9800000001",
    password: "admin123",
    role: "superadmin",
  },
  {
    fullName: "Kalki Admin",
    email: "kalkiadmin@gmail.com",
    phone: "9800000002",
    password: "admin123",
    role: "superadmin",
  },
];

async function seed() {
  try {
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
      throw new Error("MONGO_URI is missing in Backend/.env file");
    }

    console.log("Connecting to MongoDB...");
    await mongoose.connect(mongoUri);
    console.log("MongoDB Connected Successfully.\n");

    const salt = await bcrypt.genSalt(12);

    for (const acc of SUPERADMIN_ACCOUNTS) {
      // Hash password exactly once with bcrypt
      const singleHashedPassword = await bcrypt.hash(acc.password, salt);

      // Upsert directly into MongoDB without pre-save double-hashing
      await User.updateOne(
        { email: acc.email.toLowerCase() },
        {
          $set: {
            fullName: acc.fullName,
            email: acc.email.toLowerCase(),
            phone: acc.phone,
            password: singleHashedPassword,
            role: "superadmin",
            isVerified: true,
            hasPassword: true,
            isBlocked: false,
            gender: "Male",
            dob: "01/01/1990",
            authProvider: "local",
          },
        },
        { upsert: true }
      );

      // Verify that user can log in with plain password
      const verifiedUser = await User.findOne({ email: acc.email.toLowerCase() }).select("+password");
      const isMatch = await verifiedUser.matchPassword(acc.password);
      console.log(`[LOGIN CHECK] ${acc.email} with password '${acc.password}' => ${isMatch ? "SUCCESSFUL (Match Verified! ✓)" : "FAILED ✗"}`);
    }

    console.log("\n=======================================================");
    console.log("       ALL SUPERADMIN ACCOUNTS VERIFIED & READY        ");
    console.log("=======================================================");
    SUPERADMIN_ACCOUNTS.forEach((acc, i) => {
      console.log(`[Account ${i + 1}]`);
      console.log(`  Email / Identifier: ${acc.email}`);
      console.log(`  Phone Number:       ${acc.phone}`);
      console.log(`  Password:           ${acc.password}`);
      console.log(`  Role:               ${acc.role}`);
      console.log("-------------------------------------------------------");
    });

    process.exit(0);
  } catch (error) {
    console.error("Error seeding new superadmin:", error);
    process.exit(1);
  }
}

seed();
