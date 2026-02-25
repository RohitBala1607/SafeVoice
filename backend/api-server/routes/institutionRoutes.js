const express = require("express");
const { registerInstitution, loginInstitution } = require("../controllers/institutionController");

const router = express.Router();

router.post("/register", registerInstitution);
router.post("/login", loginInstitution);

module.exports = router;