const mongoose = require('mongoose');

const ComplaintSchema = new mongoose.Schema({
    institution: { type: String, required: true },
    type: {
        type: String,
        enum: [
            'Verbal Harassment',
            'Physical Harassment',
            'Visual Harassment',
            'Quid Pro Quo',
            'Hostile Work Environment',
            'Cyber Harassment',
            'Stalking',
            'Other'
        ],
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
    severity: { type: Number, min: 0, max: 100 },
    description: { type: String },
    location: { type: String },
    hasAudio: { type: Boolean, default: false },
    hasSOS: { type: Boolean, default: false },
    date: { type: String },
    created_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Complaint', ComplaintSchema);
