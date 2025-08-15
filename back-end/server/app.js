const express = require('express');
const app = express();
const cors = require('cors');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const path = require('path');   
dotenv.config();

const frontendDir = path.resolve(__dirname, '../../front-end/client/dist');

const port = process.env.PORT || 8190;

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const jobPostRoutes = require('./routes/jobPosts'); 
const bookingRoutes = require('./routes/bookings');
const skillRoutes = require('./routes/skills');
const ratingRoutes = require('./routes/ratings'); 
const photoRoutes = require('./routes/photos');
const adminRoutes = require('./routes/admin')
const db = require('./config/db'); 

app.use(express.static(frontendDir));
app.use(cors());
app.use(bodyParser.json());

//Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/job-posts', jobPostRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/skills', skillRoutes);
app.use('/api/ratings', ratingRoutes);
app.use('/api/photos', photoRoutes);
app.use('/api/admin', adminRoutes);
app.use('/uploads/profile_picture',
  express.static(path.join(__dirname, 'uploads/profile_picture')));
app.use('/uploads/profile_pictures',
  express.static(path.join(__dirname, 'uploads/profile_picture')));

//Test DB Route 
app.get('/api/test-db', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT 1 + 1 AS result');
    res.json({ dbConnected: true, result: rows[0].result });
  } catch (error) {
    console.error('Database connection failed:', error);
    res.status(500).json({ dbConnected: false, error: error.message });
  }
});

app.get(/^\/(?!api\/|uploads\/).*/, (req, res) => {
  res.sendFile(path.join(frontendDir, 'index.html'));
});

//Start Server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
