// src/pages/MatchingJobs.jsx
import React, { useEffect, useState } from 'react';
import axios from '../utils/axios';

export default function MatchingJobs() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { (async () => {
    try {
      const me = (await axios.get('/users/me')).data;
      const { data } = await axios.get(`/skills/match/${me.user_id}`);
      setJobs(data || []);
    } catch (e) {
      console.error(e);
      setJobs([]);
    } finally {
      setLoading(false);
    }
  })(); }, []);

  if (loading) return <div className="container my-4">Loading…</div>;

  return (
    <div className="container my-4">
      <h2>Jobs that match your skills</h2>
      {jobs.length === 0 ? (
        <div className="text-muted">No matching jobs yet.</div>
      ) : (
        <div className="row g-3">
          {jobs.map(j => (
            <div className="col-md-6" key={j.job_post_id}>
              <div className="card h-100">
                <div className="card-body">
                  <div className="d-flex justify-content-between">
                    <h5 className="card-title mb-1">{j.job_title}</h5>
                    <div className="fw-semibold">
                      ${Number(j.job_price).toFixed(2)}
                    </div>
                  </div>
                  <div className="text-muted small">
                    Client: {j.client_name || j.client_username} · {j.required_skills}
                  </div>
                  <div className="mt-1 small">
                    Deadline: {j.job_deadline ? new Date(j.job_deadline).toLocaleDateString() : '—'}
                  </div>
                  <a className="btn btn-sm btn-primary mt-3" href={`/job-posts/${j.job_post_id}`}>View details</a>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
