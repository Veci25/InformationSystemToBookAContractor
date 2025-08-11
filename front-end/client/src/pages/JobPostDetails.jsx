import React, { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "../utils/axios";

export default function JobPostDetails() {
  const { id } = useParams();

  const [job, setJob] = useState(null);
  const [contractors, setContractors] = useState([]);
  const [me, setMe] = useState(null);

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const [requestDate, setDate] = useState("");
  const [saving, setSaving] = useState(false);

  const todayISO = useMemo(() => new Date().toISOString().slice(0, 10), []);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      setErr("");
      try {
        try {
          const meRes = await axios.get("/users/me");
          if (mounted) setMe(meRes.data);
        } catch {}

        const jobRes = await axios.get(`/job-posts/${id}`);
        if (!mounted) return;
        setJob(jobRes.data);

        try {
          const m = await axios.get(`/skills/matchContractors/${id}`);
          if (mounted) setContractors(m.data || []);
        } catch {}
      } catch (e) {
        if (!mounted) return;
        console.error(e);
        setErr(
          e.response?.data?.message ||
            (e.response?.status === 404 ? "Job post not found." : "Failed to load job.")
        );
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [id]);

  const clientName = useMemo(() => {
    if (!job) return "—";
    return job.client_display_name || job.client_username || "—";
  }, [job]);

  const priceText = useMemo(() => {
    if (!job?.job_price && job?.job_price !== 0) return "—";
    const n = Number(job.job_price);
    return `$${n.toFixed(2)}`;
  }, [job]);

  const deadlineText = useMemo(() => {
    if (!job?.job_deadline) return "—";
    const d = new Date(job.job_deadline);
    return isNaN(d.getTime()) ? "—" : d.toLocaleDateString();
  }, [job]);

  const requestBooking = async (e) => {
    e.preventDefault();
    if (!requestDate) return alert("Pick a date");
    if (!job?.job_post_id) return;

    setSaving(true);
    try {
      console.log('POST /bookings payload', { job_post_id: id, booking_date: requestDate });
      await axios.post("/bookings", {
        job_post_id: job.job_post_id,
        booking_date: requestDate,
        user_id: me.user_id
      });
      alert("Booking request sent");
      setDate("");
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to request booking");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="container py-4">Loading…</div>;

  if (err) {
    return (
      <div className="container py-4">
        <div className="alert alert-danger">{err}</div>
        <Link to="/job-posts" className="btn btn-outline-secondary mt-2">
          Back to Job Posts
        </Link>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="container py-4">
        <div className="alert alert-warning">Job not found.</div>
      </div>
    );
  }

  const canRequest =
    me?.role === "contractor" && me?.user_id && job?.user_id && me.user_id !== job.user_id;

  return (
    <div className="container py-4">
      <h2 className="mb-1">{job.job_title}</h2>

      <div className="text-muted mb-3">
        Client: {clientName}
        {job.required_skills ? ` · ${job.required_skills}` : ""}
      </div>

      {job.job_description && <p className="mb-3">{job.job_description}</p>}

      <div className="mb-2">
        <strong>Price:</strong> {priceText}
      </div>
      <div className="mb-4">
        <strong>Deadline:</strong> {deadlineText}
      </div>

      {canRequest && (
        <div className="card p-3 mb-4">
          <div className="fw-semibold mb-2">Request a booking</div>
          <form onSubmit={requestBooking} className="d-flex gap-2">
            <input
              type="date"
              className="form-control"
              min={todayISO}
              value={requestDate}
              onChange={(e) => setDate(e.target.value)}
            />
            <button className="btn btn-primary" disabled={saving}>
              {saving ? "Sending…" : "Request"}
            </button>
          </form>
        </div>
      )}

      {contractors.length > 0 && (
        <>
          <h4 className="mt-4 mb-3">Matching contractors</h4>
          <ul className="list-group">
            {contractors.map((c) => (
              <li
                key={c.user_id}
                className="list-group-item d-flex justify-content-between align-items-start"
              >
                <div>
                  <div className="fw-semibold">
                    {c.name && c.surname ? `${c.name} ${c.surname}` : c.name || c.username}
                  </div>
                  {c.skills && <div className="small text-muted">{c.skills}</div>}
                </div>
              </li>
            ))}
          </ul>
        </>
      )}

      <div className="mt-4">
        <Link to="/job-posts" className="btn btn-outline-secondary">
          Back to Job Posts
        </Link>
      </div>
    </div>
  );
}
