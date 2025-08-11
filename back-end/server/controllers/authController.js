const db = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;

exports.register = async (req, res) => {
  try {
    const { username, email, password, name, surname, role } = req.body;

    if (!username || !email || !password || !role) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const sql = `INSERT INTO users (username, email, password, name, surname, role) VALUES (?, ?, ?, ?, ?, ?)`;
    await db.query(sql, [username, email, hashedPassword, name, surname, role]);

    return res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Registration failed', error: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    console.log("Login endpoint hit, body:", req.body);
    const { username, password } = req.body;

    const [results] = await db.query('SELECT * FROM users WHERE username = ?', [username]);
    console.log("DB results:", results);

    if (results.length === 0) return res.status(404).json({ message: 'User not found' });

    const user = results[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid password' });

    const token = jwt.sign({ id: user.user_id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1d' });
    console.log("Token generated");
    res.json({ message: 'Login successful', token });

  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.changePassword = async (req, res) => {
  try {
    const userId = req.user.id;
    const { current_password, new_password } = req.body;

    if (!current_password || !new_password) {
      return res.status(400).json({ message: 'Both current_password and new_password are required' });
    }
    if (new_password.length < 8) {
      return res.status(400).json({ message: 'New password must be at least 8 characters' });
    }

    const [[user]] = await db.query(
      'SELECT user_id, username, password, role FROM users WHERE user_id = ?',
      [userId]
    );
    if (!user) return res.status(404).json({ message: 'User not found' });

    const ok = await bcrypt.compare(current_password, user.password);
    if (!ok) return res.status(401).json({ message: 'Current password is incorrect' });

    const newHash = await bcrypt.hash(new_password, 10);
    await db.query('UPDATE users SET password = ? WHERE user_id = ?', [newHash, userId]);

    const [[row]] = await db.query('SELECT password FROM users WHERE user_id = ?', [userId]);
    const persisted = await bcrypt.compare(new_password, row.password);
    if (!persisted) return res.status(500).json({ message: 'Password not persisted correctly' });

    const token = jwt.sign({ id: user.user_id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1d' });

    return res.json({ message: 'Password updated', token, username: user.username });
  } catch (err) {
    console.error('changePassword error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

