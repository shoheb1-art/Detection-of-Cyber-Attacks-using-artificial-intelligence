const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const apiController = require('../controllers/apiController');
const multer = require('multer');

// Configure multer to temporarily store uploaded files
const upload = multer({ dest: 'uploads/' });

// All routes in this file are protected by the auth middleware
router.use(authMiddleware);

router.get('/profile', apiController.getProfile);
router.put('/profile', apiController.updateProfile);
router.get('/scans', apiController.getScans);
router.post('/predict/sql', apiController.predictSql);
router.post('/predict/phishing', apiController.predictPhishing);
router.post('/predict/file', upload.single('file'), apiController.predictFile);

module.exports = router;