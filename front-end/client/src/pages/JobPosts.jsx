import React, { useEffect, useState } from 'react';
import axios from '../utils/axios';
import { Link, useNavigate } from 'react-router-dom';

const CREATE_JOB_SKILL_PATH = '/skills/job';

export default function JobPosts() {
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loadingUser, setLoadingUser] = useState(true);
  const [loadingPosts, setLoadingPosts] = useState(true);

  const [allSkills, setAllSkills] = useState([]);
  const [selectedSkillIds, setSelectedSkillIds] = useState([]);

  const [form, setForm] = useState({
    job_title: '',
    job_description: '',
    job_price: '',
    job_deadline: '',
  });
  const [saving, setSaving] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    if (!localStorage.getItem('token')) navigate('/login');
  }, [navigate]);

  useEffect(() => {
    (async () => {
      try {
        const me = await axios.get('/users/me');
        setUser(me.data);
      } catch (err) {
        console.error('Error fetching user:', err);
        navigate('/login');
      } finally {
        setLoadingUser(false);
      }
    })();
  }, [navigate]);

  const loadPosts = async (u) => {
    setLoadingPosts(true);
    try {
      const res = await axios.get('/job-posts');
      const list =
        u?.role === 'client'
          ? (res.data || []).filter((p) => p.user_id === u.user_id)
          : (res.data || []); // admins & contractors see ALL
      list.sort((a, b) => Number(b.job_post_id) - Number(a.job_post_id));
      setPosts(list);
    } catch (e) {
      console.error('Failed to load job posts:', e);
    } finally {
      setLoadingPosts(false);
    }
  };

  useEffect(() => {
    if (user) loadPosts(user);
  }, [user]);

  useEffect(() => {
    const canCreate = user?.role === 'client' || user?.role === 'admin';
    if (!canCreate) return;
    (async () => {
      try {
        const res = await axios.get('/skills');
        setAllSkills(res.data || []);
      } catch (e) {
        console.error('Failed to load skills', e);
      }
    })();
  }, [user]);

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const toggleSkill = (skillId) =>
    setSelectedSkillIds((prev) =>
      prev.includes(skillId) ? prev.filter((id) => id !== skillId) : [...prev, skillId]
    );

  const handleCreate = async (e) => {
    e.preventDefault();
    const canCreate = user?.role === 'client' || user?.role === 'admin';
    if (!canCreate) return;

    setSaving(true);
    try {
      const createRes = await axios.post('/job-posts', {
        ...form,
        user_id: user.user_id,
      });

      let jobId =
        createRes.data?.job_post_id ||
        createRes.data?.id ||
        createRes.data?.insertId;

      if (!jobId) {
        const res = await axios.get('/job-posts');
        const mine = (res.data || []).filter((p) => p.user_id === user.user_id);
        jobId = mine.sort((a, b) => b.job_post_id - a.job_post_id)[0]?.job_post_id;
      }

      if (jobId && selectedSkillIds.length) {
        const calls = selectedSkillIds.map((skill_id) =>
          axios.post(CREATE_JOB_SKILL_PATH, {
            job_post_id: jobId,
            skill_id,
            importance_level: 'High',
            is_mandatory: 1,
          })
        );
        await Promise.allSettled(calls);
      }

      setForm({ job_title: '', job_description: '', job_price: '', job_deadline: '' });
      setSelectedSkillIds([]);
      await loadPosts(user);
      alert('Job post created');
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to create job post');
    } finally {
      setSaving(false);
    }
  };

  const onDelete = async (id) => {
    if (!confirm('Delete this job post?')) return;
    try {
      await axios.delete(`/job-posts/${id}`); // backend allows admin delete
      await loadPosts(user);
    } catch (e) {
      console.error(e);
      alert(e.response?.data?.message || 'Failed to delete post');
    }
  };

  if (loadingUser) {
    return <div className="container py-5 text-muted">Loading…</div>;
  }

  const isClient = user?.role === 'client';
  const isAdmin = user?.role === 'admin';
  const canCreate = isClient || isAdmin;
  const canManage = isClient || isAdmin; 

  return (
    <div className="container py-4">
      <div className="d-flex align-items-center justify-content-between mb-3">
        <h2 className="mb-0">{canCreate ? 'Create Job Post' : 'Browse Job Posts'}</h2>
      </div>

      {canCreate && (
        <form onSubmit={handleCreate} className="card p-4 shadow-sm mb-5">
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
              min="0"
              step="0.01"
              className="form-control"
              placeholder="Enter price"
              value={form.job_price}
              onChange={handleChange}
              required
            />
          </div>

          <div className="mb-4">
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

          <div className="mb-4">
            <label className="form-label">Required Skills</label>
            {allSkills.length === 0 ? (
              <div className="text-muted small">No skills defined yet.</div>
            ) : (
              <div className="row">
                {allSkills.map((s) => (
                  <div className="col-6 col-md-4" key={s.skill_id}>
                    <div className="form-check">
                      <input
                        id={`skill-${s.skill_id}`}
                        className="form-check-input"
                        type="checkbox"
                        checked={selectedSkillIds.includes(s.skill_id)}
                        onChange={() => toggleSkill(s.skill_id)}
                      />
                      <label className="form-check-label" htmlFor={`skill-${s.skill_id}`}>
                        {s.skill_name}
                      </label>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {selectedSkillIds.length > 0 && (
              <div className="form-text">{selectedSkillIds.length} skill(s) selected</div>
            )}
          </div>

          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? 'Creating…' : 'Create Job'}
          </button>
        </form>
      )}

      <div className="d-flex align-items-center justify-content-between mb-2">
        <h3 className="mb-0">{isClient ? 'Your Job Posts' : 'All Job Posts'}</h3>
      </div>

      {loadingPosts ? (
        <div className="text-muted">Loading posts…</div>
      ) : posts.length === 0 ? (
        <div className="text-muted">
          {isClient ? 'You haven’t posted any jobs yet.' : 'No job posts available.'}
        </div>
      ) : (
        <div className="row g-3">
          {posts.map((job) => (
            <div key={job.job_post_id} className="col-md-6">
              <div className="card shadow-sm h-100">
                <div className="card-body">
                  <h5 className="card-title">{job.job_title}</h5>
                  <p className="card-text text-muted mb-3">
                    {job.job_description?.length > 180
                      ? job.job_description.slice(0, 180) + '…'
                      : job.job_description || '—'}
                  </p>
                  <p className="mb-1">
                    <strong>Price:</strong>{' '}
                    {job.job_price != null && job.job_price !== ''
                      ? `$${Number(job.job_price).toFixed(2)}`
                      : '—'}
                  </p>
                  <p className="mb-2">
                    <strong>Deadline:</strong>{' '}
                    {job.job_deadline ? new Date(job.job_deadline).toLocaleDateString() : '—'}
                  </p>

                  {user?.role !== 'client' && (
                    <p className="mb-0 small text-muted">
                      Client:{' '}
                      <Link to={`/users/${job.user_id}`} className="text-decoration-none">
                        view profile
                      </Link>
                    </p>
                  )}
                </div>

                <div className="card-footer d-flex justify-content-between align-items-center">
                  <span className="badge text-bg-secondary">ID #{job.job_post_id}</span>
                  <div className="d-flex gap-2">
                    <Link to={`/job-posts/${job.job_post_id}`} className="btn btn-sm btn-outline-secondary">
                      View
                    </Link>

                    {canManage && (
                      <>
                        <button
                          className="btn btn-sm btn-outline-primary"
                          onClick={() => navigate(`/job-posts/${job.job_post_id}/edit`)}
                        >
                          Edit
                        </button>
                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => onDelete(job.job_post_id)}
                        >
                          Delete
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
