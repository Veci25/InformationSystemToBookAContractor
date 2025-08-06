const express = require('express');
const router = express.Router();
const skillController = require('../controllers/skillController');
const { verifyToken, isAdmin } = require('../middleware/authMiddleware');

// Skill CRUD
router.get('/', verifyToken, skillController.getAllSkills);
router.post('/', verifyToken, isAdmin, skillController.createSkill);
router.delete('/:id', verifyToken, isAdmin, skillController.deleteSkill);

// User Skills
router.post('/user', verifyToken, skillController.addUserSkill);
router.delete('/user/:user_id/:skill_id', verifyToken, skillController.removeUserSkill);

// Job Skills
router.post('/job', verifyToken, skillController.addJobSkill);
router.delete('/job/:job_post_id/:skill_id', verifyToken, skillController.removeJobSkill);

// Matching Jobs
router.get('/match/:user_id', verifyToken, skillController.getJobsForUser);

router.get('/matchContractors/:jobPostId', verifyToken, skillController.matchContractorsForJobPost);


module.exports = router;
