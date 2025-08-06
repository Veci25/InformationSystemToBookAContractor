const express = require('express');
const router = express.Router();
const ratingController = require('../controllers/ratingController');
const { verifyToken } = require('../middleware/authMiddleware');

router.post('/create', verifyToken, ratingController.createRating);
router.put('/update/:ratingId', verifyToken, ratingController.updateRating);
router.delete('/delete/:ratingId', verifyToken, ratingController.deleteRating);
router.get('/user/:userId', verifyToken, ratingController.getRatingsForUser);
router.get('/average/:userId', verifyToken, ratingController.getAverageRating);
router.get('/all', verifyToken, ratingController.getAllRatings);

module.exports = router;
