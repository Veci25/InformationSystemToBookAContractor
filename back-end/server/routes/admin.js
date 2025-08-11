const express = require('express');
const router = express.Router();

const { verifyToken, isAdmin } = require('../middleware/authMiddleware');
const userController = require('../controllers/userController');
const jobPostsController = require('../controllers/jobPostsController');
const bookingController = require('../controllers/bookingController');
const ratingsController = require('../controllers/ratingController');

const db = require('../config/db');

router.get('/overview', verifyToken, isAdmin, async (req, res) => {
  try {
    const [[{ c_users }]]     = await db.query('SELECT COUNT(*) c_users FROM users');
    const [[{ c_jobs }]]      = await db.query('SELECT COUNT(*) c_jobs FROM job_posts');
    const [[{ c_bookings }]]  = await db.query('SELECT COUNT(*) c_bookings FROM bookings');
    const [[{ c_ratings }]]   = await db.query('SELECT COUNT(*) c_ratings FROM ratings');
    res.json({ users: c_users, jobs: c_jobs, bookings: c_bookings, ratings: c_ratings });
  } catch (e) {
    console.error('admin overview error:', e);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/users', verifyToken, isAdmin, async (req, res) => {
  const [rows] = await db.query(
    'SELECT user_id, username, role, email, name, surname FROM users ORDER BY user_id DESC'
  );
  res.json(rows);
});
router.delete('/users/:id', verifyToken, isAdmin, userController.deleteUser); // reuse your existing deleteUser

router.get('/ratings', verifyToken, isAdmin, ratingsController.getAllRatings);
router.delete('/ratings/:ratingId', verifyToken, isAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params.ratingId, 10);
    const [r] = await db.query('DELETE FROM ratings WHERE rating_id = ?', [id]);
    if (!r.affectedRows) return res.status(404).json({ message: 'Rating not found' });
    res.json({ message: 'Rating deleted' });
  } catch (e) {
    console.error('admin delete rating error:', e);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/job-posts', verifyToken, isAdmin, jobPostsController.getAllJobPosts);
router.delete('/job-posts/:id', verifyToken, isAdmin, jobPostsController.deleteJobPost);
router.get('/bookings', verifyToken, isAdmin, bookingController.getAllBookings);
router.patch('/bookings/:id/status', verifyToken, isAdmin, bookingController.updateBookingStatus);
router.delete('/bookings/:id', verifyToken, isAdmin, bookingController.deleteBooking);

module.exports = router;

