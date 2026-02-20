const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password_hash: { type: String, required: true },
    institution: { type: String },
    victimId: { type: String, unique: true },
    role: { type: String, enum: ['user', 'authority'], default: 'user' },
    created_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', UserSchema);
