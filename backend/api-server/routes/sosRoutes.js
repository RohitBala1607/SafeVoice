const express = require('express');
const router = express.Router();
const sosController = require('../controllers/sosController');

router.post('/start', sosController.startSOS);
router.post('/update', sosController.updateLocation);
router.post('/resolve', sosController.resolveSOS);
router.get('/track/:publicId', sosController.getPublicTracking);

// Audio Upload Support
const multer = require('multer');
const upload = multer({ dest: 'uploads/audio/' });
router.post('/upload-audio', upload.single('audio'), sosController.uploadAudio);

module.exports = router;
