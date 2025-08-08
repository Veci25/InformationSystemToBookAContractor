import React, { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "../utils/axios";

const apiOrigin = (() => {
  try { return new URL(axios.defaults.baseURL).origin; }
  catch { return window.location.origin; }
})();

const Avatar = ({ name, src, size = 120 }) => {
  const initials = (name || "")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className="rounded-circle border"
        style={{ width: size, height: size, objectFit: "cover" }}
        onError={(e) => (e.currentTarget.style.display = "none")}
      />
    );
  }

  return (
    <div
      className="rounded-circle d-flex align-items-center justify-content-center border bg-light"
      style={{
        width: size,
        height: size,
        fontWeight: 700,
        fontSize: size * 0.35,
        color: "#4a5568",
      }}
      aria-label={name}
    >
      {initials || "U"}
    </div>
  );
};

const Profile = () => {
  const { userId } = useParams();
  const [loading, setLoading] = useState(true);

  const [user, setUser] = useState(null);
  const [photos, setPhotos] = useState([]);
  const [avgRating, setAvgRating] = useState(null);
  const [ratings, setRatings] = useState([]);
  const [userJobs, setUserJobs] = useState([]);

  // profile photo: prefer first uploaded image
  const profilePhoto = useMemo(() => photos[0]?.image_url ?? null, [photos]);

  useEffect(() => {
    const run = async () => {
      try {
        // You require auth for some endpoints; include token if you have one.
        const authHeader = localStorage.getItem("token")
          ? { Authorization: `Bearer ${localStorage.getItem("token")}` }
          : {};

        // 1) User
        const u = await axios.get(`/users/${userId}`, { headers: authHeader });
        setUser(u.data);

        // 2) Photos (public route)
        const ph = await axios.get(`/photos/user/${userId}`);
        setPhotos(ph.data);

        // 3) Average rating (needs token per your routes)
        try {
          const ar = await axios.get(`/ratings/average/${userId}`, {
            headers: authHeader,
          });
          setAvgRating(ar.data?.average_rating ?? null);
        } catch {
          setAvgRating(null);
        }

        // 4) All ratings for this user (needs token)
        try {
          const rr = await axios.get(`/ratings/user/${userId}`, {
            headers: authHeader,
          });
          setRatings(rr.data || []);
        } catch {
          setRatings([]);
        }

        // 5) Client’s job posts (filter by user_id)
        try {
          const jp = await axios.get(`/job-posts`);
          const mine = (jp.data || []).filter((j) => j.user_id === Number(userId));
          setUserJobs(mine);
        } catch {
          setUserJobs([]);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [userId]);

  if (loading) {
    return (
      <div className="container py-5">
        <div className="d-flex align-items-center">
          <div className="spinner-border me-3" role="status" />
          <span>Loading profile…</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container py-5">
        <div className="alert alert-warning">User not found.</div>
      </div>
    );
  }

  return (
    <div className="container my-4">
      {/* HEADER */}
      <div className="card shadow-sm mb-4">
        <div className="card-body d-flex flex-wrap align-items-center gap-4">
          <Avatar name={`${user.name || ""} ${user.surname || ""}`} src={profilePhoto} size={96} />

          <div className="flex-grow-1">
            <h3 className="mb-1">
              {user.name || user.username} {user.surname || ""}
            </h3>
            <div className="text-muted">
              <span className="badge bg-secondary me-2 text-capitalize">
                {user.role || "user"}
              </span>
              {user.email && <span>{user.email}</span>}
            </div>
            {avgRating && (
              <div className="mt-2">
                <strong>{Number(avgRating).toFixed(1)}</strong> / 5 ⭐ average
              </div>
            )}
          </div>

          {/* CTA example */}
          <div className="ms-auto">
            <a href="/account-settings" className="btn btn-outline-primary">
              Edit Profile
            </a>
          </div>
        </div>
      </div>

      {/* CONTENT */}
      <div className="row g-4">
        {/* LEFT: About + Ratings */}
        <div className="col-lg-8">
          {/* ABOUT */}
          <div className="card shadow-sm mb-4">
            <div className="card-body">
              <h5 className="card-title mb-3">About</h5>
              <p className="mb-0 text-muted">
                {/* You don’t have a bio field yet; placeholder here */}
                This contractor hasn’t added a bio yet. Add one in Account Settings to help
                clients understand your skills, experience, and availability.
              </p>
            </div>
          </div>

          {/* RATINGS */}
          <div className="card shadow-sm mb-4">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="card-title mb-0">Recent Ratings</h5>
                <span className="text-muted">{ratings.length} review(s)</span>
              </div>

              {ratings.length === 0 ? (
                <div className="text-muted">No ratings yet.</div>
              ) : (
                <ul className="list-group list-group-flush">
                  {ratings.slice(0, 5).map((r) => (
                    <li className="list-group-item" key={r.rating_id}>
                      <div className="d-flex justify-content-between">
                        <div>
                          <div className="fw-semibold">{r.rating_value} / 5 ⭐</div>
                          <div className="text-muted small">{r.feedback_text}</div>
                        </div>
                        <div className="text-muted small">
                          {new Date(r.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* JOB POSTS (only really relevant for clients) */}
          {userJobs.length > 0 && (
            <div className="card shadow-sm mb-4">
              <div className="card-body">
                <h5 className="card-title mb-3">Job Posts by {user.name || user.username}</h5>
                <div className="table-responsive">
                  <table className="table align-middle">
                    <thead>
                      <tr>
                        <th>Title</th>
                        <th>Price</th>
                        <th>Deadline</th>
                      </tr>
                    </thead>
                    <tbody>
                      {userJobs.map((j) => (
                        <tr key={j.job_post_id}>
                          <td>{j.job_title}</td>
                          <td>${Number(j.job_price).toFixed(2)}</td>
                          <td>{new Date(j.job_deadline).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT: Photos gallery */}
        <div className="col-lg-4">
          <div className="card shadow-sm">
            <div className="card-body">
              <h5 className="card-title mb-3">Photos</h5>
              {photos.length === 0 ? (
                <div className="text-muted">No photos uploaded.</div>
              ) : (
                <div className="row g-2">
                  {photos.slice(0, 6).map((p) => (
                    <div className="col-6" key={p.photo_id}>
                      <img
                        src={p.image_url /* already full from your controller */}
                        alt={p.caption || "Photo"}
                        className="img-fluid rounded border"
                        style={{ objectFit: "cover", width: "100%", height: 110 }}
                        onError={(e) => (e.currentTarget.style.display = "none")}
                      />
                    </div>
                  ))}
                </div>
              )}
              <div className="mt-3">
                <a href="/account-settings" className="btn btn-sm btn-outline-secondary w-100">
                  Manage Photos
                </a>
              </div>
            </div>
          </div>

          {/* Contact card (optional) */}
          <div className="card shadow-sm mt-4">
            <div className="card-body">
              <h6 className="card-title mb-2">Contact</h6>
              <div className="small text-muted">
                {user.email ? (
                  <a href={`mailto:${user.email}`}>{user.email}</a>
                ) : (
                  "No email provided."
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
