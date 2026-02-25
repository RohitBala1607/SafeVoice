const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Authority = require("../models/Authority");
const authorityController = require("../controllers/authorityController");
const { verifyAuthority } = require("../middleware/authMiddleware");

// Oversight Analytics (Global POSH IC view)
router.get("/oversight", verifyAuthority, authorityController.getOversightStats);
router.get("/institution/:institutionName/records", verifyAuthority, authorityController.getInstitutionRecords);
router.get("/secure-records", verifyAuthority, authorityController.getAuthorityRecords);
router.patch("/secure-records/:id/verify", verifyAuthority, authorityController.verifyRecord);
router.patch("/secure-records/:id/status", verifyAuthority, authorityController.updateRecord);
router.post("/secure-records/:id/actions", verifyAuthority, authorityController.addActionLog);
router.patch("/complaints/:complaintId/close", verifyAuthority, authorityController.closeCase);
router.get("/sos-alerts", verifyAuthority, authorityController.getSOSAlerts);

// 🔐 Authority Login (POSH IC)
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        const authority = await Authority.findOne({ email });

        if (!authority) {
            return res.status(404).json({
                success: false,
                message: "Authority not found",
            });
        }

        if (!authority.isActive) {
            return res.status(403).json({
                success: false,
                message: "Account disabled",
            });
        }

        // Compare password
        const isMatch = await bcrypt.compare(password, authority.passwordHash);

        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: "Invalid credentials",
            });
        }

        // Generate JWT
        const token = jwt.sign(
            {
                id: authority._id,
                role: "authority",
                institutionId: authority.institutionId,
            },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        // Update last login
        authority.lastLogin = new Date();
        await authority.save();

        res.json({
            success: true,
            message: "Authority login successful",
            token,
            authority: {
                id: authority._id,
                name: authority.name,
                email: authority.email,
                role: authority.role,
                institutionId: authority.institutionId,
            },
        });
    } catch (error) {
        console.error("Authority Login Error:", error);
        res.status(500).json({
            success: false,
            message: "Server error",
        });
    }
});

module.exports = router;