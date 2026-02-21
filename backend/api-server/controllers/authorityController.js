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
        const institution = await Institution.findOne({ orgId: authorityOrgId });

        if (!institution) {
            return res.status(404).json({ success: false, message: "Authorized institution not found" });
        }

        // 1. Fetch complaints matching ONLY the authorized institution and optional priority
        let complaintQuery = { institution: institution.orgName };
        if (priority) complaintQuery.priority = priority;

        const complaints = await Complaint.find(complaintQuery).sort({ created_at: -1 });
        const complaintIds = complaints.map(c => c._id);

        // 2. Fetch existing AuthorityRecords linked to those complaints
        const existingRecords = await AuthorityRecord.find({
            complaintId: { $in: complaintIds }
        }).populate('reviewedBy', 'name designation');

        // Create a map for quick lookup
        const recordMap = {};
        existingRecords.forEach(r => {
            recordMap[r.complaintId.toString()] = r;
        });

        // 3. Map over complaints and attach or mock the AuthorityRecord
        const records = complaints.map(complaint => {
            if (recordMap[complaint._id.toString()]) {
                // Used existing record
                const rec = recordMap[complaint._id.toString()].toObject();
                rec.complaintId = complaint; // Embed full complaint
                return rec;
            } else {
                // Return a padded default record for new cases
                return {
                    _id: 'new_' + complaint._id.toString(),
                    complaintId: complaint,
                    institutionId: authorityOrgId,
                    internalPriority: complaint.priority === 'emergency' || complaint.priority === 'high' ? 'HIGH' : 'MEDIUM',
                    investigationStatus: "PENDING_REVIEW",
                    confidentialNotes: "New complaint filed by victim. Pending initial review by Authority.",
                    createdAt: complaint.created_at || new Date(),
                };
            }
        });

        // 4. Sort: CRITICAL -> HIGH -> MEDIUM -> LOW
        const priorityScore = { "CRITICAL": 0, "HIGH": 1, "MEDIUM": 2, "LOW": 3 };
        records.sort((a, b) => {
            const scoreA = priorityScore[a.internalPriority] ?? 3;
            const scoreB = priorityScore[b.internalPriority] ?? 3;
            if (scoreA !== scoreB) {
                return scoreA - scoreB;
            }
            return new Date(b.createdAt) - new Date(a.createdAt);
        });

        res.status(200).json({
            success: true,
            records
        });
    } catch (err) {
        console.error("Fetch Authority Records Error:", err);
        res.status(500).json({ success: false, message: err.message });
    }
};
