const db = require('../config/db');
const fs = require('fs');
const path = require('path');

const GALLERY_SUBDIR = 'photos';
const UPLOAD_DIR = path.join(__dirname, '..', 'uploads', GALLERY_SUBDIR);

const publicUrl = (req, filename) =>
  `${req.protocol}://${req.get('host')}/uploads/${GALLERY_SUBDIR}/${encodeURIComponent(filename)}`;

exports.uploadPhoto = async (req, res) => {
  const userId = req.user.id;
  const { caption } = req.body ?? {};
  const file = req.file;

  if (!file) return res.status(400).json({ message: 'No file uploaded' });

  try {
    const [result] = await db.query(
      'INSERT INTO photos (user_id, caption, image_filename) VALUES (?, ?, ?)',
      [userId, caption ?? null, file.filename]
    );

    res.status(201).json({
      message: 'Photo uploaded successfully',
      photo_id: result.insertId,
      filename: file.filename,
      image_url: publicUrl(req, file.filename),
    });
  } catch (err) {
    console.error('uploadPhoto error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getPhotosByUser = async (req, res) => {
  const { userId } = req.params;

  try {
    const [rows] = await db.query(
      `SELECT photo_id, caption, upload_date, image_filename
       FROM photos
       WHERE user_id = ?
       ORDER BY upload_date DESC`,
      [userId]
    );

    res.json(
      rows.map((p) => ({
        ...p,
        image_url: publicUrl(req, p.image_filename),
      }))
    );
  } catch (err) {
    console.error('getPhotosByUser error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.deletePhoto = async (req, res) => {
  const { photoId } = req.params;
  const userId = req.user.id;

  try {
    const [[row]] = await db.query(
      'SELECT image_filename FROM photos WHERE photo_id = ? AND user_id = ?',
      [photoId, userId]
    );
    if (!row) return res.status(404).json({ message: 'Photo not found or unauthorized' });

    const filePath = path.join(UPLOAD_DIR, row.image_filename);
    try {
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    } catch (e) {
      if (e.code !== 'ENOENT') console.warn('unlink error:', e);
    }

    await db.query('DELETE FROM photos WHERE photo_id = ? AND user_id = ?', [photoId, userId]);
    res.json({ message: 'Photo deleted successfully' });
  } catch (err) {
    console.error('deletePhoto error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updatePhoto = async (req, res) => {
  const { caption } = req.body ?? {};
  const { photoId } = req.params;
  const userId = req.user.id;
  const file = req.file;

  try {
    const [[row]] = await db.query(
      'SELECT image_filename, caption FROM photos WHERE photo_id = ? AND user_id = ?',
      [photoId, userId]
    );
    if (!row) return res.status(404).json({ message: 'Photo not found or unauthorized' });

    if (!file && typeof caption === 'undefined') {
      return res.status(400).json({ message: 'Nothing to update' });
    }

    const newFilename = file ? file.filename : row.image_filename;
    const newCaption  = typeof caption !== 'undefined' ? caption : row.caption;

    if (file && row.image_filename && row.image_filename !== newFilename) {
      const oldPath = path.join(UPLOAD_DIR, row.image_filename);
      try {
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      } catch (e) {
        if (e.code !== 'ENOENT') console.warn('unlink old error:', e);
      }
    }

    await db.query(
      'UPDATE photos SET caption = ?, image_filename = ? WHERE photo_id = ? AND user_id = ?',
      [newCaption, newFilename, photoId, userId]
    );

    res.json({
      message: 'Photo updated successfully',
      photo_id: Number(photoId),
      caption: newCaption,
      image_filename: newFilename,
      image_url: publicUrl(req, newFilename),
    });
  } catch (err) {
    console.error('updatePhoto error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};
