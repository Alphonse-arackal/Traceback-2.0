import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    googleId: {
      type: String,
      required: true,
      unique: true,
    },

    authProvider: {
      type: String,
      enum: ["google"],
      default: "google",
    },

    isEmailVerified: {
      type: Boolean,
      default: true,
    },

    // User role
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },

    // Account status
    accountStatus: {
      type: String,
      enum: ["active", "suspended"],
      default: "active",
    },

    // Editable profile information
    profilePicture: {
      type: String,
      default: "",
    },

    phone: {
      type: String,
      default: "",
      trim: true,
    },

    location: {
      type: String,
      default: "",
      trim: true,
    },

    bio: {
      type: String,
      default: "",
      trim: true,
      maxlength: 250,
    },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("User", userSchema);

export default User;