const express = require('express');
const router = express.Router();
const complaintController = require('../controllers/complaintController');

router.post('/', complaintController.createComplaint);
router.get('/transparency', complaintController.getTransparencyData);
router.get('/institution/:institution', complaintController.getComplaintsByInstitution);

module.exports = router;
