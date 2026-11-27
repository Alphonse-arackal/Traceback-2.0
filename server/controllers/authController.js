import User from "../models/User.js";
import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";

// Google client
const googleClient = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID
);

// Generate JWT
const generateToken = (userId) => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
};

// ============================================
// GOOGLE LOGIN
// ============================================
export const googleLogin = async (req, res) => {
  try {
    const { credential } = req.body;

    if (!credential) {
      return res.status(400).json({
        success: false,
        message: "Google credential is required",
      });
    }

    // Verify Google ID token
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    if (!payload || !payload.email || !payload.sub) {
      return res.status(401).json({
        success: false,
        message: "Invalid Google account",
      });
    }

    // Only accept verified Google email addresses
    if (payload.email_verified !== true) {
      return res.status(401).json({
        success: false,
        message: "Google email is not verified",
      });
    }

    const email = payload.email.toLowerCase();
    const googleId = payload.sub;

    // Find existing Google account
    let user = await User.findOne({ googleId });

    if (!user) {
      // Check whether the email already belongs to an account
      user = await User.findOne({ email });

      if (user) {
        // Prevent linking a different Google account
        if (user.googleId && user.googleId !== googleId) {
          return res.status(409).json({
            success: false,
            message: "This email is linked to another Google account",
          });
        }

        // Link existing account with Google
        user.googleId = googleId;
        user.authProvider = "google";
        user.isEmailVerified = true;

        await user.save();

      } else {
        // Create a new Google user
        user = await User.create({
          name: payload.name || email.split("@")[0],
          email,
          googleId,
          authProvider: "google",
          isEmailVerified: true,
          role: "user",
          accountStatus: "active",
        });
      }
    }

    // ============================================
    // CHECK ACCOUNT STATUS
    // ============================================

    if (user.accountStatus === "suspended") {
      return res.status(403).json({
        success: false,
        message: "Your account has been suspended. Please contact support.",
      });
    }

    // ============================================
    // GENERATE TRACEBACK JWT
    // ============================================

    const token = generateToken(user._id);

    return res.status(200).json({
      success: true,
      message: "Google login successful",
      token,

      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role || "user",
        accountStatus: user.accountStatus || "active",
      },
    });

  } catch (error) {
    console.error("Google login error:", error);

    return res.status(401).json({
      success: false,
      message: "Google authentication failed",
    });
  }
};