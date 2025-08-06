const db = require('../config/db');

const statusMap = {
  0: 'pending',
  1: 'confirmed',
  2: 'canceled'
};

const mapStatus = booking => ({
  ...booking,
  status: statusMap[booking.status] || 'unknown'
});

exports.getAllBookings = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM bookings');
    const bookings = rows.map(mapStatus);
    res.json(bookings);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getBookingById = async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await db.query('SELECT * FROM bookings WHERE booking_id = ?', [id]);
    if (rows.length === 0) return res.status(404).json({ message: 'Booking not found' });

    const booking = mapStatus(rows[0]);
    res.json(booking);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.createBooking = async (req, res) => {
  const { job_post_id, user_id, booking_date, status } = req.body;

  if (!job_post_id || !user_id || !booking_date) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  try {
    const [result] = await db.query(
      'INSERT INTO bookings (job_post_id, user_id, booking_date, status) VALUES (?, ?, ?, ?)',
      [job_post_id, user_id, booking_date, status ?? 0] // default pending
    );

    const [newBookingRows] = await db.query('SELECT * FROM bookings WHERE booking_id = ?', [result.insertId]);
    const newBooking = mapStatus(newBookingRows[0]);

    res.status(201).json({ message: 'Booking created successfully', booking: newBooking });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updateBooking = async (req, res) => {
  const { id } = req.params;
  const { job_post_id, user_id, booking_date, status } = req.body;

  try {
    const [result] = await db.query(
      'UPDATE bookings SET job_post_id=?, user_id=?, booking_date=?, status=? WHERE booking_id=?',
      [job_post_id, user_id, booking_date, status, id]
    );

    if (result.affectedRows === 0) return res.status(404).json({ message: 'Booking not found' });

    const [updatedBookingRows] = await db.query('SELECT * FROM bookings WHERE booking_id = ?', [id]);
    const updatedBooking = mapStatus(updatedBookingRows[0]);

    res.json({ message: 'Booking updated successfully', booking: updatedBooking });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.deleteBooking = async (req, res) => {
  const { id } = req.params;

  try {
    const [result] = await db.query('DELETE FROM bookings WHERE booking_id = ?', [id]);
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Booking not found' });

    res.json({ message: 'Booking deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};
