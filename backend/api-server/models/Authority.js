const mongoose = require("mongoose");

const authoritySchema = new mongoose.Schema(
  {
    authorityId: {
      type: String,
      unique: true,
      required: true,
    },
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
    },
    passwordHash: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      default: "authority", // POSH IC Member
    },
    institutionId: {
      type: String, // Links to institution collection
      required: true,
    },
    designation: {
      type: String, // e.g., "POSH IC Member", "HR Head"
      default: "IC Member",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastLogin: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Authority", authoritySchema);