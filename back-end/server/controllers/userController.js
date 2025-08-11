const db = require('../config/db');
const { validateUserData, validateUpdateUserData } = require('../validations/userValidation');
const bcrypt = require('bcrypt');


exports.getAllUsers = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT user_id, name, surname, email, role, age FROM users');
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

function withProfileUrl(req, row) {
  if (!row) return row;
  const base = `${req.protocol}://${req.get('host')}`; 
  row.profile_picture_url = row.profile_picture
    ? `${base}/uploads/profile_pictures/${encodeURIComponent(row.profile_picture)}`
    : null;
  return row;
}

exports.getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await db.query(
      `SELECT user_id, username, name, surname, email, role, age, bio, profile_picture
       FROM users
       WHERE user_id = ?`,
      [id]
    );
    if (!rows.length) return res.status(404).json({ message: 'User not found' });

    const withProfileUrl = (req, row) => ({
      ...row,
      profile_picture_url: row.profile_picture
        ? `${req.protocol}://${req.get('host')}/uploads/profile_pictures/${encodeURIComponent(row.profile_picture)}`
        : null,
    });

    res.json(withProfileUrl(req, rows[0]));
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getCurrentUser = async (req, res) => {
  try {
const [rows] = await db.query(
      `SELECT user_id,
              username,
              name,
              surname,
              email,
              role,
              age,
              bio,
              profile_picture
       FROM users
       WHERE user_id = ?`,
      [req.user.id]
    );
    if (!rows.length) return res.status(404).json({ message: 'User not found' });
    res.json(withProfileUrl(req, rows[0]));
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updateUser = async (req, res) => {
  const { id } = req.params;
  const { name, surname, email, age } = req.body;

  const error = validateUpdateUserData({ email });
  if (error) return res.status(400).json({ message: error });

  try {
    const [result] = await db.query(
      'UPDATE users SET name=?, surname=?, email=?, age=? WHERE user_id=?',
      [name, surname, email, age, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: 'User updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.createUser = async (req, res) => {
  const { username, email, password, name, surname, role, age } = req.body;
  if (!username || !email || !password || !role) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  const error = validateUserData({ username, email, password, role });
  if (error) return res.status(400).json({ message: error });

  try {
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    await db.query(
      'INSERT INTO users (username, email, password, name, surname, role, age) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [username, email, hashedPassword, name, surname, role, age]
    );

    res.status(201).json({ message: 'User created successfully' });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.deleteUser = async (req, res) => {
  const userIdToDelete = parseInt(req.params.id, 10);
  const requesterId = req.user.id; 
  const requesterRole = req.user.role;

  try {

    if (requesterRole !== 'admin' && requesterId !== userIdToDelete) {
      return res.status(403).json({ message: 'You can only delete your own account' });
    }

    const [result] = await db.query('DELETE FROM users WHERE user_id = ?', [userIdToDelete]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updateUserRole = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { role } = req.body;
    if (!['admin','client','contractor'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }
    const [r] = await db.query('UPDATE users SET role=? WHERE user_id=?', [role, id]);
    if (!r.affectedRows) return res.status(404).json({ message: 'User not found' });
    res.json({ message: 'Role updated' });
  } catch (e) {
    console.error('updateUserRole error:', e);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.adminDeleteUser = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const [r] = await db.query('DELETE FROM users WHERE user_id=?', [id]);
    if (!r.affectedRows) return res.status(404).json({ message: 'User not found' });
    res.json({ message: 'User deleted' });
  } catch (e) {
    console.error('adminDeleteUser error:', e);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updateProfilePicture = async (req, res) => {
  try {
    const userId = req.user.id;
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

    await db.query('UPDATE users SET profile_picture = ? WHERE user_id = ?', [
      req.file.filename,
      userId,
    ]);

    const url = `${req.protocol}://${req.get('host')}/uploads/profile_pictures/${req.file.filename}`;

    return res.json({
      message: 'Profile picture updated',
      profile_picture: req.file.filename,
      profile_picture_url: url,
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.patchMe = async (req, res) => {
  try {
    const userId = req.user.id;

    const allowed = ['name', 'surname', 'username', 'age', 'bio'];

    const updates = [];
    const values = [];

    if (typeof req.body.username !== 'undefined') {
      const username = String(req.body.username).trim();
      if (username) {
        const [dupe] = await db.query(
          'SELECT user_id FROM users WHERE username = ? AND user_id <> ?',
          [username, userId]
        );
        if (dupe.length) {
          return res.status(409).json({ message: 'Username already in use' });
        }
      }
    }

    for (const key of allowed) {
      if (typeof req.body[key] !== 'undefined') {
        let v = req.body[key];

        if (key === 'age' && v !== null && v !== '') v = Number(v);
        if (typeof v === 'string') v = v.trim();

        if (v === '') v = null;

        updates.push(`${key} = ?`);
        values.push(v);
      }
    }

    if (updates.length === 0) {
      return res.status(400).json({ message: 'No fields to update' });
    }

    values.push(userId);

    const sql = `UPDATE users SET ${updates.join(', ')} WHERE user_id = ?`;
    const [result] = await db.query(sql, values);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const [rows] = await db.query(
      'SELECT user_id, username, name, surname, email, role, age, bio, profile_picture FROM users WHERE user_id = ?',
      [userId]
    );
    return res.json(withProfileUrl(req, rows[0]));
  } catch (err) {
    console.error('patchMe error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

exports.searchContractors = async (req, res) => {
  try {
    const skillsParam = (req.query.skills || '').trim();
    if (!skillsParam) return res.status(400).json({ message: 'skills is required (comma separated ids)' });

    const start = req.query.start || req.query.date || null;
    const end   = req.query.end   || req.query.date || null;
    if (!start || !end) return res.status(400).json({ message: 'Provide date or start & end' });

    const skillIds = skillsParam.split(',').map(n => Number(n)).filter(Boolean);
    if (!skillIds.length) return res.status(400).json({ message: 'No valid skill ids' });

    const placeholders = skillIds.map(() => '?').join(',');
    const sql = `
      SELECT
        u.user_id, u.username, u.name, u.surname, u.email, u.profile_picture,
        GROUP_CONCAT(DISTINCT s.skill_name ORDER BY s.skill_name) AS skills,
        COUNT(DISTINCT us.skill_id) AS matched_skills
      FROM users u
      JOIN user_skills us ON us.user_id = u.user_id
      JOIN skills s       ON s.skill_id = us.skill_id
      LEFT JOIN bookings b
        ON b.user_id = u.user_id
       AND DATE(b.booking_date) BETWEEN DATE(?) AND DATE(?)   
      WHERE u.role = 'contractor'
        AND us.skill_id IN (${placeholders})
        AND b.booking_id IS NULL
      GROUP BY u.user_id
      HAVING matched_skills = ?                               
      ORDER BY u.name, u.surname
      LIMIT 200;
    `;
    const params = [start, end, ...skillIds, skillIds.length];

    const [rows] = await db.query(sql, params);
    res.json(rows);
  } catch (err) {
    console.error('searchContractors error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getPublicUser = async (req, res) => {
  try {
    const { id } = req.params;

    const [[u]] = await db.query(
      'SELECT user_id, username, name, surname, email, role, age, bio, profile_picture FROM users WHERE user_id = ?',
      [id]
    );
    if (!u) return res.status(404).json({ message: 'User not found' });

    const [[agg]] = await db.query(
      `SELECT AVG(rating_value) AS avg_rating, COUNT(*) AS rating_count FROM ratings WHERE target_user_id = ?`,
      [id]
    );

    const [photos] = await db.query(
      `SELECT photo_id, image_filename, caption, upload_date
       FROM photos
       WHERE user_id = ?
       ORDER BY upload_date DESC
       LIMIT 12`,
      [id]
    );

    const base = `${req.protocol}://${req.get('host')}`;
    const profile_picture_url = u.profile_picture
      ? `${base}/uploads/profile_pictures/${u.profile_picture}` 
      : null;

    const photoItems = photos.map(p => ({
      photo_id: p.photo_id,
      caption: p.caption,
      uploaded_at: p.upload_date,
      url: `${base}/uploads/${p.image_filename}`,
    }));

    res.json({
      user_id: u.user_id,
      username: u.username,
      name: u.name,
      surname: u.surname,
      role: u.role,
      bio: u.bio,
      profile_picture_url,          
      avg_rating: Number(agg?.avg_rating || 0),
      rating_count: Number(agg?.rating_count || 0),
      photos: photoItems,
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Server error' });
  }
};
