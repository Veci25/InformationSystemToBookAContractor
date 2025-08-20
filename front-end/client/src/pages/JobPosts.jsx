// src/pages/JobPosts.jsx
import React, { useEffect, useState } from 'react';
import axios from '../utils/axios';
import { useNavigate } from 'react-router-dom';

const JobPosts = () => {
  const [user, setUser] = useState(null);
  const [jobPosts, setJobPosts] = useState([]);
  const [form, setForm] = useState({
    job_title: '',
    job_description: '',
    job_price: '',
    job_deadline: ''
  });

  const navigate = useNavigate();

  // Redirect if not logged in
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
    }
  }, [navigate]);

  // Get current user
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get('/users/me');
        setUser(res.data);
      } catch (err) {
        console.error('Error fetching user:', err);
        navigate('/login');
      }
    };
    fetchUser();
  }, [navigate]);

  // Fetch job posts for this user
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await axios.get('/job-posts');
        const userPosts = res.data.filter(post => post.user_id === user?.user_id);
        setJobPosts(userPosts);
      } catch (err) {
        console.error('Error fetching job posts:', err);
      }
    };

    if (user?.user_id) fetchPosts();
  }, [user]);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      await axios.post('/job-posts', {
        ...form,
        user_id: user.user_id
      });
      alert('Job post created');
      setForm({ job_title: '', job_description: '', job_price: '', job_deadline: '' });
      window.location.reload(); // Refresh list (or re-fetch manually)
    } catch (err) {
      alert('Failed to create job post');
    }
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h2>Create Job Post</h2>
      <form onSubmit={handleSubmit}>
        <input
          name="job_title"
          placeholder="Title"
          value={form.job_title}
          onChange={handleChange}
          required
        /><br />
        <textarea
          name="job_description"
          placeholder="Description"
          value={form.job_description}
          onChange={handleChange}
          required
        /><br />
        <input
          name="job_price"
          type="number"
          placeholder="Price"
          value={form.job_price}
          onChange={handleChange}
          required
        /><br />
        <input
          name="job_deadline"
          type="date"
          value={form.job_deadline}
          onChange={handleChange}
          required
        /><br />
        <button type="submit">Create</button>
      </form>

      <h3 style={{ marginTop: '2rem' }}>Your Job Posts</h3>
      <ul>
        {jobPosts.map(job => (
          <li key={job.job_post_id}>
            <strong>{job.job_title}</strong> – {job.job_description} – ${job.job_price}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default JobPosts;
