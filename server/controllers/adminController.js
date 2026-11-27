
import mongoose from "mongoose";

import User from "../models/User.js";
import Item from "../models/Item.js";
import cloudinary from "../config/cloudinary.js";

// ============================================
// ADMIN DASHBOARD OVERVIEW
// ============================================

export const getDashboardStats = async (req, res) => {
  try {
    const userFilter = { role: { $ne: "admin" } };

    const [
      totalUsers,
      totalReports,
      lostReports,
      foundReports,
      activeReports,
      resolvedReports,
      suspendedUsers,
      recentUsers,
      recentReports,
    ] = await Promise.all([
      User.countDocuments(userFilter),
      Item.countDocuments(),
      Item.countDocuments({ type: "lost" }),
      Item.countDocuments({ type: "found" }),
      Item.countDocuments({ status: "active" }),
      Item.countDocuments({ status: "resolved" }),
      User.countDocuments({
        ...userFilter,
        accountStatus: "suspended",
      }),

      User.find(userFilter)
        .select("name email profilePicture accountStatus createdAt")
        .sort({ createdAt: -1 })
        .limit(5)
        .lean(),

      Item.find()
        .select("title type status category location reportedBy createdAt")
        .populate("reportedBy", "name email")
        .sort({ createdAt: -1 })
        .limit(5)
        .lean(),
    ]);

    return res.status(200).json({
      success: true,
      message: "Dashboard statistics fetched successfully",

      stats: {
        totalUsers,
        totalReports,
        lostReports,
        foundReports,
        activeReports,
        resolvedReports,
        suspendedUsers,
      },

      recentUsers,
      recentReports,
    });

  } catch (error) {
    console.error("ADMIN DASHBOARD ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch dashboard statistics",
    });
  }
};

// ============================================
// GET ALL USERS
// Search, filter and pagination
// ============================================

export const getAllUsers = async (req, res) => {
  try {
    const {
      search = "",
      status = "all",
      page = 1,
      limit = 10,
    } = req.query;

    const currentPage = Math.max(1, parseInt(page, 10) || 1);

    const pageLimit = Math.min(
      50,
      Math.max(1, parseInt(limit, 10) || 10)
    );

    const filter = {
      role: { $ne: "admin" },
    };

    const searchTerm =
      typeof search === "string" ? search.trim() : "";

    if (searchTerm) {
      const escapedSearch = searchTerm.replace(
        /[.*+?^${}()|[\]\\]/g,
        "\\$&"
      );

      filter.$or = [
        { name: { $regex: escapedSearch, $options: "i" } },
        { email: { $regex: escapedSearch, $options: "i" } },
      ];
    }

    if (status === "active" || status === "suspended") {
      filter.accountStatus = status;
    }

    const totalUsers = await User.countDocuments(filter);

    const users = await User.find(filter)
      .select(
        "name email profilePicture accountStatus createdAt updatedAt"
      )
      .sort({ createdAt: -1 })
      .skip((currentPage - 1) * pageLimit)
      .limit(pageLimit)
      .lean();

    return res.status(200).json({
      success: true,
      users,

      pagination: {
        totalUsers,
        currentPage,
        totalPages: Math.ceil(totalUsers / pageLimit),
        pageLimit,
      },
    });

  } catch (error) {
    console.error("GET USERS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch users",
    });
  }
};

// ============================================
// GET ALL REPORTS
// Search, filter and pagination
// ============================================

