// src/pages/AccountSettings.jsx
import React, { useEffect, useMemo, useState } from "react";
import axios from "../utils/axios";

const API_ORIGIN = (() => {
  try { return new URL(axios.defaults.baseURL).origin; }
  catch { return window.location.origin; }
})();

const AccountSettings = () => {
  const [user, setUser] = useState(null);

  // form state for profile
  const [form, setForm] = useState({
    name: "",
    surname: "",
    email: "",
    age: "" // optional in UI; backend accepts null/number
  });
  const [saving, setSaving] = useState(false);

  // photo state (unchanged)
  const [serverPhotoUrl, setServerPhotoUrl] = useState(null);
  const [file, setFile] = useState(null);
  const [caption, setCaption] = useState("");
  const [uploading, setUploading] = useState(false);
  const localPreviewUrl = useMemo(() => (file ? URL.createObjectURL(file) : null), [file]);

  useEffect(() => {
    const fetchUserAndPhoto = async () => {
      try {
        const userRes = await axios.get("/users/me", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        setUser(userRes.data);

        // seed form from user
        setForm({
          name: userRes.data.name || "",
          surname: userRes.data.surname || "",
          email: userRes.data.email || "",
          age: userRes.data.age ?? "",
        });

        const photosRes = await axios.get(`/photos/user/${userRes.data.user_id}`);
        if (Array.isArray(photosRes.data) && photosRes.data.length > 0) {
          setServerPhotoUrl(photosRes.data[0].image_url);
        } else {
          setServerPhotoUrl(null);
        }
      } catch (err) {
        console.error("Error loading user or photo:", err);
      }
    };

    fetchUserAndPhoto();
  }, []);

  const onFormChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!user) return;

    // simple email check – backend also validates
    if (!form.email) return alert("Email is required.");

    setSaving(true);
    try {
      await axios.put(`/users/${user.user_id}`, {
        name: form.name,
        surname: form.surname,
        email: form.email,
        // send a number or null for age to avoid string issues
        age: form.age === "" ? null : Number(form.age),
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });

      alert("Profile updated successfully.");
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  const handlePhotoChange = (e) => setFile(e.target.files?.[0] || null);

  const handlePhotoUpload = async (e) => {
    e.preventDefault();
    if (!file) return alert("Please select a photo");
    setUploading(true);
    const formData = new FormData();
    formData.append("photo", file);
    formData.append("caption", caption);

    try {
      const res = await axios.post("/photos/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      setServerPhotoUrl(`${API_ORIGIN}/uploads/${res.data.filename}`);
      setCaption("");
      setFile(null);
      alert("Photo uploaded successfully!");
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to upload photo.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="container my-5">
      <h2 className="mb-4">Account Settings</h2>

      <div className="row g-4">
        {/* Profile Info Card */}
        <div className="col-md-6">
          <div className="card shadow-sm">
            <div className="card-body">
              <h4 className="card-title mb-4">Update Profile Information</h4>
              <form onSubmit={handleSave}>
                <div className="mb-3">
                  <label className="form-label">Name</label>
                  <input
                    name="name"
                    type="text"
                    className="form-control"
                    value={form.name}
                    onChange={onFormChange}
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Surname</label>
                  <input
                    name="surname"
                    type="text"
                    className="form-control"
                    value={form.surname}
                    onChange={onFormChange}
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Email</label>
                  <input
                    name="email"
                    type="email"
                    className="form-control"
                    value={form.email}
                    onChange={onFormChange}
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="form-label">Age</label>
                  <input
                    name="age"
                    type="number"
                    min="0"
                    className="form-control"
                    value={form.age}
                    onChange={onFormChange}
                  />
                </div>

                {/* Role is not updated by backend's updateUser; show read-only */}
                <div className="mb-4">
                  <label className="form-label">Role</label>
                  <input
                    className="form-control"
                    value={user?.role || ""}
                    disabled
                    readOnly
                  />
                  <div className="form-text">Role cannot be changed here.</div>
                </div>

                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Profile Photo Card */}
        <div className="col-md-6">
          <div className="card shadow-sm text-center">
            <div className="card-body">
              <h4 className="card-title mb-4">Profile Photo</h4>

              {(localPreviewUrl || serverPhotoUrl) && (
                <div className="mb-3 d-flex justify-content-center">
                  <img
                    src={localPreviewUrl || serverPhotoUrl}
                    alt="Profile"
                    className="rounded-circle border"
                    style={{ width: 120, height: 120, objectFit: "cover" }}
                    onError={(e) => (e.currentTarget.style.display = "none")}
                  />
                </div>
              )}

              <form onSubmit={handlePhotoUpload}>
                <div className="mb-3">
                  <input
                    type="file"
                    className="form-control"
                    accept="image/*"
                    onChange={handlePhotoChange}
                  />
                </div>
                <div className="mb-3">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Caption (optional)"
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                  />
                </div>
                <button type="submit" className="btn btn-success" disabled={uploading}>
                  {uploading ? "Uploading..." : "Upload Photo"}
                </button>
              </form>
              <div className="form-text mt-2">
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountSettings;
