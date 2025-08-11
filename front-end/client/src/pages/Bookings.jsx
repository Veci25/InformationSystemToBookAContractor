// src/pages/Bookings.jsx
import React, { useEffect, useState } from 'react';
import axios from '../utils/axios';
import { Link } from 'react-router-dom';

export default function Bookings() {
  const [me, setMe] = useState(null);
  const [mine, setMine] = useState([]);          // bookings I requested (as contractor)
  const [forMyJobs, setForMyJobs] = useState([]); // requests on my jobs (as client)
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    (async () => {
      const { data } = await axios.get('/users/me');
      setMe(data);

      const a = await axios.get('/bookings/mine');
      const b = await axios.get('/bookings/for-my-jobs');
      setMine(a.data || []);
      setForMyJobs(b.data || []);
    })();
  }, []);

  const setStatus = async (id, status) => {
    setBusy(true);
    try {
      await axios.patch(`/bookings/${id}/status`, { status });
      const b = await axios.get('/bookings/for-my-jobs');
      setForMyJobs(b.data || []);
    } catch (e) {
      console.error(e);
      alert(e.response?.data?.message || 'Failed to update');
    } finally {
      setBusy(false);
    }
  };

  if (!me) return <div className="container py-4">Loading…</div>;

  return (
    <div className="container py-4">
      <h2 className="mb-4">Bookings</h2>

      {/* Contractor list */}
      <div className="mb-5">
        <h5>My booking requests</h5>
        {mine.length === 0 ? (
          <div className="text-muted">No requests yet.</div>
        ) : (
          <ul className="list-group">
            {mine.map(b => (
              <li key={b.booking_id} className="list-group-item d-flex justify-content-between">
                <div>
                  <div className="fw-semibold">{b.job_title}</div>
                  <div className="small text-muted">
                    with{' '}
                    <Link to={`/users/${b.client_id}`} className="text-decoration-none">
                      {b.client_display_name?.trim() || b.client_username}
                    </Link>{' '}
                    on {new Date(b.booking_date).toLocaleDateString()} — <strong>Status:</strong> {b.status}
                  </div>
                </div>
                <span className="badge text-bg-secondary">#{b.booking_id}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Client list */}
      <div>
        <h5>Requests for my jobs</h5>
        {forMyJobs.length === 0 ? (
          <div className="text-muted">No requests yet.</div>
        ) : (
          <ul className="list-group">
            {forMyJobs.map(b => (
              <li key={b.booking_id} className="list-group-item d-flex justify-content-between align-items-center">
                <div>
                  <div className="fw-semibold">{b.job_title}</div>
                  <div className="small text-muted">
                    By{' '}
                    <Link to={`/users/${b.contractor_id}`} className="text-decoration-none">
                      {b.contractor_display_name?.trim() || b.contractor_name || b.contractor_username}
                    </Link>{' '}
                    on {new Date(b.booking_date).toLocaleDateString()} — {b.status}
                  </div>
                </div>
                <div className="d-flex gap-2">
                  <button
                    className="btn btn-sm btn-outline-success"
                    disabled={busy || b.status !== 'pending'}
                    onClick={() => setStatus(b.booking_id, 1)}
                  >
                    Confirm
                  </button>
                  <button
                    className="btn btn-sm btn-outline-danger"
                    disabled={busy || b.status !== 'pending'}
                    onClick={() => setStatus(b.booking_id, 2)}
                  >
                    Cancel
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
