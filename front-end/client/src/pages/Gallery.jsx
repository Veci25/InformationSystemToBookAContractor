import React, { useEffect, useState } from "react";
import axios from "../utils/axios";

const Gallery = () => {
  const [me, setMe] = useState(null);
  const [photos, setPhotos] = useState([]);
  const [file, setFile] = useState(null);
  const [caption, setCaption] = useState("");
  const [busy, setBusy] = useState(false);

  const load = async (uid) => {
    const { data } = await axios.get(`/photos/user/${uid}`);
    setPhotos(data || []);
  };

  useEffect(() => {
    (async () => {
      const { data } = await axios.get("/users/me");
      setMe(data);
      await load(data.user_id);
    })();
  }, []);

  const upload = async (e) => {
    e.preventDefault();
    if (!file) return alert("Pick an image");
    setBusy(true);
    try {
      const fd = new FormData();
      fd.append("photo", file); // field name must be 'photo' (multer)
      if (caption) fd.append("caption", caption);
      await axios.post("/photos/upload", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setFile(null);
      setCaption("");
      await load(me.user_id);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Upload failed");
    } finally {
      setBusy(false);
    }
  };

  const remove = async (photoId) => {
    if (!confirm("Delete this photo?")) return;
    setBusy(true);
    try {
      await axios.delete(`/photos/${photoId}`);
      await load(me.user_id);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Delete failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="container my-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2 className="mb-0">Gallery</h2>
      </div>

      <div className="card shadow-sm mb-4">
        <div className="card-body">
          <h5 className="card-title mb-3">Upload Photo</h5>
          <form onSubmit={upload} className="row g-2">
            <div className="col-md-5">
              <input
                type="file"
                accept="image/*"
                className="form-control"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
              />
            </div>
            <div className="col-md-5">
              <input
                type="text"
                className="form-control"
                placeholder="Caption (optional)"
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
              />
            </div>
            <div className="col-md-2 d-grid">
              <button className="btn btn-primary" disabled={busy}>
                {busy ? "Uploading…" : "Upload"}
              </button>
            </div>
          </form>
        </div>
      </div>

      <div className="row g-3">
        {photos.length === 0 ? (
          <div className="text-muted">No photos yet.</div>
        ) : (
          photos.map((p) => (
            <div className="col-6 col-md-4 col-lg-3" key={p.photo_id}>
              <div className="card h-100 shadow-sm">
                <img
                  src={p.image_url}
                  alt={p.caption || "Photo"}
                  className="card-img-top"
                  style={{ objectFit: "cover", height: 160 }}
                />
                <div className="card-body d-flex flex-column">
                  <div className="small text-muted flex-grow-1">{p.caption}</div>
                  <button
                    className="btn btn-sm btn-outline-danger mt-2"
                    onClick={() => remove(p.photo_id)}
                    disabled={busy}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Gallery;
