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

exports.login = (req, res) => {
  const { username, password } = req.body;

  const sql = `SELECT * FROM users WHERE username = ?`;
  db.query(sql, [username], (err, results) => {
    if (err) return res.status(500).json({ message: 'Login error' });
    if (results.length === 0) return res.status(404).json({ message: 'User not found' });

    const user = results[0];
    const isMatch = bcrypt.compareSync(password, user.password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid password' });

    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '1d' });
    res.json({ message: 'Login successful', token });
  });
};