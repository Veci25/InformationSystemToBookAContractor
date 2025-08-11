const db = require('../config/db');

exports.createRating = async (req, res) => {
  try {
    const raterId = req.user?.user_id ?? req.user?.id;
    const { rating_value, target_user_id, feedback_text } = req.body;

    if (!raterId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    if (!target_user_id || rating_value == null) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    if (Number(raterId) === Number(target_user_id)) {
      return res.status(400).json({ message: "You can't rate yourself." });
    }

    const val = Number(rating_value);
    if (!Number.isFinite(val) || val < 1 || val > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }

    const [result] = await db.query(
      `INSERT INTO ratings (user_id, target_user_id, rating_value, feedback_text, created_at)
       VALUES (?, ?, ?, ?, NOW())`,
      [raterId, target_user_id, val, feedback_text || null]
    );

    return res.status(201).json({ message: 'Rating submitted', rating_id: result.insertId });
  } catch (error) {
    console.error('Error creating rating:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};
exports.getRatingsForUser = async (req, res) => {
  const { userId } = req.params;

  try {
    const [ratings] = await db.query(
      'SELECT rating_id, user_id, rating_value, feedback_text, created_at FROM ratings WHERE target_user_id = ?',
      [userId]
    );
    res.json(ratings);
  } catch (error) {
    console.error('Error fetching ratings:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getAverageRating = async (req, res) => {
  const { userId } = req.params;

  try {
    const [result] = await db.query(
      'SELECT AVG(rating_value) AS average_rating FROM ratings WHERE target_user_id = ?',
      [userId]
    );
    res.json({ user_id: userId, average_rating: result[0].average_rating });
  } catch (error) {
    console.error('Error calculating average:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getAllRatings = async (req, res) => {
  try {
    const [ratings] = await db.query('SELECT * FROM ratings');
    res.json(ratings);
  } catch (error) {
    console.error('Error fetching all ratings:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updateRating = async (req, res) => {
    const user_id = req.user.id; 
    const rating_id = req.params.ratingId;
    const { rating_value, feedback_text } = req.body;
  
    try {
      const [rows] = await db.query(
        'SELECT * FROM ratings WHERE rating_id = ? AND user_id = ?',
        [rating_id, user_id]
      );
  
      if (rows.length === 0) {
        return res.status(403).json({ message: 'Unauthorized to update this rating' });
      }
  
      await db.query(
        'UPDATE ratings SET rating_value = ?, feedback_text = ? WHERE rating_id = ?',
        [rating_value, feedback_text, rating_id]
      );
  
      res.json({ message: 'Rating updated' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  };

  exports.deleteRating = async (req, res) => {
    const user_id = req.user.id;
    const rating_id = req.params.ratingId;
  
    try {
      const [rows] = await db.query(
        'SELECT * FROM ratings WHERE rating_id = ? AND user_id = ?',
        [rating_id, user_id]
      );
  
      if (rows.length === 0) {
        return res.status(403).json({ message: 'Unauthorized to delete this rating' });
      }
  
      await db.query('DELETE FROM ratings WHERE rating_id = ?', [rating_id]);
      res.json({ message: 'Rating deleted' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  };
  
