const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const { verifyToken, isAdmin } = require('../middleware/authMiddleware');

router.get('/mine',verifyToken, bookingController.getMyBookingRequests);
router.get('/for-my-jobs',verifyToken, bookingController.getBookingsForMyJobs);
router.patch('/:id/status',verifyToken, bookingController.updateBookingStatus);

router.get('/', verifyToken, isAdmin, bookingController.getAllBookings);
router.get('/:id', verifyToken, bookingController.getBookingById);
router.post('/', verifyToken, bookingController.createBooking);
router.put('/:id', verifyToken, bookingController.updateBooking);
router.delete('/:id', verifyToken, isAdmin, bookingController.deleteBooking);

module.exports = router;

