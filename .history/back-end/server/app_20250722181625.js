const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const dotenv = require('dotenv');
dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Routes
app.get('/', (req, res) => {
  res.send('Contractor Booking API running!');
});

// Import and use routes here
// app.use('/api/auth', require('./routes/auth'));
// app.use('/api/jobs', require('./routes/jobs'));

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
