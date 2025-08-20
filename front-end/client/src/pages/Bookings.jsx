import React, { useEffect, useState } from 'react';
import axios from '../utils/axios';

const Bookings = () => {
  const [user, setUser] = useState(null);
  const [jobPosts, setJobPosts] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [selectedJob, setSelectedJob] = useState('');
  const [bookingDate, setBookingDate] = useState('');

  useEffect(() => {
    const fetchUserData = async () => {
      const res = await axios.get('/users/me');
      setUser(res.data);

      const jobs = await axios.get('/job-posts');
      const userJobs = jobs.data.filter(j => j.user_id === res.data.user_id);
      setJobPosts(userJobs);

      const allBookings = await axios.get('/bookings');
      const myBookings = allBookings.data.filter(b => b.user_id === res.data.user_id);
      setBookings(myBookings);
    };
    fetchUserData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedJob || !bookingDate) return alert('Fill all fields');

    try {
      await axios.post('/bookings', {
        user_id: user.user_id,
        job_post_id: selectedJob,
        booking_date: bookingDate,
        status: 0,
      });
      alert('Booking created!');
      window.location.reload();
    } catch {
      alert('Failed to create booking');
    }
  };

  return (
    <div className="container mt-5">
      <h2>Book a Job</h2>
      <form onSubmit={handleSubmit} className="row g-3">
        <div className="col-md-6">
          <select className="form-select" value={selectedJob} onChange={e => setSelectedJob(e.target.value)} required>
            <option value="">Select Job</option>
            {jobPosts.map(job => (
              <option key={job.job_post_id} value={job.job_post_id}>{job.job_title}</option>
            ))}
          </select>
        </div>
        <div className="col-md-6">
          <input className="form-control" type="date" value={bookingDate} onChange={e => setBookingDate(e.target.value)} required />
        </div>
        <div className="col-12">
          <button className="btn btn-success" type="submit">Book</button>
        </div>
      </form>

      <h4 className="mt-4">Your Bookings</h4>
      <ul className="list-group">
        {bookings.map(b => (
          <li key={b.booking_id} className="list-group-item">
            Job #{b.job_post_id} on {b.booking_date} — <strong>Status:</strong> {b.status}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Bookings;