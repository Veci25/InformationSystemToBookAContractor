const db = require('../config/db');
const { validateUserData, validateUpdateUserData } = require('../validations/userValidation');

exports.getAllUsers = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT user_id, name, surname, email, role, age FROM users');
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getUserById = async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await db.query('SELECT user_id, name, surname, email, role, age FROM users WHERE user_id = ?', [id]);
    if (rows.length === 0) return res.status(404).json({ message: 'User not found' });
    res.json(rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getCurrentUser = async (req, res) => {
  try {
    const userId = req.user.id; // comes from JWT middleware
    const [rows] = await db.query(
      'SELECT user_id, username, name, surname, email, role, age FROM users WHERE user_id = ?',
      [userId]
    );
    if (rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(rows[0]);
  } catch (error) {
    console.error('Error fetching current user:', error);
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
    await db.query(
      'INSERT INTO users (username, email, password, name, surname, role, age) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [username, email, password, name, surname, role, age]
    );
    res.status(201).json({ message: 'User created successfully' });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete user
exports.deleteUser = async (req, res) => {
  const userIdToDelete = parseInt(req.params.id, 10); // id from URL
  const requesterId = req.user.id; // id from JWT
  const requesterRole = req.user.role; // role from JWT

  try {
    // If requester is not admin and tries to delete someone else
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
