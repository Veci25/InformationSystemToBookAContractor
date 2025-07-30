// db.js
const mysql = require('mysql2');

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME
})

db.connect((err) => {
  if (err) {
    console.log('Database connection failed:', err.message);
    return
  }
  console.log('Connected to the MySQL database.');
})

module.exports = db;
