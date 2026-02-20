const SOSEvent = require('../models/SOSEvent');
const { v4: uuidv4 } = require('uuid');
const whatsappBridge = require('../utils/whatsappBridge');

exports.startSOS = async (req, res) => {
    try {
        const { victimId, institution, location, mapsLink, contacts } = req.body;
        const publicId = uuidv4().substring(0, 8); // Short readable ID

        const newEvent = new SOSEvent({
            publicId,
            victimId,
            institution,
            location,
            mapsLink
        });

        await newEvent.save();

        // 📲 Trigger Automatic WhatsApp Alerts via Python Service
        if (contacts && contacts.length > 0) {
            const liveTrackLink = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/sos-track/${publicId}`;
            const alertMessage = `🚨 EMERGENCY ALERT 🚨\nI am in danger. Please help immediately!\n\n📍 Live Location:\n${mapsLink}\n\n(Real-time tracking started)\nTrack me live: ${liveTrackLink}\n\nSent via SafeVoice`;

            contacts.forEach(contact => {
                whatsappBridge.sendWhatsAppAlert(contact.phone, alertMessage)
                    .catch(err => console.error(`WhatsApp Alert Failed for ${contact.phone}:`, err));
            });
        }

        res.status(201).json({ success: true, publicId, message: "SOS Session Started & Alerts Triggered" });
    } catch (err) {
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
