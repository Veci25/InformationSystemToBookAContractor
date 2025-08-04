const db = require('../config/db');

exports.getAllUsers = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT id, name, email, role FROM users');
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getUserById = async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await db.query('SELECT id, name, email, role FROM users WHERE id = ?', [id]);
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
      'SELECT id, username, name, email, role FROM users WHERE id = ?',
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
  const { name, email } = req.body;
  try {
    await db.query('UPDATE users SET name=?, email=? WHERE id=?', [name, email, id]);
    res.json({ message: 'User updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.createUser = async (req, res) => {
  const { username, email, password, name, surname, role } = req.body;
  if (!username || !email || !password || !role) {
    return res.status(400).json({ message: 'Missing required fields' });
  }
  try {
    await db.query(
      'INSERT INTO users (username, email, password, name, surname, role) VALUES (?, ?, ?, ?, ?, ?)',
      [username, email, password, name, surname, role]
    );
    res.status(201).json({ message: 'User created successfully' });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete user
exports.deleteUser = async (req, res) => {
  const { id } = req.params;
  try {
    await db.query('DELETE FROM users WHERE id=?', [id]);
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

