const multer = require('multer');
const path = require('path');
const fs = require('fs');

const SUBDIR = 'photos';
const destDir = path.join(__dirname, '..', 'uploads', SUBDIR);
fs.mkdirSync(destDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, destDir),
  filename: (_req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});

const fileFilter = (_req, file, cb) => {
  if (file.mimetype?.startsWith('image/')) return cb(null, true);
  cb(new Error('Only image files are allowed!'));
};

module.exports = multer({ storage, fileFilter });
