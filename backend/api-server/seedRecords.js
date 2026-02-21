require('dotenv').config();
const mongoose = require('mongoose');
const Complaint = require('./models/Complaint');
const AuthorityRecord = require('./models/AuthorityRecord');
const Authority = require('./models/Authority');

async function seedRecords() {
    try {
        console.log("Connecting to DB...");
        await mongoose.connect(process.env.MONGODB_URI);

        const authority = await Authority.findOne({ email: 'jane.doe@example.com' });
        if (!authority) {
            console.log("Authority not found. Run seedAuthority.js first.");
            process.exit(1);
        }

        const complaints = await Complaint.find({ institution: authority.institutionId }).limit(3);
        if (complaints.length === 0) {
            console.log("No complaints found for this institution to link records to.");
            process.exit(1);
        }

        console.log(`Found ${complaints.length} complaints. Seeding priority records...`);

        const priorities = ['CRITICAL', 'HIGH', 'MEDIUM'];

        for (let i = 0; i < complaints.length; i++) {
            const existing = await AuthorityRecord.findOne({ complaintId: complaints[i]._id });
            if (!existing) {
                await AuthorityRecord.create({
                    complaintId: complaints[i]._id,
                    institutionId: authority.institutionId,
                    reviewedBy: authority._id,
                    internalPriority: priorities[i],
                    confidentialNotes: `Admin Note: This case requires ${priorities[i]} attention based on initial review.`,
                    investigationStatus: i === 0 ? 'INVESTIGATING' : 'PENDING_REVIEW',
                    actionsTaken: [{
                        action: "Initial Case Review Opened",
                        authorName: authority.name
                    }]
                });
                console.log(`Created ${priorities[i]} record for complaint ${complaints[i].complaintId}`);
            }
        }

        console.log("Seeding complete!");
        process.exit(0);
    } catch (err) {
        console.error("Error seeding records:", err);
        process.exit(1);
    }
}

seedRecords();
