/**
 * 🛡️ Authority Seeding Script
 * Run this script to manually add an Authority (Admin/IC Member) to the SafeVoice database.
 * Usage: node seedAuthority.js
 */

require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const { v4: uuidv4 } = require("uuid");
const Authority = require("./models/Authority");

// -------------------------------------------------------------
// 👇 EDIT THESE DETAILS TO ADD A NEW AUTHORITY 👇
// -------------------------------------------------------------
const newAuthorityData = {
    name: "Jane Doe",
    email: "jane.doe@example.com",     // Must be unique
    password: "safevoice123",    // Will be hashed automatically
    role: "authority",                 // Default: "authority" 
    institutionId: "ORG-123456",       // Must match an existing Institution orgId
    designation: "POSH IC Head",
};
// -------------------------------------------------------------

const seedAuthority = async () => {
    try {
        console.log("⏳ Connecting to Database...");
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("✅ Database connected successfully.");

        // Check if authority already exists
        const existing = await Authority.findOne({ email: newAuthorityData.email });
        if (existing) {
            console.log(`❌ Error: An authority with email '${newAuthorityData.email}' already exists.`);
            process.exit(1);
        }

        console.log("🔐 Hashing password...");
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(newAuthorityData.password, salt);

        console.log("📝 Creating new Authority record...");
        const newAuthority = new Authority({
            authorityId: `AUTH-${uuidv4().substring(0, 8).toUpperCase()}`,
            name: newAuthorityData.name,
            email: newAuthorityData.email,
            passwordHash: passwordHash,
            role: newAuthorityData.role,
            institutionId: newAuthorityData.institutionId,
            designation: newAuthorityData.designation,
            isActive: true, // Set to false if you want to create a suspended account
        });

        await newAuthority.save();
        console.log(`🎉 Success! Authority '${newAuthority.name}' has been created.`);
        console.log(`🔑 Login Email: ${newAuthority.email}`);

        process.exit(0);
    } catch (error) {
        console.error("❌ Fatal Error seeding authority:", error);
        process.exit(1);
    }
};

seedAuthority();
