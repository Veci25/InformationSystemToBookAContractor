// src/pages/AdminPanel.jsx
import React, { useEffect, useState } from 'react';
import axios from '../utils/axios';
import { Link } from 'react-router-dom';

export default function AdminPanel() {
  const [loading, setLoading] = useState(true);
  const [overview, setOverview] = useState(null);

  const [users, setUsers] = useState([]);
  const [ratings, setRatings] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [skills, setSkills] = useState([]);

  const [newSkill, setNewSkill] = useState('');
  const [busy, setBusy] = useState(false);

  const [tab, setTab] = useState('overview'); // 'overview' | 'users' | 'ratings' | 'bookings' | 'skills'

  const load = async () => {
    setLoading(true);
    try {
      const [o, u, r, b, s] = await Promise.all([
        axios.get('/admin/overview'),
        axios.get('/admin/users'),
        axios.get('/admin/ratings'),
        axios.get('/bookings'),     // admin-only list
        axios.get('/skills'),
      ]);
      setOverview(o.data);
      setUsers(u.data || []);
      setRatings(r.data || []);
      setBookings(b.data || []);
      setSkills(s.data || []);
    } catch (e) {
      console.error(e);
      alert(e.response?.data?.message || 'Failed to load admin data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  // Users
  const deleteUser = async (user_id) => {
    if (!confirm(`Delete user #${user_id}? This cannot be undone.`)) return;
    try {
      await axios.delete(`/admin/users/${user_id}`);
      setUsers((u) => u.filter(x => x.user_id !== user_id));
    } catch (e) {
      console.error(e);
      alert(e.response?.data?.message || 'Failed to delete user');
    }
  };

  // Ratings
  const deleteRating = async (rating_id) => {
    if (!confirm(`Delete rating #${rating_id}?`)) return;
    try {
      await axios.delete(`/admin/ratings/${rating_id}`);
      setRatings((r) => r.filter(x => x.rating_id !== rating_id));
    } catch (e) {
      console.error(e);
      alert(e.response?.data?.message || 'Failed to delete rating');
    }
  };

  // Bookings
  const setBookingStatus = async (id, statusNum) => {
    if (!confirm('Change booking status?')) return;
    setBusy(true);
    try {
      await axios.patch(`/bookings/${id}/status`, { status: statusNum }); // 0=pending,1=confirmed,2=canceled
      const { data } = await axios.get('/bookings');
      setBookings(data || []);
    } catch (e) {
      console.error(e);
      alert(e.response?.data?.message || 'Failed to update booking');
    } finally {
      setBusy(false);
    }
  };

  const deleteBooking = async (id) => {
    if (!confirm(`Delete booking #${id}?`)) return;
    setBusy(true);
    try {
      await axios.delete(`/bookings/${id}`);
      setBookings(bs => bs.filter(b => b.booking_id !== id));
    } catch (e) {
      console.error(e);
      alert(e.response?.data?.message || 'Failed to delete booking');
    } finally {
      setBusy(false);
    }
  };

  // Skills
  const addSkill = async (e) => {
    e.preventDefault();
    const name = newSkill.trim();
    if (!name) return;
    setBusy(true);
    try {
      await axios.post('/skills', { skill_name: name });
      setNewSkill('');
      const { data } = await axios.get('/skills');
      setSkills(data || []);
    } catch (e) {
      console.error(e);
      alert(e.response?.data?.message || 'Failed to add skill');
    } finally {
      setBusy(false);
    }
  };

  const deleteSkill = async (id) => {
    if (!confirm(`Delete skill #${id}?`)) return;
    setBusy(true);
    try {
      await axios.delete(`/skills/${id}`);
      setSkills(s => s.filter(sk => sk.skill_id !== id));
    } catch (e) {
      console.error(e);
      alert(e.response?.data?.message || 'Failed to delete skill');
    } finally {
      setBusy(false);
    }
  };

  if (loading) return <div className="container py-4">Loading…</div>;

  return (
    <div className="container py-4">
      <div className="d-flex align-items-center justify-content-between mb-3">
        <h2 className="mb-0">Admin Panel</h2>
        <div className="btn-group">
          <button className={`btn btn-sm btn-${tab==='overview'?'primary':'outline-primary'}`} onClick={() => setTab('overview')}>Overview</button>
          <button className={`btn btn-sm btn-${tab==='users'?'primary':'outline-primary'}`} onClick={() => setTab('users')}>Users</button>
          <button className={`btn btn-sm btn-${tab==='ratings'?'primary':'outline-primary'}`} onClick={() => setTab('ratings')}>Ratings</button>
          <button className={`btn btn-sm btn-${tab==='bookings'?'primary':'outline-primary'}`} onClick={() => setTab('bookings')}>Bookings</button>
          <button className={`btn btn-sm btn-${tab==='skills'?'primary':'outline-primary'}`} onClick={() => setTab('skills')}>Skills</button>
        </div>
      </div>

      {tab === 'overview' && (
        <div className="row g-3">
          <div className="col-sm-6 col-lg-3"><div className="card p-3 text-center shadow-sm"><div className="text-muted">Users</div><h3>{overview?.users ?? '—'}</h3></div></div>
          <div className="col-sm-6 col-lg-3"><div className="card p-3 text-center shadow-sm"><div className="text-muted">Job Posts</div><h3>{overview?.jobs ?? '—'}</h3></div></div>
          <div className="col-sm-6 col-lg-3"><div className="card p-3 text-center shadow-sm"><div className="text-muted">Bookings</div><h3>{overview?.bookings ?? '—'}</h3></div></div>
          <div className="col-sm-6 col-lg-3"><div className="card p-3 text-center shadow-sm"><div className="text-muted">Ratings</div><h3>{overview?.ratings ?? '—'}</h3></div></div>
        </div>
      )}

      {tab === 'users' && (
        <div className="card shadow-sm">
          <div className="card-body">
            <h5 className="card-title mb-3">All Users</h5>
            {users.length === 0 ? (
              <div className="text-muted">No users.</div>
            ) : (
              <div className="table-responsive">
                <table className="table align-middle">
                  <thead>
                    <tr>
                      <th>ID</th><th>Username</th><th>Name</th><th>Email</th><th>Role</th><th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(u => (
                      <tr key={u.user_id}>
                        <td>{u.user_id}</td>
                        <td>{u.username}</td>
                        <td>{(u.name || '') + ' ' + (u.surname || '')}</td>
                        <td>{u.email}</td>
                        <td className="text-capitalize">{u.role}</td>
                        <td className="text-end">
                          <button className="btn btn-sm btn-outline-danger" onClick={() => deleteUser(u.user_id)}>Delete</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {tab === 'ratings' && (
        <div className="card shadow-sm">
          <div className="card-body">
            <h5 className="card-title mb-3">All Ratings</h5>
            {ratings.length === 0 ? (
              <div className="text-muted">No ratings.</div>
            ) : (
              <div className="table-responsive">
                <table className="table align-middle">
                  <thead>
                    <tr>
                      <th>ID</th><th>From</th><th>To</th><th>Value</th><th>Feedback</th><th>Date</th><th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {ratings.map(r => (
                      <tr key={r.rating_id}>
                        <td>{r.rating_id}</td>
                        <td>{r.user_id}</td>
                        <td>{r.target_user_id}</td>
                        <td>{r.rating_value}</td>
                        <td className="text-truncate" style={{maxWidth: 260}}>{r.feedback_text}</td>
                        <td>{new Date(r.created_at).toLocaleDateString()}</td>
                        <td className="text-end">
                          <button className="btn btn-sm btn-outline-danger" onClick={() => deleteRating(r.rating_id)}>Delete</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {tab === 'bookings' && (
        <div className="card shadow-sm">
          <div className="card-body">
            <h5 className="card-title mb-3">All Bookings</h5>
            {bookings.length === 0 ? (
              <div className="text-muted">No bookings.</div>
            ) : (
              <div className="table-responsive">
                <table className="table align-middle">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Job</th>
                      <th>Contractor</th>
                      <th>Date</th>
                      <th>Status</th>
                      <th style={{ width: 320 }} />
                    </tr>
                  </thead>
                  <tbody>
                    {bookings.map(b => (
                      <tr key={b.booking_id}>
                        <td>#{b.booking_id}</td>
                        <td>
                          {b.job_post_id ? (
                            <Link to={`/job-posts/${b.job_post_id}`} className="text-decoration-none">
                              Job #{b.job_post_id}
                            </Link>
                          ) : '—'}
                        </td>
                        <td>
                          {b.user_id ? (
                            <Link to={`/users/${b.user_id}`} className="text-decoration-none">
                              User #{b.user_id}
                            </Link>
                          ) : '—'}
                        </td>
                        <td>{b.booking_date ? new Date(b.booking_date).toLocaleDateString() : '—'}</td>
                        <td className="text-capitalize">{b.status}</td>
                        <td className="text-end">
                          <div className="btn-group me-2">
                            <button className="btn btn-sm btn-outline-success" disabled={busy || b.status === 'confirmed'} onClick={() => setBookingStatus(b.booking_id, 1)}>Confirm</button>
                            <button className="btn btn-sm btn-outline-warning" disabled={busy || b.status === 'pending'} onClick={() => setBookingStatus(b.booking_id, 0)}>Pending</button>
                            <button className="btn btn-sm btn-outline-danger" disabled={busy || b.status === 'canceled'} onClick={() => setBookingStatus(b.booking_id, 2)}>Cancel</button>
                          </div>
                          <button className="btn btn-sm btn-danger" disabled={busy} onClick={() => deleteBooking(b.booking_id)}>Delete</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {tab === 'skills' && (
        <>
          <div className="card shadow-sm mb-3">
            <div className="card-body">
              <form className="row g-2" onSubmit={addSkill}>
                <div className="col-md-8">
                  <input
                    className="form-control"
                    placeholder="New skill name (e.g. Plumbing)"
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                  />
                </div>
                <div className="col-md-4 d-grid">
                  <button className="btn btn-primary" disabled={busy}>
                    {busy ? 'Adding…' : 'Add Skill'}
                  </button>
                </div>
              </form>
            </div>
          </div>

          <div className="card shadow-sm">
            <div className="card-body">
              <h5 className="card-title mb-3">All Skills</h5>
              {skills.length === 0 ? (
                <div className="text-muted">No skills defined.</div>
              ) : (
                <div className="table-responsive">
                  <table className="table align-middle">
                    <thead>
                      <tr><th>ID</th><th>Name</th><th style={{ width: 120 }} /></tr>
                    </thead>
                    <tbody>
                      {skills.map(s => (
                        <tr key={s.skill_id}>
                          <td>{s.skill_id}</td>
                          <td>{s.skill_name}</td>
                          <td className="text-end">
                            <button className="btn btn-sm btn-outline-danger" disabled={busy} onClick={() => deleteSkill(s.skill_id)}>Delete</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
