const express = require('express');
const router = express.Router();
const photoController = require('../controllers/photoController');
const { verifyToken } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware'); // This handles multer config

// Routes
router.post('/upload', verifyToken, upload.single('photo'), photoController.uploadPhoto);
router.get('/user/:userId', photoController.getPhotosByUser);
router.delete('/:photoId', verifyToken, photoController.deletePhoto);
router.put('/:photoId', verifyToken, upload.single('photo'), photoController.updatePhoto);

module.exports = router;
