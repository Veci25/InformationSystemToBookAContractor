const db = require('../config/db');

exports.getAllUsers = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT user_id, name, email, role FROM users');
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getUserByuser_Id = async (req, res) => {
  const { user_id } = req.params;
  try {
    const [rows] = await db.query('SELECT user_id, name, email, role FROM users WHERE user_id = ?', [user_id]);
    if (rows.length === 0) return res.status(404).json({ message: 'User not found' });
    res.json(rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getCurrentUser = async (req, res) => {
  try {
    const useruser_Id = req.user.user_id; // comes from JWT muser_iddleware
    const [rows] = await db.query(
      'SELECT user_id, username, name, email, role FROM users WHERE user_id = ?',
      [useruser_Id]
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
  const { user_id } = req.params;
  const { name, email } = req.body;
  try {
    await db.query('UPDATE users SET name=?, email=? WHERE user_id=?', [name, email, user_id]);
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


