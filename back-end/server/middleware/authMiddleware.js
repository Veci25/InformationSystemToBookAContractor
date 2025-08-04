const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'mysecretkey';

exports.verifyToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1]; // "Bearer <token>"
  if (!token) {
    return res.status(403).json({ message: 'Token required' });
  }
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // add decoded payload (id, role)
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

exports.isAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin only access' });
  }
  next();
};
