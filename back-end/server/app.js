
const express = require('express');
const app = express();
//const cors = require('cors');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
dotenv.config();

const port = process.env.PORT || 8190;

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const jobPostRoutes = require('./routes/jobPosts'); 
const bookingRoutes = require('./routes/bookings');
const db = require('./config/db'); 

// ==== Middleware ====
//app.use(cors());
app.use(bodyParser.json());

// ==== Routes ====
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/job-posts', jobPostRoutes);
app.use('/api/bookings', bookingRoutes);

// ==== Test DB Route ====
app.get('/api/test-db', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT 1 + 1 AS result');
    res.json({ dbConnected: true, result: rows[0].result });
  } catch (error) {
    console.error('Database connection failed:', error);
    res.status(500).json({ dbConnected: false, error: error.message });
  }
});

// ==== Start Server ====
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
