const Complaint = require('../models/Complaint');
const mongoose = require('mongoose');
const axios = require('axios');

exports.createComplaint = async (req, res) => {
    const { victim_id, institution, type, description, location, hasAudio, hasSOS, date, evidence } = req.body;

    try {
        console.log("Incoming complaint request body:", req.body);

        if (!victim_id) {
            console.error("Missing victim_id");
            return res.status(400).json({ message: "Victim Identity Required" });
        }

        const complaintIdValue = "CMP-" + Date.now();
        console.log("Calculated complaintIdValue:", complaintIdValue);

        const complaintData = {
            complaintId: complaintIdValue,
            victimId: victim_id,
            institution: institution,
            type: type,
            description: description,
            location: location,
            hasAudio: !!hasAudio,
            hasSOS: !!hasSOS,
            date: date,
            evidence: evidence || []
        };

        console.log("Construction data for new Complaint:", complaintData);

        const newComplaint = new Complaint(complaintData);

        // AI Priority (Optional)
        let aiPriority = "medium";

        if (process.env.AI_SERVICE_URL) {
            try {
                const aiResponse = await axios.post(
                    `${process.env.AI_SERVICE_URL}/predict`,
                    { text: description }
                );

                const weight = aiResponse.data.weight;

                if (typeof weight === "number") {
                    if (weight > 70) aiPriority = "high";
                    else if (weight > 40) aiPriority = "medium";
                    else aiPriority = "low";
                }
            } catch (err) {
                console.error("AI Service Error:", err.message);
            }
        }

        newComplaint.priority = aiPriority;

        await newComplaint.save();

        res.status(201).json({
            message: "Complaint created successfully",
            complaintId: complaintIdValue,
            priority: aiPriority
        });

    } catch (err) {
        console.error("Full Complaint Error Object:", err);
        if (err.errors) {
            console.error("Mongoose Validation Errors:", err.errors);
        }
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
                }
            },
            {
                $project: {
                    _id: 0,
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
        res.status(200).json(stats);
    } catch (err) {
        console.error("Transparency Data Error:", err);
        res.status(500).json({ message: err.message });
    }
};

exports.getComplaintsByInstitution = async (req, res) => {
    const { institution } = req.params;
    try {
        const complaints = await Complaint.find({ institution }).sort({ created_at: -1 });
        res.status(200).json(complaints);
    } catch (err) {
        console.error("Fetch by Institution Error:", err);
        res.status(500).json({ message: err.message });
    }
};

exports.getComplaintsByVictim = async (req, res) => {
    const { victimId } = req.params;
    try {
        const complaints = await Complaint.find({ victimId }).sort({ created_at: -1 });
        res.status(200).json(complaints);
    } catch (err) {
        console.error("Fetch by Victim Error:", err);
        res.status(500).json({ message: err.message });
    }
};