const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { verifyToken, isAdmin } = require('../middleware/authMiddleware');
const profileUpload = require('../middleware/profileUploadMiddleware');

const uploadAvatar = (req, res, next) => {
  profileUpload.single('profile_picture')(req, res, (err) => {
    if (err) {
      console.error('Multer upload error:', err);
      return res.status(400).json({ message: err.message || 'Invalid image upload' });
    }
    next();
  });
};

router.get('/public/:id', userController.getPublicUser);

router.get('/me', verifyToken, userController.getCurrentUser);

router.put(
  '/me/profile-picture',
  verifyToken,
  uploadAvatar,
  userController.updateProfilePicture
);

router.get('/', verifyToken, isAdmin, userController.getAllUsers);
router.get('/:id', verifyToken, userController.getUserById);
router.post('/', verifyToken, isAdmin, userController.createUser);
router.put('/:id', verifyToken, userController.updateUser);
router.delete('/:id', verifyToken, userController.deleteUser);
router.patch('/me', verifyToken, userController.patchMe);
router.get('/contractors/search', verifyToken, userController.searchContractors);
router.patch('/:id/role', verifyToken, isAdmin, userController.updateUserRole);
router.delete('/:id', verifyToken, isAdmin, userController.adminDeleteUser);

module.exports = router;
