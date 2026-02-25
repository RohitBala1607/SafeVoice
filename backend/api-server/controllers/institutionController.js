const Institution = require("../models/Institution");
const bcrypt = require("bcryptjs");

exports.registerInstitution = async (req, res) => {
    try {
        const { orgName, orgType, adminName, adminEmail, password } = req.body;

        // Check existing institution (with case-insensitive email)
        const existing = await Institution.findOne({ adminEmail: adminEmail.toLowerCase() });
        if (existing) {
            return res.status(400).json({ success: false, message: "Institution already registered" });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        // Generate Org ID
        const orgId = "ORG-" + Math.floor(100000 + Math.random() * 900000);

        const institution = new Institution({
            orgId,
            orgName,
            orgType,
            adminName,
            adminEmail: adminEmail.toLowerCase(), // Explicitly lowercase
            passwordHash,
        });

        await institution.save();

        res.status(201).json({
            success: true,
            message: "Institution registered successfully",
            orgId,
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

exports.loginInstitution = async (req, res) => {
    try {
        const { email, adminEmail, password } = req.body;
        const inputEmail = email || adminEmail;

        if (!inputEmail) {
            return res.status(400).json({ success: false, message: "Email is required" });
        }

        const institution = await Institution.findOne({ adminEmail: inputEmail.toLowerCase() });
        if (!institution) {
            return res.status(400).json({ success: false, message: "Invalid credentials" });
        }

        const isMatch = await bcrypt.compare(password, institution.passwordHash);
        if (!isMatch) {
            return res.status(400).json({ success: false, message: "Invalid credentials" });
        }

        // Generate a dummy token or use JWT if available
        const token = "inst-" + Math.random().toString(36).substr(2, 9);

        res.json({
            success: true,
            token,
            institution: {
                id: institution._id,
                name: institution.adminName,
                email: institution.adminEmail,
                orgName: institution.orgName,
                role: "institution",
                orgId: institution.orgId
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};