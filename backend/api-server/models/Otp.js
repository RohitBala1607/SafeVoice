const mongoose = require('mongoose');

const OtpSchema = new mongoose.Schema({
    email: { type: String, required: true },
    otp: { type: String, required: true },
    name: { type: String },
    password_hash: { type: String },
    institution: { type: String },
    createdAt: { type: Date, default: Date.now, expires: 600 } // OTP expires in 10 minutes
});

module.exports = mongoose.model('Otp', OtpSchema);
