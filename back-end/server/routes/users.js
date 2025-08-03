const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { verifyToken, isAdmin } = require('../middleware/authMiddleware');

router.get('/', verifyToken, isAdmin, userController.getAllUsers);
router.get('/:id', verifyToken, userController.getUserById);
router.get('/me', verifyToken, userController.getCurrentUser); 
router.put('/:id', verifyToken, userController.updateUser);
router.delete('/:id', verifyToken, userController.deleteUser);
router.post('/', verifyToken, isAdmin, userController.createUser); 

module.exports = router;
