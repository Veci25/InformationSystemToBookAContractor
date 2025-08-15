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

  if (loadingUser) {
    return <div className="container py-5 text-center text-muted">Loading user…</div>;
  }

  const StatCard = ({ label, value, actions = false }) => (
    <div className="col-6 col-lg-3">
      <div className="card shadow-sm h-100">
        <div
          className="card-body d-flex flex-column align-items-center justify-content-center text-center"
          style={{ minHeight: 120 }}
        >
          <small className="text-muted">{label}</small>
          {!actions ? (
            <div className="fs-2 fw-semibold mt-1">{value}</div>
          ) : (
            <div className="d-flex gap-2 mt-2 flex-wrap justify-content-center">
              {value}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="container py-4">
      <div className="mb-4">
        <h2 className="mb-0">Dashboard</h2>
        <small className="text-muted">
          Welcome, <strong>{user?.name || user?.username}</strong> · {user?.role}
        </small>
      </div>

      <div className="row g-3 mb-4">
        <StatCard label="Items" value={loadingData ? '—' : data.length} />
        <StatCard label="Role" value={<span className="text-capitalize">{user?.role}</span>} />
        <StatCard label="User ID" value={user?.user_id} />
        <StatCard
         label="Shortcuts"
         actions
         value={
         user?.role === 'contractor' ? (
         <>
          <Link to="/matching-jobs" className="btn btn-sm btn-outline-primary">Match</Link>
          <Link to="/ratings" className="btn btn-sm btn-outline-secondary">Rate</Link>
        </>
        ) : user?.role === 'client' ? (
        <>
          <Link to="/job-posts/new" className="btn btn-sm btn-outline-primary">New Post</Link>
          <Link to="/bookings" className="btn btn-sm btn-outline-secondary">Bookings</Link>
        </>
        ) : (
        <>
          <Link to="/job-posts/new" className="btn btn-sm btn-outline-primary">New Post</Link>
          <Link to="/bookings" className="btn btn-sm btn-outline-secondary">Bookings</Link>
          <Link to="/matching-jobs" className="btn btn-sm btn-outline-primary">Match</Link>
          <Link to="/ratings" className="btn btn-sm btn-outline-secondary">Rate</Link>
        </>
        )
       }
      />

      </div>

      <div className="card shadow-sm">
        <div className="card-body">
          {user?.role === 'contractor' ? (
            <>
              <h5 className="mb-3">Matched Jobs for You</h5>

              {loadingData ? (
                <div className="text-muted">Loading matches…</div>
              ) : data.length === 0 ? (
                <div className="text-muted">
                  No matches yet. Add more skills to get better matches (use the Skills page in the top nav).
                </div>
              ) : (
                <ul className="list-group list-group-flush">
                  {data.map(job => (
                    <li className="list-group-item" key={job.job_post_id}>
                      <div className="d-flex align-items-start">
                        <div className="flex-grow-1">
                          <div className="fw-semibold">{job.job_title}</div>
                          <small className="text-muted">{job.job_description}</small>
                        </div>
                        <Link
                          to={`/job-posts/${job.job_post_id}`}
                          className="badge text-bg-primary ms-3 text-decoration-none"
                        >
                          Job #{job.job_post_id}
                        </Link>
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
                        <Link
                          to={`/job-posts/${job.job_post_id}`}
                          className="badge text-bg-secondary ms-3 text-decoration-none"
                        >
                          #{job.job_post_id}
                        </Link>
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
