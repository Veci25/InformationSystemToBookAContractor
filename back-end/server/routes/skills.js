const express = require('express');
const router = express.Router();
const skillController = require('../controllers/skillController');
const { verifyToken, isAdmin } = require('../middleware/authMiddleware');

router.get('/', verifyToken, skillController.getAllSkills);
router.post('/', verifyToken, isAdmin, skillController.createSkill);
router.delete('/:id', verifyToken, isAdmin, skillController.deleteSkill);

router.post('/user', verifyToken, skillController.addUserSkill);
router.delete('/user/:user_id/:skill_id', verifyToken, skillController.removeUserSkill);

router.post('/job', verifyToken, skillController.addJobSkill);
router.delete('/job/:job_post_id/:skill_id', verifyToken, skillController.removeJobSkill);

router.get('/match/:user_id', verifyToken, skillController.getJobsForUser);

router.get('/matchContractors/:jobPostId', verifyToken, skillController.matchContractorsForJobPost);

router.patch('/me/:skillId/experience', verifyToken, skillController.updateMySkillExperience);
router.get('/me', verifyToken, skillController.getMySkills);

module.exports = router;