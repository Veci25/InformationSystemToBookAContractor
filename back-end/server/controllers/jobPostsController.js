const db = require('../config/db');

// GET all job posts
exports.getAllJobPosts = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM job_posts');
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// GET single job post by ID
exports.getJobPostById = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await db.query('SELECT * FROM job_posts WHERE job_post_id = ?', [id]);
    if (rows.length === 0) return res.status(404).json({ message: 'Job post not found' });
    res.json(rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// CREATE new job post
exports.createJobPost = async (req, res) => {
  try {
    const { user_id, job_title, job_description, job_price, job_deadline } = req.body;
    if (!user_id || !job_title || !job_description || !job_price || !job_deadline) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    await db.query(
      'INSERT INTO job_posts (user_id, job_title, job_description, job_price, job_deadline) VALUES (?, ?, ?, ?, ?)',
      [user_id, job_title, job_description, job_price, job_deadline]
    );
    res.status(201).json({ message: 'Job post created successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// UPDATE job post
exports.updateJobPost = async (req, res) => {
  try {
    const { id } = req.params;
    const { job_title, job_description, job_price, job_deadline } = req.body;

    const [result] = await db.query(
      'UPDATE job_posts SET job_title=?, job_description=?, job_price=?, job_deadline=? WHERE job_post_id=?',
      [job_title, job_description, job_price, job_deadline, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Job post not found' });
    }

    res.json({ message: 'Job post updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// DELETE job post
exports.deleteJobPost = async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await db.query('DELETE FROM job_posts WHERE job_post_id=?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Job post not found' });
    }

    res.json({ message: 'Job post deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

