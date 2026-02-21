require('dotenv').config();
const mongoose = require('mongoose');
const Authority = require('./models/Authority');
const Institution = require('./models/Institution');
const Complaint = require('./models/Complaint');
const AuthorityRecord = require('./models/AuthorityRecord');

async function testAPI() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Connected to DB.");

        const jane = await Authority.findOne({ email: 'jane.doe@example.com' });
        console.log("Found Jane:", jane.institutionId);

        const authorityOrgId = jane.institutionId;
        const institution = await Institution.findOne({ orgId: authorityOrgId });

        if (!institution) {
            console.log("Error: Authorized institution not found");
            process.exit(1);
        }

        console.log(`Resolved Inst: ${institution.orgName}`);

        let complaintQuery = { institution: institution.orgName };
        const complaints = await Complaint.find(complaintQuery).sort({ created_at: -1 });
        console.log(`Found ${complaints.length} complaints for this inst.`);

        const complaintIds = complaints.map(c => c._id);
        const existingRecords = await AuthorityRecord.find({
            complaintId: { $in: complaintIds }
        }).populate('reviewedBy', 'name designation');

        const recordMap = {};
        existingRecords.forEach(r => {
            recordMap[r.complaintId.toString()] = r;
        });

        const records = complaints.map(complaint => {
            if (recordMap[complaint._id.toString()]) {
                const rec = recordMap[complaint._id.toString()].toObject();
                rec.complaintId = complaint;
                return rec;
            } else {
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

        console.log(`Final Response Records Count: ${records.length}`);
        if (records.length > 0) {
            console.log("Sample record:", JSON.stringify(records[0], null, 2).substring(0, 300) + '...');
        }
        process.exit(0);
    } catch (err) {
        console.error("Error:", err);
        process.exit(1);
    }
}
testAPI();
