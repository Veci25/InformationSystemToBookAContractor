import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from '../utils/axios';

export default function JobPostEdit() {
  const { id } = useParams();                 
  const navigate = useNavigate();

  const [me, setMe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    job_title: '',
    job_description: '',
    job_price: '',
    job_deadline: '',
  });

  const onChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  useEffect(() => {
    (async () => {
      try {
        // load current user
        const { data: meData } = await axios.get('/users/me');
        setMe(meData);

        const { data: job } = await axios.get(`/job-posts/${id}`);

        if (meData.role !== 'admin' && meData.user_id !== job.user_id) {
          alert('You are not allowed to edit this job post.');
          navigate('/job-posts', { replace: true });
          return;
        }

        setForm({
          job_title: job.job_title || '',
          job_description: job.job_description || '',
          job_price: job.job_price ?? '',
          job_deadline: job.job_deadline
            ? new Date(job.job_deadline).toISOString().slice(0, 10)
            : '',
        });
      } catch (e) {
        console.error(e);
        alert(e.response?.data?.message || 'Failed to load job post');
        navigate('/job-posts', { replace: true });
      } finally {
        setLoading(false);
      }
    })();
  }, [id, navigate]);

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await axios.patch(`/job-posts/${id}`, {
        job_title: form.job_title,
        job_description: form.job_description,
        job_price: Number(form.job_price),
        job_deadline: form.job_deadline,
      });
      alert('Job post updated.');
      navigate('/job-posts');
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Could not save changes');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="container py-4">Loading…</div>;

  return (
    <div className="container py-4">
      <div className="d-flex align-items-center justify-content-between mb-3">
        <h2 className="mb-0">Edit Job Post</h2>
        <Link className="btn btn-outline-secondary btn-sm" to="/job-posts">
          Back
        </Link>
      </div>

      <form onSubmit={save} className="card p-4 shadow-sm">
        <div className="mb-3">
          <label className="form-label">Title</label>
          <input
            className="form-control"
            name="job_title"
            value={form.job_title}
            onChange={onChange}
            required
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Description</label>
          <textarea
            className="form-control"
            name="job_description"
            rows={4}
            value={form.job_description}
            onChange={onChange}
            required
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Price</label>
          <input
            type="number"
            min="0"
            step="0.01"
            className="form-control"
            name="job_price"
            value={form.job_price}
            onChange={onChange}
            required
          />
        </div>

        <div className="mb-4">
          <label className="form-label">Deadline</label>
          <input
            type="date"
            className="form-control"
            name="job_deadline"
            value={form.job_deadline}
            onChange={onChange}
            required
          />
        </div>

        <div className="d-flex gap-2">
          <button className="btn btn-primary" disabled={saving}>
            {saving ? 'Saving…' : 'Save changes'}
          </button>
          <Link to="/job-posts" className="btn btn-outline-secondary">
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
