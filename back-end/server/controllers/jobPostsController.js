const db = require('../config/db');

exports.getAllJobPosts = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM job_posts');
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getJobPostById = async (req, res) => {
  try {
    const { id } = req.params;

    const [rows] = await db.query(
      `
      SELECT
        jp.job_post_id,
        jp.user_id,
        jp.job_title,
        jp.job_description,
        jp.job_price,
        jp.job_deadline,

        -- Prefer "name surname"; fall back to username
        COALESCE(
          NULLIF(CONCAT(TRIM(u.name), ' ', TRIM(u.surname)), ' '),
          u.username
        ) AS client_display_name,
        u.username AS client_username,

        -- Comma-separated skills for convenience
        GROUP_CONCAT(DISTINCT s.skill_name ORDER BY s.skill_name SEPARATOR ', ') AS required_skills
      FROM job_posts jp
      LEFT JOIN users u       ON u.user_id = jp.user_id
      LEFT JOIN job_skills js ON js.job_post_id = jp.job_post_id
      LEFT JOIN skills s      ON s.skill_id = js.skill_id
      WHERE jp.job_post_id = ?
      GROUP BY jp.job_post_id
      `,
      [id]
    );

    if (!rows.length) return res.status(404).json({ message: 'Job post not found' });
    res.json(rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.createJobPost = async (req, res) => {
  try {
    const { user_id, job_title, job_description, job_price, job_deadline } = req.body;
    if (!user_id || !job_title || !job_description || !job_price || !job_deadline) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const [result] = await db.query(
      `INSERT INTO job_posts (user_id, job_title, job_description, job_price, job_deadline)
       VALUES (?, ?, ?, ?, ?)`,
      [user_id, job_title, job_description, job_price, job_deadline]
    );

    return res.status(201).json({
      message: 'Job post created successfully',
      job_post_id: result.insertId,
    });
  } catch (error) {
    console.error('createJobPost error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updateJobPost = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    const role = req.user?.role;
    const isAdmin = role = 'admin';

    if (!userId) return res.status(401).json({ message: 'Auth required' });
    if (!isAdmin && role !== 'client') return res.status(403).json({ message: 'Clients only' });

    const [rows] = await db.query(
      'SELECT user_id FROM job_posts WHERE job_post_id = ?',
      [id]
    );
    if (!rows.length) return res.status(404).json({ message: 'Job post not found' });
    if (!isAdmin && rows[0].user_id !== userId) {
      return res.status(403).json({ message: 'Not your job post' });
    }
    const { job_title, job_description, job_price, job_deadline } = req.body;

    const updates = [];
    const values = [];

    if (typeof job_title !== 'undefined') {
      updates.push('job_title = ?');
      values.push(String(job_title).trim());
    }
    if (typeof job_description !== 'undefined') {
      updates.push('job_description = ?');
      values.push(String(job_description).trim());
    }
    if (typeof job_price !== 'undefined') {
      const price = Number(job_price);
      if (Number.isNaN(price) || price < 0) {
        return res.status(400).json({ message: 'Invalid price' });
      }
      updates.push('job_price = ?');
      values.push(price);
    }
    if (typeof job_deadline !== 'undefined') {
      updates.push('job_deadline = ?');
      values.push(job_deadline || null);
    }

    if (updates.length === 0) {
      return res.status(400).json({ message: 'Nothing to update' });
    }

    values.push(id, userId);

    const sql = `UPDATE job_posts SET ${updates.join(', ')} WHERE job_post_id = ? AND user_id = ?`;
    const [result] = await db.query(sql, values);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Job post not found' });
    }
    const [fresh] = await db.query(
      `
      SELECT
        jp.job_post_id, jp.user_id, jp.job_title, jp.job_description,
        jp.job_price, jp.job_deadline
      FROM job_posts jp
      WHERE jp.job_post_id = ?
      `,
      [id]
    );

    return res.json({ message: 'Job post updated successfully', job: fresh[0] });
  } catch (error) {
    console.error('updateJobPost error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.deleteJobPost = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    const role = req.user?.role;
    const isAdmin = role === 'admin';

    if (!userId) return res.status(401).json({ message: 'Auth required' });
    if (!isAdmin && role !== 'client') return res.status(403).json({ message: 'Clients only' });

    const [rows] = await db.query('SELECT user_id FROM job_posts WHERE job_post_id = ?', [id]);
    if (!rows.length) return res.status(404).json({ message: 'Job post not found' });
    if (!isAdmin && rows[0].user_id !== userId) return res.status(403).json({ message: 'Not your job post' });

    await db.query('DELETE FROM job_skills WHERE job_post_id = ?', [id]);
    await db.query('DELETE FROM bookings WHERE job_post_id = ?', [id]);
    const [result] = await db.query('DELETE FROM job_posts WHERE job_post_id = ?', [id]);

    if (!result.affectedRows) return res.status(404).json({ message: 'Job post not found' });
    return res.json({ message: 'Job post deleted successfully' });
  } catch (e) {
    console.error('deleteJobPost error:', e);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getMatchesForMe = async (req, res) => {
  try {
    const contractorId = req.user.id;

    const sql = `
      WITH my_skills AS (
        SELECT skill_id FROM user_skills WHERE user_id = ?
      )
      SELECT
        jp.job_post_id, jp.job_title, jp.job_description, jp.job_price,
        jp.job_deadline, jp.user_id AS client_id,
        c.username AS client_username, c.name AS client_name, c.surname AS client_surname,
        GROUP_CONCAT(DISTINCT s.skill_name ORDER BY s.skill_name) AS required_skills
      FROM job_posts jp
      LEFT JOIN job_skills js ON js.job_post_id = jp.job_post_id
      LEFT JOIN skills s      ON s.skill_id = js.skill_id
      JOIN users c            ON c.user_id = jp.user_id AND c.role='client'
      JOIN my_skills ms       ON ms.skill_id = js.skill_id

      LEFT JOIN bookings b_job
        ON b_job.job_post_id = jp.job_post_id

      LEFT JOIN bookings b_me
        ON b_me.user_id = ?
       AND DATE(b_me.booking_date) = DATE(jp.job_deadline)

      WHERE b_job.booking_id IS NULL
        AND b_me.booking_id IS NULL
      GROUP BY jp.job_post_id
      ORDER BY jp.job_deadline ASC
      LIMIT 200;
    `;
    const [rows] = await db.query(sql, [contractorId, contractorId]);
    res.json(rows);
  } catch (err) {
    console.error('getMatchesForMe error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getContractorsForJob = async (req, res) => {
  const jobId = parseInt(req.params.jobId, 10);
  if (!jobId) return res.status(400).json({ message: 'jobId required' });

  try {
    const [rows] = await db.query(
      `
      SELECT
        u.user_id,
        u.username,
        u.name,
        u.surname,
        GROUP_CONCAT(DISTINCT s.skill_name ORDER BY s.skill_name SEPARATOR ', ') AS matched_skills,
        SUM(js.is_mandatory) AS total_required,
        SUM(CASE WHEN js.is_mandatory = 1 AND us.skill_id IS NOT NULL THEN 1 ELSE 0 END) AS required_matched,
        COUNT(DISTINCT us.skill_id) AS total_matched
      FROM job_skills js
      JOIN users u ON u.role = 'contractor'
      LEFT JOIN user_skills us
        ON us.user_id = u.user_id
       AND us.skill_id = js.skill_id
      LEFT JOIN skills s
        ON s.skill_id = us.skill_id
      WHERE js.job_post_id = ?
      GROUP BY u.user_id
      HAVING required_matched = total_required
      ORDER BY total_matched DESC, u.user_id ASC
      `,
      [jobId]
    );

    res.json(rows);
  } catch (err) {
    console.error('getContractorsForJob error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

