const mongoose = require("mongoose");

const institutionSchema = new mongoose.Schema(
    {
        orgId: {
            type: String,
            unique: true,
            required: true,
        },
        orgName: {
            type: String,
            required: true,
            trim: true,
        },
        orgType: {
            type: String,
            required: true,
        },
        adminName: {
            type: String,
            required: true,
        },
        adminEmail: {
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
            default: "institution",
        },
        isVerified: {
            type: Boolean,
            default: false,
        },
        status: {
            type: String,
            enum: ["PENDING", "APPROVED", "REJECTED"],
            default: "PENDING",
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("Institution", institutionSchema);