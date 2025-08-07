const db = require('../db');
const fs = require('fs');
const path = require('path');

// Upload photo - already provided earlier
exports.uploadPhoto = async (req, res) => {
  const userId = req.user.id;
  const { caption } = req.body;
  const file = req.file;

  if (!file) return res.status(400).json({ message: 'No file uploaded' });

  try {
    const [result] = await db.query(
      'INSERT INTO photos (user_id, caption, image_filename) VALUES (?, ?, ?)',
      [userId, caption, file.filename]
    );

    res.status(201).json({
      message: 'Photo uploaded successfully',
      photo_id: result.insertId,
      filename: file.filename
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get photos by user
exports.getPhotosByUser = async (req, res) => {
  const { userId } = req.params;

  try {
    const [photos] = await db.query(
      'SELECT photo_id, caption, upload_date, image_filename FROM photos WHERE user_id = ?',
      [userId]
    );

    const fullPhotos = photos.map(photo => ({
      ...photo,
      image_url: `${req.protocol}://${req.get('host')}/uploads/${photo.image_filename}`
    }));

    res.json(fullPhotos);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete photo
exports.deletePhoto = async (req, res) => {
  const { photoId } = req.params;
  const userId = req.user.id;

  try {
    const [[photo]] = await db.query(
      'SELECT image_filename FROM photos WHERE photo_id = ? AND user_id = ?',
      [photoId, userId]
    );

    if (!photo) return res.status(404).json({ message: 'Photo not found or unauthorized' });

    // Delete file from disk
    const filePath = path.join(__dirname, '..', 'uploads', photo.image_filename);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

    await db.query('DELETE FROM photos WHERE photo_id = ?', [photoId]);

    res.json({ message: 'Photo deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update photo (caption and/or replace image)
exports.updatePhoto = async (req, res) => {
  const { caption } = req.body;
  const { photoId } = req.params;
  const userId = req.user.id;
  const file = req.file;

  try {
    const [[photo]] = await db.query(
      'SELECT image_filename FROM photos WHERE photo_id = ? AND user_id = ?',
      [photoId, userId]
    );

    if (!photo) return res.status(404).json({ message: 'Photo not found or unauthorized' });

    // Prepare update values
    const newFilename = file ? file.filename : photo.image_filename;
    const newCaption = caption ?? photo.caption;

    // Delete old file if replacing
    if (file && photo.image_filename) {
      const oldPath = path.join(__dirname, '..', 'uploads', photo.image_filename);
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
    }

    await db.query(
      'UPDATE photos SET caption = ?, image_filename = ? WHERE photo_id = ?',
      [newCaption, newFilename, photoId]
    );

    res.json({ message: 'Photo updated successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};
