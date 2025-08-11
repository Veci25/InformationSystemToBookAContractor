const db = require('../config/db');

const STATUS = { PENDING: 0, CONFIRMED: 1, CANCELED: 2 };
const statusMap = { 0: 'pending', 1: 'confirmed', 2: 'canceled' };
const mapStatus = b => ({ ...b, status: statusMap[b.status] || 'unknown' });
const isAdmin = (req) => req?.user?.role === 'admin';

exports.getAllBookings = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM bookings');
    res.json(rows.map(mapStatus));
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getMyBookingRequests = async (req, res) => {
  try {
    const uid = req.user.user_id;

    const [rows] = await db.query(
      `SELECT 
         b.*,
         jp.job_title,
         cu.user_id  AS client_id,
         cu.username AS client_username,
         CONCAT_WS(' ', cu.name, cu.surname) AS client_display_name
       FROM bookings b
       JOIN job_posts jp ON jp.job_post_id = b.job_post_id
       JOIN users cu     ON cu.user_id      = jp.user_id   -- client (job owner)
       WHERE b.user_id = ?
       ORDER BY b.booking_date DESC`,
      [uid]
    );

    res.json(rows.map(mapStatus));
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getBookingsForMyJobs = async (req, res) => {
  try {
    const uid = req.user.user_id;

    const [rows] = await db.query(
      `SELECT 
         b.*,
         u.user_id  AS contractor_id,
         u.username AS contractor_username,
         CONCAT_WS(' ', u.name, u.surname) AS contractor_display_name,
         jp.job_title
       FROM bookings b
       JOIN job_posts jp ON jp.job_post_id = b.job_post_id
       JOIN users u      ON u.user_id      = b.user_id     -- contractor (requester)
       WHERE jp.user_id = ?
       ORDER BY b.booking_date DESC`,
      [uid]
    );

    res.json(rows.map(mapStatus));
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.adminListBookings = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT 
         b.*,
         jp.job_title,
         -- contractor (the requester)
         u.user_id   AS contractor_id,
         u.username  AS contractor_username,
         CONCAT_WS(' ', u.name, u.surname) AS contractor_display_name,
         -- client (job owner)
         cu.user_id  AS client_id,
         cu.username AS client_username,
         CONCAT_WS(' ', cu.name, cu.surname) AS client_display_name
       FROM bookings b
       JOIN users u      ON u.user_id      = b.user_id
       JOIN job_posts jp ON jp.job_post_id = b.job_post_id
       JOIN users cu     ON cu.user_id     = jp.user_id
       ORDER BY b.booking_date DESC, b.booking_id DESC`
    );

    res.json(rows.map(mapStatus));
  } catch (e) {
    console.error('adminListBookings error:', e);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.createBooking = async (req, res) => {
  try {
    const { job_post_id, booking_date } = req.body;
    const userId = req.user?.user_id;        

    if (!job_post_id || !booking_date || !userId) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const [ownerRow] = await db.query(
      'SELECT user_id FROM job_posts WHERE job_post_id = ?',
      [job_post_id]
    );
    if (ownerRow[0] && ownerRow[0].user_id === userId) {
      return res.status(400).json({ message: 'You cannot request your own job.' });
    }

    const [dup] = await db.query(
      'SELECT 1 FROM bookings WHERE job_post_id=? AND user_id=? AND booking_date=?',
      [job_post_id, userId, booking_date]
    );
    if (dup.length) {
      return res.status(409).json({ message: 'You already requested this date.' });
    }

    const [result] = await db.query(
      'INSERT INTO bookings (job_post_id, user_id, booking_date, status) VALUES (?, ?, ?, 0)',
      [job_post_id, userId, booking_date]
    );

    const [rows] = await db.query('SELECT * FROM bookings WHERE booking_id=?', [result.insertId]);
    const booking = rows[0];
    booking.status = ['pending','confirmed','canceled'][booking.status] || 'unknown';

    return res.status(201).json({ message: 'Booking created', booking });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: 'Server error' });
  }
};

exports.updateBookingStatus = async (req, res) => {
  const me = req.user;
  const { id } = req.params;
  const { status } = req.body; 

  const newStatus = Number(status);
  if (![STATUS.PENDING, STATUS.CONFIRMED, STATUS.CANCELED].includes(newStatus)) {
    return res.status(400).json({ message: 'Invalid status' });
  }

  try {
    const [rows] = await db.query(
      `SELECT b.*, jp.user_id AS client_id 
       FROM bookings b 
       JOIN job_posts jp ON jp.job_post_id = b.job_post_id
       WHERE b.booking_id=?`,
      [id]
    );
    if (!rows.length) return res.status(404).json({ message: 'Booking not found' });
    const booking = rows[0];

    if (!isAdmin(req) && booking.client_id !== me.user_id) {
      return res.status(403).json({ message: 'Not allowed' });
    }

    await db.query('UPDATE bookings SET status=? WHERE booking_id=?', [newStatus, id]);

    if (newStatus === STATUS.CONFIRMED) {
      await db.query(
        'UPDATE bookings SET status=? WHERE job_post_id=? AND booking_date=? AND booking_id<>? AND status=0',
        [STATUS.CANCELED, booking.job_post_id, booking.booking_date, id]
      );
    }

    const [[updated]] = await db.query('SELECT * FROM bookings WHERE booking_id=?', [id]);
    res.json({ message: 'Booking updated', booking: mapStatus(updated) });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Server error' });
  }
};


exports.deleteBooking = async (req, res) => {
  const me = req.user;
  const { id } = req.params;

  try {
    const [rows] = await db.query(
      `SELECT b.*, jp.user_id AS client_id 
       FROM bookings b 
       JOIN job_posts jp ON jp.job_post_id = b.job_post_id
       WHERE b.booking_id=?`,
      [id]
    );
    if (!rows.length) return res.status(404).json({ message: 'Booking not found' });
    const b = rows[0];

    const can =
      isAdmin(req) || b.user_id === me.user_id || b.client_id === me.user_id;
    if (!can) return res.status(403).json({ message: 'Not allowed' });

    await db.query('DELETE FROM bookings WHERE booking_id=?', [id]);
    res.json({ message: 'Booking deleted' });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getBookingById = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await db.query('SELECT * FROM bookings WHERE booking_id = ?', [id]);
    if (rows.length === 0) return res.status(404).json({ message: 'Booking not found' });
    res.json(mapStatus(rows[0]));
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updateBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const { job_post_id, user_id, booking_date, status } = req.body;

    if (booking_date) {
      const today = new Date(); today.setHours(0,0,0,0);
      const d = new Date(booking_date);
      if (d < today) return res.status(400).json({ message: 'Invalid booking date' });
    }

    const [result] = await db.query(
      'UPDATE bookings SET job_post_id=?, user_id=?, booking_date=?, status=? WHERE booking_id=?',
      [job_post_id, user_id, booking_date, status, id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Booking not found' });

    const [[updated]] = await db.query('SELECT * FROM bookings WHERE booking_id = ?', [id]);
    res.json({ message: 'Booking updated successfully', booking: mapStatus(updated) });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Server error' });
  }
};
