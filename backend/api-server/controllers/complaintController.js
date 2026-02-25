const Complaint = require('../models/Complaint');
const mongoose = require('mongoose');
const axios = require('axios');

/* =====================================================
   CREATE COMPLAINT
===================================================== */
exports.createComplaint = async (req, res) => {
    console.log("SERVER_LOG: createComplaint endpoint reached!");

    const {
        victim_id,
        institution,
        type,
        description,
        location,
        hasAudio,
        hasSOS,
        date,
        evidence
    } = req.body;

    try {
        console.log("Incoming complaint request body:", req.body);


        const caseIdValue = "CMP-" + Date.now();

        const complaintData = {
            caseId: caseIdValue,
            victimId: victim_id || "ANONYMOUS",
            institution: institution || "General",
            type: type || "Other",
            description: description || "No description provided",
            location: location || "",
            hasAudio: Boolean(hasAudio),
            hasSOS: Boolean(hasSOS),
            date: date ? new Date(date) : new Date(),
            evidence: evidence || [],
            status: "submitted",
            priority: "medium",
            aiConfidence: 0
        };

        // Create document instance
        const newComplaint = new Complaint(complaintData);

        /* =====================================================
           AI PRIORITY ENGINE (Optional)
        ===================================================== */
        if (process.env.AI_SERVICE_URL) {
            try {
                const aiResponse = await axios.post(
                    `${process.env.AI_SERVICE_URL}/predict`,
                    { text: description }
                );

                const weight = aiResponse.data.weight;
                const confidence = aiResponse.data.confidence || 0;

                let aiPriority = "medium";

                if (typeof weight === "string") {
                    const normalized = weight.toLowerCase();
                    if (normalized === "high") aiPriority = "high";
                    else if (normalized === "mid") aiPriority = "medium";
                    else if (normalized === "low") aiPriority = "low";
                    else if (normalized === "emergency") aiPriority = "emergency";
                } else if (typeof weight === "number") {
                    if (weight > 70) aiPriority = "high";
                    else if (weight > 40) aiPriority = "medium";
                    else aiPriority = "low";
                }

                newComplaint.priority = aiPriority;
                newComplaint.aiConfidence = confidence;
                newComplaint.aiLabel = weight?.toString() || '';
                newComplaint.aiRawResponse = aiResponse.data;

                // Build a human-readable AI summary
                const summaryMap = {
                    'high': `AI detected high-severity indicators in this complaint. The language and context suggest serious conduct that may require immediate POSH IC investigation.`,
                    'emergency': `AI flagged this complaint as an EMERGENCY. Extreme distress markers detected. Immediate intervention is strongly recommended.`,
                    'mid': `AI analysis indicates moderate-severity indicators. Standard investigation procedures are recommended within the usual timelines.`,
                    'medium': `AI analysis indicates moderate-severity indicators. Standard investigation procedures are recommended within the usual timelines.`,
                    'low': `AI classified this complaint as low severity. Routine review is recommended. No immediate escalation required.`
                };
                newComplaint.aiSummary = summaryMap[weight?.toString().toLowerCase()] ||
                    `AI confidence: ${Math.round(confidence * 100)}%. Weight classification: ${weight}. Full analysis available in raw data.`;

                console.log("AI Priority:", aiPriority, "Confidence:", confidence);

            } catch (aiErr) {
                console.error("AI Service Error:", aiErr.message);
            }
        }

        // ✅ Save to DB
        const savedComplaint = await newComplaint.save();

        console.log("Complaint saved successfully:", savedComplaint.caseId);

        // ✅ Return clean response
        res.status(201).json({
            message: "Complaint created successfully",
            caseId: savedComplaint.caseId,
            mongoId: savedComplaint._id,
            priority: savedComplaint.priority
        });

    } catch (err) {
        console.error("CRITICAL ERROR in createComplaint:", err);
        res.status(500).json({
            message: err.message
        });
    }
};


/* =====================================================
   GET COMPLAINT BY ID (Mongo ID OR CMP-XXXX)
===================================================== */
exports.getComplaintById = async (req, res) => {
    try {
        const { id } = req.params;
        let complaint = null;

        // If Mongo ObjectId
        if (mongoose.Types.ObjectId.isValid(id)) {
            complaint = await Complaint.findById(id);
        }

        // If not found, try caseId
        if (!complaint) {
            complaint = await Complaint.findOne({ caseId: id });
        }

        if (!complaint) {
            return res.status(404).json({ message: "Complaint not found" });
        }

        res.status(200).json(complaint);

    } catch (err) {
        console.error("Fetch by ID Error:", err);
        res.status(500).json({ message: err.message });
    }
};


/* =====================================================
   GET COMPLAINTS BY INSTITUTION
===================================================== */
exports.getComplaintsByInstitution = async (req, res) => {
    const { institution } = req.params;

    try {
        const complaints = await Complaint
            .find({ institution })
            .sort({ createdAt: -1 });

        res.status(200).json(complaints);

    } catch (err) {
        console.error("Fetch by Institution Error:", err);
        res.status(500).json({ message: err.message });
    }
};


/* =====================================================
   GET COMPLAINTS BY VICTIM
===================================================== */
exports.getComplaintsByVictim = async (req, res) => {
    const { victimId } = req.params;

    try {
        const complaints = await Complaint
            .find({ victimId })
            .sort({ createdAt: -1 });

        res.status(200).json(complaints);

    } catch (err) {
        console.error("Fetch by Victim Error:", err);
        res.status(500).json({ message: err.message });
    }
};


/* =====================================================
   TRANSPARENCY DASHBOARD DATA
===================================================== */
exports.getTransparencyData = async (req, res) => {
    try {
        const stats = await Complaint.aggregate([
            {
                $group: {
                    _id: "$institution",
                    total: { $sum: 1 },
                    resolved: {
                        $sum: {
                            $cond: [{ $eq: ["$status", "closed"] }, 1, 0]
                        }
                    },
                    reviewing: {
                        $sum: {
                            $cond: [
                                { $in: ["$status", ["under_review", "verified"]] },
                                1,
                                0
                            ]
                        }
                    }
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
                            {
                                $divide: [
                                    "$resolved",
                                    {
                                        $cond: [
                                            { $eq: ["$total", 0] },
                                            1,
                                            "$total"
                                        ]
                                    }
                                ]
                            },
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