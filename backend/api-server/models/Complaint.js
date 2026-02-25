const mongoose = require('mongoose');
console.log("SERVER_LOG: Complaint Schema Initialized");

const ComplaintSchema = new mongoose.Schema({

    caseId: {
        type: String,
        required: true,
        unique: true,
        index: true
    },

    victimId: {
        type: String,
        required: true
    },

    institution: {
        type: String,
        required: true
    },

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

    aiConfidence: {
        type: Number,
        default: 0
    },

    aiSummary: {
        type: String,
        default: ''
    },

    aiLabel: {
        type: String,  // raw AI weight label e.g. 'high', 'mid', 'low'
        default: ''
    },

    aiRawResponse: {
        type: mongoose.Schema.Types.Mixed,  // stores the full AI response JSON
        default: null
    },

    description: {
        type: String,
        required: true
    },

    location: {
        type: String
    },

    hasAudio: {
        type: Boolean,
        default: false
    },

    hasSOS: {
        type: Boolean,
        default: false
    },

    evidence: [{
        fileType: {
            type: String,
            enum: ['image', 'audio', 'video']
        },
        url: String,
        name: String
    }],

    date: {
        type: Date
    }

}, { timestamps: true });   // 🔥 This gives createdAt automatically

module.exports = mongoose.model('Complaint', ComplaintSchema);