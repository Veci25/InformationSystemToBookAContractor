import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "../utils/axios";

export default function PublicUserProfile() {
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    let ok = true;
    setLoading(true);
    setErr("");
    axios.get(`/users/public/${id}`)
      .then(r => { if (ok) setUser(r.data); })
      .catch(e => {
        console.error(e);
        if (ok) setErr(e.response?.data?.message || "Failed to load user");
      })
      .finally(() => { if (ok) setLoading(false); });
    return () => { ok = false; };
  }, [id]);

  if (loading) return <div className="container py-4">Loading…</div>;
  if (err) return <div className="container py-4"><div className="alert alert-danger">{err}</div></div>;
  if (!user) return null;

  const avatar = user.profile_picture_url || "/placeholder-avatar.png";

  return (
    <div className="container py-4">
      <div className="d-flex gap-3 align-items-center mb-3">
        <img
          src={avatar}
          alt="avatar"
          style={{ width: 96, height: 96, objectFit: "cover", borderRadius: "50%" }}
          onError={(e) => (e.currentTarget.src = "/placeholder-avatar.png")}
        />
        <div>
          <h3 className="mb-1">
            {user.name || user.username} {user.surname || ""}
          </h3>
          <div className="text-muted">
            {user.role} · ⭐ {user.avg_rating?.toFixed(1)} ({user.rating_count})
          </div>
        </div>
      </div>

      {user.bio && (
        <div className="mb-4">
          <h5>About</h5>
          <p className="mb-0">{user.bio}</p>
        </div>
      )}

      {user.photos?.length > 0 && (
        <>
          <h5 className="mb-3">Photos</h5>
          <div className="row g-3">
            {user.photos.map(p => (
              <div className="col-6 col-md-3" key={p.photo_id}>
                <img
                  src={p.url}
                  alt={p.caption || "Photo"}
                  className="img-fluid rounded"
                  style={{ aspectRatio: "1/1", objectFit: "cover" }}
                />
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
