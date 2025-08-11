import React, { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "../utils/axios";

const apiOrigin = (() => {
  try {
    return new URL(axios.defaults.baseURL).origin;
  } catch {
    return window.location.origin;
  }
})();

const Avatar = ({ name, src, size = 120 }) => {
  const [errored, setErrored] = useState(false);
  const initials = (name || '').split(' ').map(n => n?.[0] || '').slice(0,2).join('').toUpperCase();

  if (src && !errored) {
    return (
      <img
        src={src}
        alt={name}
        className="rounded-circle border"
        style={{ width: size, height: size, objectFit: 'cover' }}
        onError={() => setErrored(true)}
      />
    );
  }
  return (
    <div className="rounded-circle d-flex align-items-center justify-content-center border bg-light"
         style={{ width: size, height: size, fontWeight: 700, fontSize: size * 0.35, color: '#4a5568' }}>
      {initials || 'U'}
    </div>
  );
};


const Profile = () => {
  const { userId: paramUserId } = useParams();

  const [loading, setLoading] = useState(true);
  const [resolvedUserId, setResolvedUserId] = useState(null);

  const [user, setUser] = useState(null);
  const [photos, setPhotos] = useState([]);
  const [avgRating, setAvgRating] = useState(null);
  const [ratings, setRatings] = useState([]);
  const [userJobs, setUserJobs] = useState([]);

  const profilePhoto = useMemo(() => {
    if (!user?.profile_picture) return null;
    return `${apiOrigin}/uploads/profile_pictures/${user.profile_picture}?v=${user.profile_picture}`;
  }, [user]);
  

  

  useEffect(() => {
    const run = async () => {
      try {
        const headers = localStorage.getItem("token")
          ? { Authorization: `Bearer ${localStorage.getItem("token")}` }
          : {};

      
        let id = paramUserId;
        if (!id) {
          const me = await axios.get("/users/me", { headers });
          id = me.data.user_id;
        }
        setResolvedUserId(id);


        const u = await axios.get(`/users/${id}`, { headers });
        setUser(u.data);

        
        const ph = await axios.get(`/photos/user/${id}`);
        setPhotos(ph.data || []);

        
        try {
          const ar = await axios.get(`/ratings/average/${id}`, { headers });
          setAvgRating(ar.data?.average_rating ?? null);
        } catch {
          setAvgRating(null);
        }

        
        try {
          const rr = await axios.get(`/ratings/user/${id}`, { headers });
          setRatings(rr.data || []);
        } catch {
          setRatings([]);
        }

        
        try {
          const jp = await axios.get(`/job-posts`, { headers });
          const mine = (jp.data || []).filter((j) => j.user_id === Number(id));
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
  }, [paramUserId]);

  if (loading) {
    return (
      <div className="container py-5">
        <div className="d-flex align-items-center">
          <div className="spinner-border me-3" role="status" />
          <span>Loading profile…</span>
        </div>
      </div>
  );}

  if (!user) {
    return (
      <div className="container py-5">
        <div className="alert alert-warning">User not found.</div>
      </div>
    );
  }

  return (
    <div className="container my-4">
      <div className="card shadow-sm mb-4">
        <div className="card-body d-flex flex-wrap align-items-center gap-4">
          <Avatar
            name={`${user.name || ""} ${user.surname || ""}`}
            src={profilePhoto}
            size={96}
          />

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

        
          {!paramUserId && (
            <div className="ms-auto">
              <a href="/account-settings" className="btn btn-outline-primary">
                Edit Profile
              </a>
            </div>
          )}
        </div>
      </div>

      <div className="row g-4">
        <div className="col-lg-8">        
          <div className="card shadow-sm mb-4">
            <div className="card-body">
              <h5 className="card-title mb-3">About</h5>

              {user.bio && user.bio.trim() ? (                
                <p className="mb-0" style={{ whiteSpace: "pre-wrap" }}>
                  {user.bio}
                </p>
              ) : (                
                <p className="mb-0 text-muted">
                  This user hasn’t added a bio yet. Add one in Account Settings to help
                  others understand your skills, experience, and availability.
                </p>
              )}
            </div>
          </div>


      
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
                        src={p.image_url}
                        alt={p.caption || "Photo"}
                        className="img-fluid rounded border"
                        style={{ objectFit: "cover", width: "100%", height: 110 }}
                        onError={(e) => (e.currentTarget.style.display = "none")}
                      />
                    </div>
                  ))}
                </div>
              )}
              {!paramUserId && (
                <div className="mt-3">
                  <a href="/gallery" className="btn btn-sm btn-outline-secondary w-100">
                    Manage Gallery
                  </a>
                </div>
              )}
            </div>
          </div>          
          <div className="card shadow-sm mt-4">
            <div className="card-body">
              <h6 className="card-title mb-2">Contact</h6>
              <div className="small text-muted">
                {user.email ? <a href={`mailto:${user.email}`}>{user.email}</a> : "No email provided."}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
