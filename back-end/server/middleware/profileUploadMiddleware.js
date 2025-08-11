const multer = require('multer');
const path = require('path');
const fs = require('fs');

const destDir = path.join(__dirname, '..', 'uploads', 'profile_picture');
if (!fs.existsSync(destDir)) {
  fs.mkdirSync(destDir, { recursive: true });
}

const avatarStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, destDir),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});

const imageOnly = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) return cb(null, true);
  cb(new Error('Only image files are allowed!'), false);
};

module.exports = multer({ storage: avatarStorage, fileFilter: imageOnly });
