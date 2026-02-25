const mongoose = require('mongoose');
require('dotenv').config();
const Complaint = require('./models/Complaint');
const AuthorityRecord = require('./models/AuthorityRecord');

const uri = process.env.MONGODB_URI || 'mongodb+srv://SafeVoice_db_user:innovatrix@safevoice.m3dbv9v.mongodb.net/SafeVoice?retryWrites=true&w=majority&appName=SafeVoice';

mongoose.connect(uri).then(async () => {
    console.log("Connected to DB");

    // Look for the specific complaint
    const id = "CMP-1771658160658";
    console.log(`Searching for ID: ${id}`);

    let complaint = await Complaint.findOne({ caseId: id });
    if (!complaint) complaint = await Complaint.findById(id).catch(() => null);
    if (!complaint) complaint = await Complaint.findOne({ complaintId: id });

    if (complaint) {
        console.log("Found Complaint:", !!complaint);
    } else {
        console.log("Complaint not found in DB at all!");

        // Let's see all AuthorityRecords to understand what the frontend means by "c.complaintRef"
        const records = await AuthorityRecord.find().limit(2).populate('complaintRef');
        console.log("Sample Authority Records:");
        console.log(JSON.stringify(records, null, 2));
    }

    process.exit(0);
}).catch(err => {
    console.error(err);
    process.exit(1);
});
