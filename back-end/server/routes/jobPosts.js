const express = require('express');
const router = express.Router();

const { verifyToken } = require('../middleware/authMiddleware');
const jobPostController = require('../controllers/jobPostsController');

router.get('/', jobPostController.getAllJobPosts);
router.get('/matches/me', verifyToken, jobPostController.getMatchesForMe);
router.get('/:jobId/matches', verifyToken, jobPostController.getContractorsForJob);
router.post('/', verifyToken, jobPostController.createJobPost);
router.get('/:id', jobPostController.getJobPostById);
router.patch('/:id', verifyToken, jobPostController.updateJobPost);
router.put('/:id', verifyToken, jobPostController.updateJobPost);
router.delete('/:id', verifyToken, jobPostController.deleteJobPost);

module.exports = router;