export const getAllReports = async (req, res) => {
  try {
    const {
      search = "",
      type = "all",
      status = "all",
      page = 1,
      limit = 10,
    } = req.query;

    const currentPage = Math.max(1, parseInt(page, 10) || 1);

    const pageLimit = Math.min(
      50,
      Math.max(1, parseInt(limit, 10) || 10)
    );

    const filter = {};

    const searchTerm =
      typeof search === "string" ? search.trim() : "";

    if (searchTerm) {
      const escapedSearch = searchTerm.replace(
        /[.*+?^${}()|[\]\\]/g,
        "\\$&"
      );

      filter.$or = [
        { title: { $regex: escapedSearch, $options: "i" } },
        { description: { $regex: escapedSearch, $options: "i" } },
        { category: { $regex: escapedSearch, $options: "i" } },
      ];
    }

    if (type === "lost" || type === "found") {
      filter.type = type;
    }

    if (status === "active" || status === "resolved") {
      filter.status = status;
    }

    const totalReports = await Item.countDocuments(filter);

    const reports = await Item.find(filter)
      .select(
        "title description category type image location date contact status reportedBy createdAt updatedAt"
      )
      .populate("reportedBy", "name email profilePicture")
      .sort({ createdAt: -1 })
      .skip((currentPage - 1) * pageLimit)
      .limit(pageLimit)
      .lean();

    return res.status(200).json({
      success: true,
      message: "Reports fetched successfully",

      reports,

      pagination: {
        totalReports,
        currentPage,
        totalPages: Math.ceil(totalReports / pageLimit),
        pageLimit,
      },
    });

  } catch (error) {
    console.error("GET ALL REPORTS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch reports",
    });
  }
};

// ============================================
// GET SINGLE REPORT BY ID
// ============================================

export const getReportById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid report ID",
      });
    }

    const report = await Item.findById(id)
      .populate("reportedBy", "name email profilePicture")
      .lean();

    if (!report) {
      return res.status(404).json({
        success: false,
        message: "Report not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Report details fetched successfully",
      report,
    });

  } catch (error) {
    console.error("GET REPORT DETAILS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch report details",
    });
  }
};

// ============================================
// DELETE REPORT
// Delete image from Cloudinary and report from MongoDB
// ============================================

export const deleteReport = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate MongoDB ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid report ID",
      });
    }

    // Find report
    const report = await Item.findById(id);

    if (!report) {
      return res.status(404).json({
        success: false,
        message: "Report not found",
      });
    }

    // Delete image from Cloudinary if it exists
    if (report.imagePublicId) {
      const cloudinaryResult = await cloudinary.uploader.destroy(
        report.imagePublicId
      );

      // "not found" means the image is already absent,
      // so the database report can still be deleted.
      if (
        cloudinaryResult.result !== "ok" &&
        cloudinaryResult.result !== "not found"
      ) {
        throw new Error("Cloudinary image deletion failed");
      }
    }

    // Delete report from MongoDB
    await Item.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: "Report deleted successfully",
      deletedReport: {
        id: report._id,
        title: report.title,
        imageDeleted: Boolean(report.imagePublicId),
      },
    });

  } catch (error) {
    console.error("DELETE REPORT ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete report",
    });
  }
};

// ============================================
// SUSPEND USER
// ============================================

export const suspendUser = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID",
      });
    }

    if (id === req.userId) {
      return res.status(403).json({
        success: false,
        message: "You cannot suspend your own account",
      });
    }

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (user.role === "admin") {
      return res.status(403).json({
        success: false,
        message: "Admin accounts cannot be suspended",
      });
    }

    if (user.accountStatus === "suspended") {
      return res.status(400).json({
        success: false,
        message: "User is already suspended",
      });
    }

    const updatedUser = await User.findByIdAndUpdate(
      id,
      {
        $set: {
          accountStatus: "suspended",
        },
      },
      {
        new: true,
        runValidators: true,
      }
    ).select("name email accountStatus");

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "User suspended successfully",

      user: {
        id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        accountStatus: updatedUser.accountStatus,
      },
    });

  } catch (error) {
    console.error("SUSPEND USER ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to suspend user",
    });
  }
};

// ============================================
// REACTIVATE USER
// ============================================

export const reactivateUser = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID",
      });
    }

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (user.role === "admin") {
      return res.status(403).json({
        success: false,
        message: "Admin accounts cannot be modified here",
      });
    }

    if (user.accountStatus === "active") {
      return res.status(400).json({
        success: false,
        message: "User is already active",
      });
    }

    const updatedUser = await User.findByIdAndUpdate(
      id,
      {
        $set: {
          accountStatus: "active",
        },
      },
      {
        new: true,
        runValidators: true,
      }
    ).select("name email accountStatus");

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "User reactivated successfully",

      user: {
        id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        accountStatus: updatedUser.accountStatus,
      },
    });

  } catch (error) {
    console.error("REACTIVATE USER ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to reactivate user",
    });
  }
};
