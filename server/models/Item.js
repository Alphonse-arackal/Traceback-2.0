
import mongoose from "mongoose";

const itemSchema = new mongoose.Schema(
  {
    // Item information
    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
      trim: true,
    },

    category: {
      type: String,
      required: true,
      enum: [
        "Wallets & Purses",
        "Electronics",
        "Keys",
        "Books & Stationery",
        "Bags",
        "Documents",
        "Personal Items",
        "Clothing",
        "Accessories",
        "Other",
      ],
    },

    // Lost or Found
    type: {
      type: String,
      required: true,
      enum: ["lost", "found"],
    },

    // Report owner
    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Item image
    image: {
      type: String,
      default: "",
    },

    imagePublicId: {
      type: String,
      default: "",
    },

    // Location information
    location: {
      name: {
        type: String,
        required: true,
      },

      coordinates: {
        latitude: {
          type: Number,
          required: true,
        },

        longitude: {
          type: Number,
          required: true,
        },
      },
    },

    // Date when item was lost or found
    date: {
      type: Date,
      required: true,
    },

    // Contact information
    contact: {
      name: {
        type: String,
        required: true,
      },

      phone: {
        type: String,
        required: true,
      },

      email: {
        type: String,
        default: "",
      },
    },

    // Report status
    status: {
      type: String,
      enum: ["active", "resolved"],
      default: "active",
    },
  },
  {
    timestamps: true,
  }
);

const Item = mongoose.model("Item", itemSchema);

export default Item;
