const Complaint = require('../models/Complaint');
const AuthorityRecord = require('../models/AuthorityRecord');
const Institution = require('../models/Institution');

exports.getOversightStats = async (req, res) => {
    try {
        const stats = await Complaint.aggregate([
            {
                $group: {
                    _id: "$institution",
                    totalReports: { $sum: 1 },
                    totalResolved: { $sum: { $cond: [{ $eq: ["$status", "closed"] }, 1, 0] } },
                    categories: { $push: "$type" },
                    priorities: { $push: "$priority" }
                }
            }
        ]);

        // Process categories and priorities into counts for each institution
        const formattedStats = stats.map(s => {
            const categoryCounts = s.categories.reduce((acc, cat) => {
                acc[cat] = (acc[cat] || 0) + 1;
                return acc;
            }, {});

            const priorityCounts = s.priorities.reduce((acc, prio) => {
                acc[prio] = (acc[prio] || 0) + 1;
                return acc;
            }, {});

            const categoriesArray = Object.entries(categoryCounts).map(([type, count]) => ({
                type,
                count
            }));

            return {
                institution: s._id,
                totalReports: s.totalReports,
                totalResolved: s.totalResolved,
                categories: categoriesArray,
                priorityStats: priorityCounts
            };
        });

        res.status(200).json({
            success: true,
            stats: formattedStats
        });
    } catch (err) {
        console.error("Oversight Stats Error:", err);
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.getInstitutionRecords = async (req, res) => {
    try {
        const { institutionName } = req.params;
        // Allows viewing the specific institution's detailed cases from the Global Oversight view
        const records = await Complaint.find({ institution: institutionName })
            .select('-__v') // Exclude internal versioning field
            .sort({ createdAt: -1 }); // Newest first

        res.status(200).json({
            success: true,
            records
        });
    } catch (err) {
        console.error("Institution Records Error:", err);
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.getAuthorityRecords = async (req, res) => {
    try {
        const { priority } = req.query;

        // Enforce RBAC: Get institution name using the logged-in authority's orgId
        const authorityOrgId = req.authority.institutionId;

        // Try to find a matching institution - but don't fail if not found
        const institution = await Institution.findOne({ orgId: authorityOrgId });

        // If institution found, scope to it; otherwise show all complaints (global view)
        let complaintQuery = {};
        if (institution) {
            complaintQuery.institution = institution.orgName;
        }
        if (priority) complaintQuery.priority = priority;

        const complaints = await Complaint.find(complaintQuery).sort({ created_at: -1 });
        const complaintIds = complaints.map(c => c._id);

        // 3. Fetch authority records for these complaints using complaintRef
        const records = await AuthorityRecord.find({
            complaintRef: { $in: complaintIds }
        });

        // Map records by complaint ID (string) for easy access
        const recordMap = {};
        records.forEach(r => {
            recordMap[r.complaintRef.toString()] = r;
        });

        const fullData = complaints.map(complaint => {
            const rec = recordMap[complaint._id.toString()];
            if (rec) {
                const recObj = rec.toObject();
                recObj.complaintRef = complaint; // Embed full complaint
                return recObj;
            } else {
                return {
                    _id: `new_${complaint._id}`,
                    complaintRef: complaint,
                    institutionId: req.authority.institutionId,
                    reviewedBy: null,
                    internalPriority: complaint.priority === 'emergency' ? 'CRITICAL' :
                        complaint.priority === 'high' ? 'HIGH' :
                            complaint.priority === 'low' ? 'LOW' : 'MEDIUM',
                    investigationStatus: complaint.status === 'closed' ? 'CLOSED' : 'PENDING_REVIEW',
                    confidentialNotes: "",
                    createdAt: complaint.created_at || complaint.createdAt,
                    updatedAt: complaint.created_at || complaint.createdAt
                };
            }
        });

        // 4. Group by institution name
        const groupedRecords = fullData.reduce((acc, record) => {
            const instName = record.complaintRef?.institution || "Other";
            if (!acc[instName]) acc[instName] = [];
            acc[instName].push(record);
            return acc;
        }, {});

        // 5. Sort each group: CRITICAL -> HIGH -> MEDIUM -> LOW
        const priorityScore = { "CRITICAL": 0, "HIGH": 1, "MEDIUM": 2, "LOW": 3 };
        Object.keys(groupedRecords).forEach(inst => {
            groupedRecords[inst].sort((a, b) => {
                const scoreA = priorityScore[a.internalPriority] ?? 3;
                const scoreB = priorityScore[b.internalPriority] ?? 3;
                if (scoreA !== scoreB) {
                    return scoreA - scoreB;
                }
                return new Date(b.createdAt) - new Date(a.createdAt);
            });
        });

        res.status(200).json({
            success: true,
            records: groupedRecords
        });
    } catch (err) {
        console.error("Fetch Authority Records Error:", err);
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.closeCase = async (req, res) => {
    try {
        const { complaintId } = req.params;
        const { resolutionNote } = req.body;

        const complaint = await Complaint.findById(complaintId);
        if (!complaint) {
            return res.status(404).json({ success: false, message: "Complaint not found" });
        }

        // Mark the complaint as closed
        complaint.status = 'closed';
        await complaint.save();

        // Also update the AuthorityRecord if one exists
        const record = await AuthorityRecord.findOne({ complaintRef: complaintId });
        if (record) {
            record.investigationStatus = 'CLOSED';
            if (resolutionNote) {
                record.confidentialNotes = (record.confidentialNotes ? record.confidentialNotes + '\n\n' : '') + `[CLOSED] ${resolutionNote}`;
            }
            record.actionsTaken.push({
                action: resolutionNote || 'Case marked as completed by Authority.',
                authorName: req.authority.name || 'Authority',
                date: new Date()
            });
            await record.save();
        }

        res.status(200).json({ success: true, message: "Case closed successfully", complaintId });
    } catch (err) {
        console.error("Close Case Error:", err);
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.verifyRecord = async (req, res) => {
    try {
        const { id } = req.params;
        const authorityId = req.authority.id;

        let record = await AuthorityRecord.findById(id);

        if (!record) {
            // If the record doesn't exist yet (it was a "padding" record), create it
            // The frontend should pass the complaintId (the ObjectId) if it's a new record
            const { complaintId } = req.body;
            if (!complaintId) {
                return res.status(400).json({ success: false, message: "Complaint ObjectID required for new record verification" });
            }

            record = new AuthorityRecord({
                complaintRef: complaintId,
                institutionId: req.authority.institutionId,
                reviewedBy: authorityId,
                internalPriority: "MEDIUM",
                investigationStatus: "VERIFIED",
                confidentialNotes: "Report verified by Authority."
            });
        } else {
            record.investigationStatus = "VERIFIED";
            record.reviewedBy = authorityId;
            if (!record.confidentialNotes) {
                record.confidentialNotes = "Report verified by Authority.";
            }
        }

        await record.save();

        res.status(200).json({
            success: true,
            message: "Record verified successfully",
            record
        });
    } catch (err) {
        console.error("Verify Record Error:", err);
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.updateRecord = async (req, res) => {
    try {
        const { id } = req.params;
        const { investigationStatus, internalPriority, confidentialNotes, complaintId } = req.body;
        const authorityId = req.authority.id;

        let record = await AuthorityRecord.findById(id);

        if (!record) {
            // Create if new (padding record)
            if (!complaintId) return res.status(400).json({ success: false, message: "Complaint ID required" });
            record = new AuthorityRecord({
                complaintRef: complaintId,
                institutionId: req.authority.institutionId,
                reviewedBy: authorityId
            });
        }

        if (investigationStatus) record.investigationStatus = investigationStatus;
        if (internalPriority) record.internalPriority = internalPriority;
        if (confidentialNotes !== undefined) record.confidentialNotes = confidentialNotes;
        record.reviewedBy = authorityId;

        await record.save();
        res.status(200).json({ success: true, record });
    } catch (err) {
        console.error("Update Record Error:", err);
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.addActionLog = async (req, res) => {
    try {
        const { id } = req.params;
        const { action, complaintId } = req.body;
        const authorityId = req.authority.id;
        const authorityName = req.authority.name || "Authority Member";

        let record = await AuthorityRecord.findById(id);

        if (!record) {
            if (!complaintId) return res.status(400).json({ success: false, message: "Complaint ID required" });
            record = new AuthorityRecord({
                complaintRef: complaintId,
                institutionId: req.authority.institutionId,
                reviewedBy: authorityId
            });
        }

        record.actionsTaken.push({
            action,
            authorName: authorityName,
            date: new Date()
        });

        await record.save();
        res.status(200).json({ success: true, record });
    } catch (err) {
        console.error("Add Action Error:", err);
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.getSOSAlerts = async (req, res) => {
    try {
        const SOSEvent = require('../models/SOSEvent');
        // Fetch all active SOS events from the dedicated SOS collection
        const alerts = await SOSEvent.find({ status: 'active' })
            .sort({ created_at: -1 });

        // Also get counts for oversight stats
        const totalSOS = await SOSEvent.countDocuments({});
        const resolvedSOS = await SOSEvent.countDocuments({ status: 'resolved' });

        res.status(200).json({
            success: true,
            alerts,
            stats: {
                total: totalSOS,
                active: alerts.length,
                resolved: resolvedSOS
            }
        });
    } catch (err) {
        console.error("SOS Alerts Error:", err);
        res.status(500).json({ success: false, message: err.message });
    }
};
