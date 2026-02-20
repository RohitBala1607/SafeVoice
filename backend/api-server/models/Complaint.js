const mongoose = require('mongoose');

const ComplaintSchema = new mongoose.Schema({
    complaintId: { type: String, required: true, unique: true },

    victimId: {
        type: String,
        required: true
    },

    institution: { type: String, required: true },

    type: {
        type: String,
        required: true
    },

    status: {
        type: String,
        enum: ['submitted', 'under_review', 'verified', 'closed'],
        default: 'submitted'
    },

    priority: {
        type: String,
        enum: ['low', 'medium', 'high', 'emergency'],
        default: 'medium'
    },

    description: { type: String, required: true },
    location: { type: String },

    hasAudio: { type: Boolean, default: false },
    hasSOS: { type: Boolean, default: false },

    // Multimedia Evidence
    evidence: [{
        fileType: { type: String, enum: ['image', 'audio', 'video'] },
        url: { type: String }, // Base64 or URI
        name: { type: String }
    }],

    date: { type: String },

    created_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Complaint', ComplaintSchema);