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
    if (!token) navigate('/login');
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
      window.location.reload(); 
    } catch (err) {
      alert('Failed to create job post');
    }
  };

  return (
    <div className="container py-4">
      <h2 className="mb-4">Create Job Post</h2>

      {/* Job post form */}
      <form onSubmit={handleSubmit} className="card p-4 shadow-sm mb-5">
        <div className="mb-3">
          <label className="form-label">Title</label>
          <input
            name="job_title"
            className="form-control"
            placeholder="Enter job title"
            value={form.job_title}
            onChange={handleChange}
            required
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Description</label>
          <textarea
            name="job_description"
            className="form-control"
            placeholder="Describe the job"
            value={form.job_description}
            onChange={handleChange}
            rows={3}
            required
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Price</label>
          <input
            name="job_price"
            type="number"
            className="form-control"
            placeholder="Enter price"
            value={form.job_price}
            onChange={handleChange}
            required
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Deadline</label>
          <input
            name="job_deadline"
            type="date"
            className="form-control"
            value={form.job_deadline}
            onChange={handleChange}
            required
          />
        </div>

        <button type="submit" className="btn btn-primary">Create Job</button>
      </form>

      {/* List of existing job posts */}
      <h3 className="mb-3">Your Job Posts</h3>
      {jobPosts.length === 0 ? (
        <p className="text-muted">You haven’t posted any jobs yet.</p>
      ) : (
        <div className="row g-3">
          {jobPosts.map(job => (
            <div key={job.job_post_id} className="col-md-6">
              <div className="card shadow-sm h-100">
                <div className="card-body">
                  <h5 className="card-title">{job.job_title}</h5>
                  <p className="card-text text-muted">{job.job_description}</p>
                  <p className="mb-1"><strong>Price:</strong> ${job.job_price}</p>
                  <p className="mb-0"><strong>Deadline:</strong> {job.job_deadline}</p>
                </div>
                <div className="card-footer text-end">
                  <span className="badge text-bg-secondary">ID #{job.job_post_id}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default JobPosts;
