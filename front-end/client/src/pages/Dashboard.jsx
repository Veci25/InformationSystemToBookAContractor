// src/pages/Dashboard.jsx
import React, { useEffect, useState } from 'react';
import axios from '../utils/axios';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [data, setData] = useState([]);
  const navigate = useNavigate();

  // Redirect if not logged in
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
    }
  }, [navigate]);

  // Fetch current user
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get('/users/me');
        setUser(res.data);
      } catch (err) {
        console.error('Failed to fetch user', err);
        localStorage.removeItem('token');
        navigate('/login');
      }
    };

    fetchUser();
  }, [navigate]);

  // Fetch role-specific data
  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

      try {
        if (user.role === 'contractor') {
          const res = await axios.get(`/skills/match/${user.user_id}`);
          setData(res.data);
        } else if (user.role === 'client') {
          const res = await axios.get('/job-posts'); // ideally filter by user_id
          const userPosts = res.data.filter(job => job.user_id === user.user_id);
          setData(userPosts);
        }
      } catch (err) {
        console.error('Error loading dashboard data:', err);
      }
    };

    fetchData();
  }, [user]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h2>Dashboard</h2>

      {user ? (
        <>
          <p>Welcome, {user.name || user.username} ({user.role})</p>
          <button onClick={handleLogout}>Logout</button>

          <div style={{ marginTop: '2rem' }}>
            {user.role === 'contractor' ? (
              <>
                <h3>Matched Jobs for You</h3>
                <ul>
                  {data.map(job => (
                    <li key={job.job_post_id}>
                      <strong>{job.job_title}</strong> - {job.job_description}
                    </li>
                  ))}
                </ul>
              </>
            ) : (
              <>
                <h3>Your Job Posts</h3>
                <ul>
                  {data.map(job => (
                    <li key={job.job_post_id}>
                      <strong>{job.job_title}</strong> - {job.job_description}
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>
        </>
      ) : (
        <p>Loading user data...</p>
      )}
    </div>
  );
};

export default Dashboard;
