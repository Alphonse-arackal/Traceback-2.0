import express from "express";

import authMiddleware from "../middleware/authMiddleware.js";
import adminMiddleware from "../middleware/adminMiddleware.js";

import {
  getDashboardStats,
  getAllUsers,
  getAllReports,
  getReportById,
  deleteReport,
  suspendUser,
  reactivateUser,
} from "../controllers/adminController.js";

const router = express.Router();

// ============================================
// ADMIN DASHBOARD
// ============================================

// GET dashboard statistics
router.get(
  "/dashboard",
  authMiddleware,
  adminMiddleware,
  getDashboardStats
);

// ============================================
// USER MANAGEMENT
// ============================================

// GET all users
// Supports search, filtering and pagination
router.get(
  "/users",
  authMiddleware,
  adminMiddleware,
  getAllUsers
);

// Suspend user
router.patch(
  "/users/:id/suspend",
  authMiddleware,
  adminMiddleware,
  suspendUser
);

// Reactivate user
router.patch(
  "/users/:id/reactivate",
  authMiddleware,
  adminMiddleware,
  reactivateUser
);

// ============================================
// REPORT MANAGEMENT
// ============================================

// GET all reports
// Supports search, filtering and pagination
router.get(
  "/reports",
  authMiddleware,
  adminMiddleware,
  getAllReports
);

// GET individual report details
router.get(
  "/reports/:id",
  authMiddleware,
  adminMiddleware,
  getReportById
);

// DELETE report
// Deletes the Cloudinary image and MongoDB report
router.delete(
  "/reports/:id",
  authMiddleware,
  adminMiddleware,
  deleteReport
);

export default router;

