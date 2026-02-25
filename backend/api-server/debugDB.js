require('dotenv').config();
const mongoose = require('mongoose');
const Authority = require('./models/Authority');
const Institution = require('./models/Institution');
const Complaint = require('./models/Complaint');

async function fixDB() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Connected to DB.");

        console.log("Fixing Jane Doe's institution ID to point to IIT Madras...");

        // Find IIT Madras ORG ID
        const iit = await Institution.findOne({ orgName: "IIT Madras" });
        if (!iit) {
            console.log("Error: IIT Madras not found.");
            process.exit(1);
        }

        const result = await Authority.updateOne(
            { email: 'jane.doe@example.com' },
            { $set: { institutionId: iit.orgId } }
        );

        console.log("Update result:", result.modifiedCount > 0 ? "Success" : "No changes made");

        process.exit(0);
    } catch (err) {
        console.error("Error:", err);
        process.exit(1);
    }
}
fixDB();
