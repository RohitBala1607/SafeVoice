const Complaint = require('../models/Complaint');
const axios = require('axios');

exports.createComplaint = async (req, res) => {
    const { id, victim_id, institution, type, description, location, has_audio, has_sos, date } = req.body;

    try {
        // 1. Create complaint instance
        const newComplaint = new Complaint({
            complaintId: id,
            victimId: victim_id,
            institution,
            type,
            description,
            location,
            has_audio,
            has_sos,
            date
        });

        // 2. Call AI Service for priority prediction
        let aiPriority = 'medium'; // Default
        try {
            const aiResponse = await axios.post(`${process.env.AI_SERVICE_URL}/predict`, {
                text: description
            });

            const weight = aiResponse.data.weight;
            if (typeof weight === 'string') {
                aiPriority = weight.toLowerCase();
            } else if (typeof weight === 'number') {
                if (weight > 70) aiPriority = 'high';
                else if (weight > 40) aiPriority = 'medium';
                else aiPriority = 'low';
            }
        } catch (aiErr) {
            console.error('AI Service Error:', aiErr.message);
        }

        // 3. Set priority and save
        newComplaint.priority = aiPriority;
        await newComplaint.save();

        res.status(201).json({
            message: 'Complaint created and prioritized',
            id,
            predictedPriority: aiPriority
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.getComplaintsByInstitution = async (req, res) => {
    const { institution } = req.params;
    try {
        const complaints = await Complaint.find({ institution });

        // Manual sort by priority
        const priorityOrder = { 'emergency': 0, 'high': 1, 'medium': 2, 'low': 3 };
        complaints.sort((a, b) => {
            if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
                return priorityOrder[a.priority] - priorityOrder[b.priority];
            }
            return new Date(b.created_at) - new Date(a.created_at);
        });

        res.json(complaints);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.getTransparencyData = async (req, res) => {
    try {
        const stats = await Complaint.aggregate([
            {
                $group: {
                    _id: "$institution",
                    total: { $sum: 1 },
                    resolved: { $sum: { $cond: [{ $eq: ["$status", "closed"] }, 1, 0] } },
                    reviewing: { $sum: { $cond: [{ $in: ["$status", ["under_review", "verified"]] }, 1, 0] } },
                    // Placeholder for avgDays as it depends on status changes tracking which we don't have yet
                    // But we can calculate a pseudo score based on resolved/total
                }
            },
            {
                $project: {
                    name: "$_id",
                    total: 1,
                    resolved: 1,
                    reviewing: 1,
                    score: {
                        $multiply: [
                            { $divide: ["$resolved", { $cond: [{ $eq: ["$total", 0] }, 1, "$total"] }] },
                            100
                        ]
                    }
                }
            }
        ]);
        res.json(stats);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
