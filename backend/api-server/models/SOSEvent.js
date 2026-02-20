const mongoose = require('mongoose');

const SOSEventSchema = new mongoose.Schema({
    publicId: { type: String, required: true, unique: true },
    victimId: { type: String, required: true }, // SV-ID
    institution: { type: String, required: true },
    location: {
        lat: { type: Number, required: true },
        lng: { type: Number, required: true }
    },
    status: { type: String, enum: ['active', 'resolved'], default: 'active' },
    mapsLink: { type: String },
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('SOSEvent', SOSEventSchema);
