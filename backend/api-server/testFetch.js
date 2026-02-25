require('dotenv').config();
const mongoose = require('mongoose');
const Complaint = require('./models/Complaint');

async function testFetch() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const institutionName = "VIT University";
        console.log("Fetching for:", institutionName);

        const records = await Complaint.find({ institution: institutionName })
            .select('-__v')
            .sort({ createdAt: -1 });

        console.log(`Found ${records.length} records.`);
        if (records.length > 0) {
            console.log("Sample:", records[0]);
        }
        process.exit(0);
    } catch (err) {
        console.error("Error:", err);
        process.exit(1);
    }
}
testFetch();
