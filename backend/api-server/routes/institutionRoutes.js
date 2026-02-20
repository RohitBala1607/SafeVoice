import express from "express";
import { registerInstitution } from "../controllers/institutionController.js";

const router = express.Router();

router.post("/register", registerInstitution);

export default router;