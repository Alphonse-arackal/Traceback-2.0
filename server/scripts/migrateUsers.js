import "dotenv/config";
import mongoose from "mongoose";

import connectDB from "../config/db.js";
import User from "../models/User.js";

const migrateUsers = async () => {
  try {
    await connectDB();

    // Add default role to existing users
    const roleResult = await User.updateMany(
      {
        $or: [
          { role: { $exists: false } },
          { role: null },
        ],
      },
      {
        $set: {
          role: "user",
        },
      }
    );

    // Add default account status to existing users
    const statusResult = await User.updateMany(
      {
        $or: [
          { accountStatus: { $exists: false } },
          { accountStatus: null },
        ],
      },
      {
        $set: {
          accountStatus: "active",
        },
      }
    );

    console.log("\n================================");
    console.log("USER MIGRATION COMPLETED");
    console.log("================================");

    console.log(
      "Roles updated:",
      roleResult.modifiedCount
    );

    console.log(
      "Account statuses updated:",
      statusResult.modifiedCount
    );

    console.log("================================\n");

  } catch (error) {
    console.error("Migration failed:", error.message);
    process.exitCode = 1;

  } finally {
    await mongoose.disconnect();
  }
};

migrateUsers();