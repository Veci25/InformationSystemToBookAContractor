import React, { useEffect, useState } from 'react';
import axios from '../utils/axios';
import { useNavigate, Link } from 'react-router-dom';

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [data, setData] = useState([]);
  const [loadingUser, setLoadingUser] = useState(true);
  const [loadingData, setLoadingData] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) navigate('/login');
  }, [navigate]);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get('/users/me');
        setUser(res.data);
      } catch (err) {
        console.error('Failed to fetch user', err);
        localStorage.removeItem('token');
        navigate('/login');
      } finally {
        setLoadingUser(false);
      }
    };
    fetchUser();
  }, [navigate]);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      setLoadingData(true);
      try {
        if (user.role === 'contractor') {
          const res = await axios.get(`/skills/match/${user.user_id}`);
          setData(res.data);
        } else {
          const res = await axios.get('/job-posts');
          setData(res.data.filter(job => job.user_id === user.user_id));
        }
      } catch (err) {
        console.error('Error loading dashboard data:', err);
      } finally {
        setLoadingData(false);
      }
    };
    fetchData();
  }, [user]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  if (loadingUser) {
    return (
      <div className="container py-5 text-center text-muted">Loading user…</div>
    );
  }

  return (
    <div className="container py-4">
      {/* Header */}
      <div className="d-flex align-items-center justify-content-between mb-4">
        <div>
          <h2 className="mb-0">Dashboard</h2>
          <small className="text-muted">
            Welcome, <strong>{user?.name || user?.username}</strong> &middot; {user?.role}
          </small>
        </div>
        <div className="d-flex gap-2">
          {user?.role === 'client' ? (
            <>
              <Link to="/job-posts" className="btn btn-primary">Create Job Post</Link>
              <Link to="/bookings" className="btn btn-outline-primary">Bookings</Link>
            </>
          ) : (
            <>
              <Link to="/skills" className="btn btn-primary">Manage Skills</Link>
              <Link to="/ratings" className="btn btn-outline-primary">Ratings</Link>
            </>
          )}
          <button className="btn btn-outline-danger" onClick={handleLogout}>Logout</button>
        </div>
      </div>

      {/* Quick stats */}
      <div className="row g-3 mb-4">
        <div className="col-sm-6 col-lg-3">
          <div className="card shadow-sm text-center p-3">
            <small className="text-muted">Items</small>
            <h3 className="mb-0">{loadingData ? '—' : data.length}</h3>
          </div>
        </div>
        <div className="col-sm-6 col-lg-3">
          <div className="card shadow-sm text-center p-3">
            <small className="text-muted">Role</small>
            <h3 className="mb-0 text-capitalize">{user?.role}</h3>
          </div>
        </div>
        <div className="col-sm-6 col-lg-3">
          <div className="card shadow-sm text-center p-3">
            <small className="text-muted">User ID</small>
            <h5 className="mb-0">{user?.user_id}</h5>
          </div>
        </div>
        <div className="col-sm-6 col-lg-3">
          <div className="card shadow-sm text-center p-3">
            <small className="text-muted">Actions</small>
            <h5 className="mb-0">{user?.role === 'client' ? 'Post / Book' : 'Match / Rate'}</h5>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="card shadow-sm">
        <div className="card-body">
          {user?.role === 'contractor' ? (
            <>
              <div className="d-flex align-items-center justify-content-between mb-3">
                <h5 className="mb-0">Matched Jobs for You</h5>
                <Link to="/skills" className="btn btn-sm btn-outline-secondary">Update Skills</Link>
              </div>

              {loadingData ? (
                <div className="text-muted">Loading matches…</div>
              ) : data.length === 0 ? (
                <div className="text-muted">No matches yet. Add more skills to get better matches.</div>
              ) : (
                <ul className="list-group list-group-flush">
                  {data.map(job => (
                    <li className="list-group-item" key={job.job_post_id}>
                      <div className="d-flex align-items-start">
                        <div className="flex-grow-1">
                          <div className="fw-semibold">{job.job_title}</div>
                          <small className="text-muted">{job.job_description}</small>
                        </div>
                        <span className="badge text-bg-primary ms-3">Job #{job.job_post_id}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </>
          ) : (
            <>
              <div className="d-flex align-items-center justify-content-between mb-3">
                <h5 className="mb-0">Your Job Posts</h5>
                <Link to="/job-posts" className="btn btn-sm btn-primary">New Post</Link>
              </div>

              {loadingData ? (
                <div className="text-muted">Loading your posts…</div>
              ) : data.length === 0 ? (
                <div className="text-muted">You don’t have any job posts yet. Create your first post.</div>
              ) : (
                <ul className="list-group list-group-flush">
                  {data.map(job => (
                    <li className="list-group-item" key={job.job_post_id}>
                      <div className="d-flex align-items-start">
                        <div className="flex-grow-1">
                          <div className="fw-semibold">{job.job_title}</div>
                          <small className="text-muted">{job.job_description}</small>
                        </div>
                        <span className="badge text-bg-secondary ms-3">#{job.job_post_id}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
