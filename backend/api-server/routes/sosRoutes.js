const express = require('express');
const router = express.Router();
const sosController = require('../controllers/sosController');

router.post('/start', sosController.startSOS);
router.post('/update', sosController.updateLocation);
router.post('/resolve', sosController.resolveSOS);
router.get('/track/:publicId', sosController.getPublicTracking);

module.exports = router;
