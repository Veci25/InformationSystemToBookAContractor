const db = require('../config/db');

exports.getAllSkills = async (req, res) => {
  try {
    const [skills] = await db.query('SELECT * FROM skills');
    res.json(skills);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.createSkill = async (req, res) => {
  const { skill_name } = req.body;
  if (!skill_name) return res.status(400).json({ message: 'Skill name is required' });

  try {
    await db.query('INSERT INTO skills (skill_name) VALUES (?)', [skill_name]);
    res.status(201).json({ message: 'Skill created successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.deleteSkill = async (req, res) => {
  const { id } = req.params;
  try {
    const [result] = await db.query('DELETE FROM skills WHERE skill_id = ?', [id]);
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Skill not found' });
    res.json({ message: 'Skill deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.addUserSkill = async (req, res) => {
  const { user_id, skill_id, proficiency_level, years_experience } = req.body;
  if (!user_id || !skill_id) return res.status(400).json({ message: 'Missing fields' });

  try {
    await db.query(
      'INSERT INTO user_skills (user_id, skill_id, proficiency_level, years_experience) VALUES (?, ?, ?, ?)',
      [user_id, skill_id, proficiency_level || 'Beginner', years_experience || 0]
    );
    res.status(201).json({ message: 'Skill added to user' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.removeUserSkill = async (req, res) => {
  const { user_id, skill_id } = req.params;
  try {
    const [result] = await db.query(
      'DELETE FROM user_skills WHERE user_id = ? AND skill_id = ?',
      [user_id, skill_id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Skill not found for user' });
    res.json({ message: 'Skill removed from user' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};


exports.addJobSkill = async (req, res) => {
  const { job_post_id, skill_id, importance_level, is_mandatory } = req.body;
  if (!job_post_id || !skill_id) return res.status(400).json({ message: 'Missing fields' });

  try {
    await db.query(
      'INSERT INTO job_skills (job_post_id, skill_id, importance_level, is_mandatory) VALUES (?, ?, ?, ?)',
      [job_post_id, skill_id, importance_level || 'Medium', is_mandatory || false]
    );
    res.status(201).json({ message: 'Skill added to job post' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.removeJobSkill = async (req, res) => {
  const { job_post_id, skill_id } = req.params;
  try {
    const [result] = await db.query(
      'DELETE FROM job_skills WHERE job_post_id = ? AND skill_id = ?',
      [job_post_id, skill_id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Skill not found for job' });
    res.json({ message: 'Skill removed from job post' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// match job skill and user skill
exports.getJobsForUser = async (req, res) => {
  const { user_id } = req.params;
  try {
    const [jobs] = await db.query(`
      SELECT jp.* FROM job_posts jp
      JOIN job_skills js ON jp.job_post_id = js.job_post_id
      JOIN user_skills us ON us.skill_id = js.skill_id
      WHERE us.user_id = ?
      GROUP BY jp.job_post_id
    `, [user_id]);
    res.json(jobs);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.matchContractorsForJobPost = async (req, res) => {
  const { jobPostId } = req.params;

  try {
    const [rows] = await db.query(
      `SELECT DISTINCT u.user_id, u.username, u.name, u.surname, u.email, 
              us.skill_id, us.proficiency_level, us.years_experience
       FROM users u
       JOIN user_skills us ON u.user_id = us.user_id
       JOIN job_skills js ON us.skill_id = js.skill_id
       WHERE js.job_post_id = ? AND u.role = 'contractor'`,
      [jobPostId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: 'No matching contractors found' });
    }

    res.json(rows);
  } catch (error) {
    console.error('Error fetching matching contractors:', error);
    res.status(500).json({ message: 'Server error' });
  }
};