const fs = require('fs');
const path = require('path');
const SOSEvent = require('../models/SOSEvent');
const { v4: uuidv4 } = require('uuid');
const smsBridge = require('../utils/smsBridge');

exports.startSOS = async (req, res) => {
    try {
        const { victimId, institution, location, mapsLink } = req.body;
        const publicId = uuidv4().substring(0, 8); // Short readable ID

        const newEvent = new SOSEvent({
            publicId,
            victimId,
            institution,
            location,
            mapsLink
        });

        await newEvent.save();

        res.status(201).json({ success: true, publicId, message: "SOS Started. Waiting for audio..." });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.uploadAudio = async (req, res) => {
    try {
        const { publicId, contacts: contactsRaw } = req.body;
        const contacts = contactsRaw ? JSON.parse(contactsRaw) : [];
        const audioFile = req.file;

        if (!audioFile) {
            return res.status(400).json({ message: "No audio file uploaded" });
        }

        const event = await SOSEvent.findOne({ publicId });
        if (!event) return res.status(404).json({ message: "SOS event not found" });

        // Rename and move file
        const ext = '.webm';
        const newFilename = `${publicId}_${Date.now()}${ext}`;
        const newPath = path.join('uploads', 'audio', newFilename);
        fs.renameSync(audioFile.path, newPath);

        const audioUrl = `${process.env.BACKEND_URL || 'http://localhost:5000'}/uploads/audio/${newFilename}`;
        event.evidenceUrl = audioUrl;
        await event.save();

        // 📲 Trigger Automatic SMS Alerts AFTER audio is received
        if (contacts && contacts.length > 0) {
            const liveTrackLink = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/sos-track/${publicId}`;

            // SMS is concise due to carrier limits
            const alertMessage = `🚨 EMERGENCY ALERT!\nI am in danger. Please help!\n\n📍 Maps: ${event.mapsLink}\n\n🎙️ Audio: ${audioUrl}\n\n📡 Track: ${liveTrackLink}`;

            contacts.forEach(contact => {
                smsBridge.sendSMSAlert(contact.phone, alertMessage)
                    .catch(err => console.error(`SMS Alert Failed for ${contact.phone}:`, err));
            });
        }

        res.json({ success: true, audioUrl, message: "Audio saved and SMS alerts triggered" });
    } catch (err) {
        console.error("Upload Error:", err);
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.updateLocation = async (req, res) => {
    try {
        const { publicId, location, mapsLink } = req.body;
        await SOSEvent.findOneAndUpdate(
            { publicId },
            {
                location,
                mapsLink,
                updated_at: Date.now()
            }
        );
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.getPublicTracking = async (req, res) => {
    try {
        const { publicId } = req.params;
        const event = await SOSEvent.findOne({ publicId });
        if (!event) return res.status(404).json({ message: "SOS session not found or resolved" });

        res.json(event);
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.resolveSOS = async (req, res) => {
    try {
        const { publicId } = req.body;
        await SOSEvent.findOneAndUpdate({ publicId }, { status: 'resolved' });
        res.json({ success: true, message: "SOS resolved" });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
