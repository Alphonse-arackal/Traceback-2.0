import "dotenv/config";
import connectDB from "../config/db.js";
import User from "../models/User.js";

const promoteAdmin = async () => {
  try {
    // Get email from command-line argument
    const email = process.argv[2]?.toLowerCase().trim();

    if (!email) {
      console.error("Please provide an email address.");
      console.log(
        "Usage: node scripts/promoteAdmin.js your-email@gmail.com"
      );
      process.exitCode = 1;
      return;
    }

    // Connect to MongoDB
    await connectDB();

    // Find existing user
    const user = await User.findOne({ email });

    if (!user) {
      console.error("User not found.");
      console.log("Log in to TraceBack with this Google account first.");
      process.exitCode = 1;
      return;
    }

    // Promote user to Super Admin
    user.role = "admin";
    user.accountStatus = "active";

    await user.save();

    console.log("\n================================");
    console.log("SUPER ADMIN CREATED SUCCESSFULLY");
    console.log("================================");
    console.log("Name:", user.name);
    console.log("Email:", user.email);
    console.log("Role:", user.role);
    console.log("Status:", user.accountStatus);
    console.log("================================\n");

  } catch (error) {
    console.error("Admin creation failed:", error.message);
    process.exitCode = 1;
  } finally {
    const mongoose = await import("mongoose");
    await mongoose.default.disconnect();
  }
};

promoteAdmin();