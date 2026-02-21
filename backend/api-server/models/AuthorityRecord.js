const mongoose = require("mongoose");

const authorityRecordSchema = new mongoose.Schema(
    {
        complaintId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Complaint',
            required: true,
        },
        institutionId: {
            type: String,
            required: true,
        },
        reviewedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Authority', // Which authority member reviewed this
        },
        internalPriority: {
            type: String,
            enum: ["CRITICAL", "HIGH", "MEDIUM", "LOW"],
            default: "MEDIUM",
            required: true,
        },
        confidentialNotes: {
            type: String, // Private notes only visible to authorities
        },
        actionsTaken: [{
            action: String,
            date: { type: Date, default: Date.now },
            authorName: String
        }],
        investigationStatus: {
            type: String,
            enum: ["PENDING_REVIEW", "INVESTIGATING", "ACTION_TAKEN", "CLOSED"],
            default: "PENDING_REVIEW"
        }
    },
    { timestamps: true }
);

module.exports = mongoose.model("AuthorityRecord", authorityRecordSchema);
