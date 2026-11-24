
import express from "express";
import Item from "../models/Item.js";
import upload from "../middleware/uploadMiddleware.js";
import cloudinary from "../config/cloudinary.js";
import mongoose from "mongoose";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// ============================================
// GET ALL ITEMS
// Public - everyone can explore
// ============================================
router.get("/", async (req, res) => {
  try {
    const { type, category, search, status } = req.query;

    const filter = {};

    if (type) filter.type = type;
    if (category) filter.category = category;
    if (status) filter.status = status;

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    const items = await Item.find(filter).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: items.length,
      items,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch items",
      error: error.message,
    });
  }
});

// ============================================
// GET MY REPORTS
// Must be before /:id
// ============================================
router.get("/my-reports", authMiddleware, async (req, res) => {
  try {
    const items = await Item.find({
      reportedBy: req.userId,
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: items.length,
      items,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch your reports",
      error: error.message,
    });
  }
});

// ============================================
// GET SINGLE ITEM
// ============================================
router.get("/:id", async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid item ID",
      });
    }

    const item = await Item.findById(req.params.id);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Item not found",
      });
    }

    res.status(200).json({
      success: true,
      item,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch item",
      error: error.message,
    });
  }
});

// ============================================
// CREATE NEW ITEM
// Authentication required
// ============================================
router.post(
  "/",
  authMiddleware,
  upload.single("image"),
  async (req, res) => {
    try {
      const body = req.body || {};

      const requiredFields = [
        "title",
        "description",
        "type",
        "category",
      ];

      const missingFields = requiredFields.filter(
        (field) =>
          !body[field] ||
          (typeof body[field] === "string" && !body[field].trim())
      );

      if (missingFields.length > 0) {
        return res.status(400).json({
          success: false,
          message: "Please provide all required fields",
          missingFields,
        });
      }

      let imageUrl = "";
      let imagePublicId = "";

      if (req.file) {
        const result = await new Promise((resolve, reject) => {
          cloudinary.uploader
            .upload_stream(
              { folder: "traceback" },
              (error, result) => {
                if (error) reject(error);
                else resolve(result);
              }
            )
            .end(req.file.buffer);
        });

        imageUrl = result.secure_url;
        imagePublicId = result.public_id;
      }

      const newItem = await Item.create({
        ...body,

        // Ownership comes from verified JWT
        reportedBy: req.userId,

        image: imageUrl,
        imagePublicId,
      });

      res.status(201).json({
        success: true,
        message: "Item reported successfully",
        item: newItem,
      });
    } catch (error) {
      console.error("ITEM CREATION ERROR:", error);

      if (error.name === "ValidationError") {
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          error: error.message,
        });
      }

      res.status(500).json({
        success: false,
        message: "Failed to create item",
        error: error.message,
      });
    }
  }
);

// ============================================
// UPDATE ITEM
// Only owner can update
// ============================================
router.put(
  "/:id",
  authMiddleware,
  upload.single("image"),
  async (req, res) => {
    try {
      if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.status(400).json({
          success: false,
          message: "Invalid item ID",
        });
      }

      const existingItem = await Item.findById(req.params.id);

      if (!existingItem) {
        return res.status(404).json({
          success: false,
          message: "Item not found",
        });
      }

      if (
        !existingItem.reportedBy ||
        existingItem.reportedBy.toString() !== req.userId
      ) {
        return res.status(403).json({
          success: false,
          message: "You are not authorized to update this report",
        });
      }

      let imageUrl = existingItem.image;
      let imagePublicId = existingItem.imagePublicId;

      if (req.file) {
        const result = await new Promise((resolve, reject) => {
          cloudinary.uploader
            .upload_stream(
              { folder: "traceback" },
              (error, result) => {
                if (error) reject(error);
                else resolve(result);
              }
            )
            .end(req.file.buffer);
        });

        imageUrl = result.secure_url;
        imagePublicId = result.public_id;
      }

      const allowedFields = [
        "title",
        "description",
        "category",
        "type",
        "location",
        "date",
        "contact",
        "status",
      ];

      const updateData = {};

      allowedFields.forEach((field) => {
        if (req.body[field] !== undefined) {
          updateData[field] = req.body[field];
        }
      });

      updateData.image = imageUrl;
      updateData.imagePublicId = imagePublicId;

      const updatedItem = await Item.findByIdAndUpdate(
        req.params.id,
        { $set: updateData },
        {
          new: true,
          runValidators: true,
        }
      );

      // Delete old image after successful update
      if (req.file && existingItem.imagePublicId) {
        await cloudinary.uploader.destroy(
          existingItem.imagePublicId
        );
      }

      res.status(200).json({
        success: true,
        message: "Item updated successfully",
        item: updatedItem,
      });
    } catch (error) {
      console.error("ITEM UPDATE ERROR:", error);

      res.status(500).json({
        success: false,
        message: "Failed to update item",
        error: error.message,
      });
    }
  }
);

// ============================================
// DELETE ITEM
// Only owner can delete
// ============================================
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid item ID",
      });
    }

    const item = await Item.findById(req.params.id);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Item not found",
      });
    }

    if (
      !item.reportedBy ||
      item.reportedBy.toString() !== req.userId
    ) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to delete this report",
      });
    }

    if (item.imagePublicId) {
      await cloudinary.uploader.destroy(item.imagePublicId);
    }

    await Item.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "Item deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to delete item",
      error: error.message,
    });
  }
});

export default router;
