const Complaint = require('../models/Complaint');

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
