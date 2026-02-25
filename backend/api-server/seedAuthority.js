require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const { v4: uuidv4 } = require("uuid");
const Authority = require("./models/Authority");

const newAuthorityData = {
    name: "Admin",
    email: "admin@authority.com",    
    password: "safevoice123",    
    role: "authority",                
    institutionId: "ORG-123456",      
    designation: "POSH IC Head",
};


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
