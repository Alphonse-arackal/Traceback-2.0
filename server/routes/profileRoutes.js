import express from "express";
import User from "../models/User.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// ============================================
// GET LOGGED-IN USER PROFILE
// ============================================
router.get("/", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select(
      "-googleId -__v"
    );

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    console.error("Get profile error:", error);

    res.status(500).json({
      message: "Failed to fetch profile",
    });
  }
});

// ============================================
// UPDATE LOGGED-IN USER PROFILE
// ============================================
router.put("/", authMiddleware, async (req, res) => {
  try {
    const { name, phone, location, bio, profilePicture } = req.body;

    const updates = {};

    if (name !== undefined) {
      if (!name.trim()) {
        return res.status(400).json({
          message: "Name cannot be empty",
        });
      }

      updates.name = name.trim();
    }

    if (phone !== undefined) updates.phone = phone.trim();
    if (location !== undefined) updates.location = location.trim();
    if (bio !== undefined) updates.bio = bio.trim();
    if (profilePicture !== undefined) {
      updates.profilePicture = profilePicture;
    }

    const user = await User.findByIdAndUpdate(
      req.userId,
      { $set: updates },
      {
        new: true,
        runValidators: true,
      }
    ).select("-googleId -__v");

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user,
    });
  } catch (error) {
    console.error("Update profile error:", error);

    res.status(500).json({
      message: "Failed to update profile",
    });
  }
});

export default router;