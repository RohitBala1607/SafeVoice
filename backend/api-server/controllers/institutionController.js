import Institution from "../models/Institution.js";
import bcrypt from "bcryptjs";

export const registerInstitution = async (req, res) => {
  try {
    const { orgName, orgType, adminName, adminEmail, password } = req.body;

    // Check existing institution
    const existing = await Institution.findOne({ adminEmail });
    if (existing) {
      return res.status(400).json({ message: "Institution already registered" });
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
      adminEmail,
      passwordHash,
    });

    await institution.save();

    res.status(201).json({
      success: true,
      message: "Institution registered successfully",
      orgId,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};