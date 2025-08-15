import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../utils/axios";

const apiOrigin = (() => {
  try {
    return new URL(axios.defaults.baseURL).origin; 
  } catch {
    return window.location.origin;
  }
})();

const buildPayload = (me, { name, surname, username, bio }) => {
  const norm = (v) => (typeof v === "string" ? v.trim() : v);
  const payload = {};
  if (typeof name !== "undefined" && norm(name) !== (me?.name || "")) payload.name = norm(name);
  if (typeof surname !== "undefined" && norm(surname) !== (me?.surname || "")) payload.surname = norm(surname);
  if (typeof username !== "undefined" && norm(username) !== (me?.username || "")) payload.username = norm(username);
  if (typeof bio !== "undefined" && norm(bio ?? "") !== (me?.bio || "")) payload.bio = norm(bio ?? "");
  return payload;
};

const AccountSettings = () => {
  const navigate = useNavigate();

  const [me, setMe] = useState(null);

  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [savingPhoto, setSavingPhoto] = useState(false);
  const [cacheBust, setCacheBust] = useState("");

  const [name, setName] = useState("");
  const [surname, setSurname] = useState("");
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);

  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [savingPw, setSavingPw] = useState(false);

  const pwStrong = useMemo(() => /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(newPw), [newPw]);
  const pwMismatch = confirmPw.length > 0 && confirmPw !== newPw;

  useEffect(() => {
    (async () => {
      try {
        const { data } = await axios.get("/users/me");
        setMe(data);
        setName(data.name || "");
        setSurname(data.surname || "");
        setUsername(data.username || "");
        setBio(data.bio || "");
      } catch (e) {
        console.error(e);
      }
    })();
  }, []);

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  const onFile = (e) => {
    const f = e.target.files?.[0];
    setFile(f || null);
    setPreview(f ? URL.createObjectURL(f) : null);
  };

  const refreshMe = async () => {
    const { data } = await axios.get("/users/me");
    setMe(data);
    setCacheBust(String(Date.now()));
  };

const uploadProfilePic = async (e) => {
  e.preventDefault();
  if (!file) return alert("Choose an image first.");
  setSavingPhoto(true);

  try {
    const fd = new FormData();
    fd.append("profile_picture", file, file.name);

    const { data } = await axios.put("/users/me/profile-picture", fd);

    const filename = data.profile_picture;
    const rawUrl =
      data.profile_picture_url ||
      (filename
        ? `${apiOrigin}/uploads/profile_picture/${encodeURIComponent(filename)}`
        : null);

    const freshUrl = rawUrl ? `${rawUrl}${rawUrl.includes("?") ? "&" : "?"}v=${Date.now()}` : null;

    setMe((prev) =>
      prev
        ? {
            ...prev,
            profile_picture: filename ?? prev.profile_picture,
            profile_picture_url: freshUrl ?? prev.profile_picture_url,
          }
        : prev
    );

    if (preview) URL.revokeObjectURL(preview);
    setFile(null);
    setPreview(null);

    await refreshMe();

    alert("Profile photo updated!");
  } catch (err) {
    console.error(err);
    alert(err.response?.data?.message || "Failed to update profile photo");
  } finally {
    setSavingPhoto(false);
  }
};

  const isDirty = useMemo(() => {
    if (!me) return false;
    const payload = buildPayload(me, { name, surname, username, bio });
    return Object.keys(payload).length > 0;
  }, [me, name, surname, username, bio]);

  const saveProfile = async (e) => {
    e.preventDefault();
    if (!me) return;

    const payload = buildPayload(me, { name, surname, username, bio });
    if (Object.keys(payload).length === 0) {
      alert("Nothing to update.");
      return;
    }

    setSavingProfile(true);
    try {
      await axios.patch("/users/me", payload);
      await refreshMe();
      alert("Profile saved");
    } catch (err) {
      console.error(err);
      if (err.response?.status === 409) {
        alert(err.response?.data?.message || "Username already in use.");
      } else {
        alert(err.response?.data?.message || "Could not save changes");
      }
    } finally {
      setSavingProfile(false);
    }
  };

  const changePassword = async (e) => {
    e.preventDefault();
    if (!pwStrong) return alert("Password must be 8+ chars with upper/lower/number.");
    if (pwMismatch) return alert("Passwords do not match.");
    setSavingPw(true);
    try {
      await axios.post("/auth/change-password", {
        current_password: currentPw,
        new_password: newPw,
      });
      setCurrentPw("");
      setNewPw("");
      setConfirmPw("");
      alert("Password updated");
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Could not update password");
    } finally {
      setSavingPw(false);
    }
  };

const avatarSrc = useMemo(() => {
  if (preview) return preview;
  if (!me) return null;

  const base =
    me.profile_picture_url ||
    (me.profile_picture
      ? `${apiOrigin}/uploads/profile_picture/${encodeURIComponent(me.profile_picture)}`
      : null);

  if (!base) return null;

  return `${base}${base.includes("?") ? "&" : "?"}t=${cacheBust}`;
}, [me, preview, cacheBust]);

  return (
    <div className="container my-4">
      <h2 className="mb-4">Account Settings</h2>

      <div className="row g-4">
        <div className="col-lg-8 col-xl-7">
          <div className="card shadow-sm mb-4">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h4 className="card-title mb-0">Profile Photo</h4>
                <button
                  type="button"
                  className="btn btn-sm btn-outline-secondary"
                  onClick={() => navigate("/gallery")}
                  title="Manage gallery"
                >
                  Manage Gallery
                </button>
              </div>

              <div className="d-flex align-items-center gap-3 mb-3">
                {avatarSrc ? (
                  <img
                    src={avatarSrc}
                    alt="Profile"
                    className="rounded-circle border"
                    style={{ width: 96, height: 96, objectFit: "cover" }}
                  />
                ) : (
                  <div
                    className="rounded-circle d-flex align-items-center justify-content-center border bg-light text-muted"
                    style={{ width: 96, height: 96, fontWeight: 700 }}
                  >
                    ?
                  </div>
                )}
                {!preview && !avatarSrc && (
                  <div className="text-muted small">Select a new image to preview it here.</div>
                )}
              </div>

              <form onSubmit={uploadProfilePic}>
                <div className="mb-3">
                  <input type="file" accept="image/*" className="form-control" onChange={onFile} />
                </div>
                <button className="btn btn-success" disabled={savingPhoto}>
                  {savingPhoto ? "Uploading…" : "Upload Profile Photo"}
                </button>
              </form>
            </div>
          </div>

          <div className="card shadow-sm">
            <div className="card-body">
              <h4 className="card-title mb-4">Your Details</h4>
              <form onSubmit={saveProfile} className="row g-3">
                <div className="col-md-6">
                  <label className="form-label">Name</label>
                  <input className="form-control" value={name} onChange={(e) => setName(e.target.value)} />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Surname</label>
                  <input className="form-control" value={surname} onChange={(e) => setSurname(e.target.value)} />
                </div>
                <div className="col-12">
                  <label className="form-label">Username</label>
                  <input className="form-control" value={username} onChange={(e) => setUsername(e.target.value)} />
                </div>
                <div className="col-12">
                  <label className="form-label">Bio</label>
                  <textarea
                    className="form-control"
                    rows={4}
                    maxLength={500}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Tell people about your skills, experience, and availability…"
                  />
                  <div className="form-text">{(bio || "").length}/500</div>
                </div>
                <div className="col-12">
                  <button className="btn btn-primary" disabled={savingProfile || !isDirty}>
                    {savingProfile ? "Saving…" : "Save changes"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        <div className="col-lg-4 col-xl-5">
          <div className="card shadow-sm mb-4">
            <div className="card-body">
              <h5 className="card-title mb-2">Your account</h5>
              <div className="text-muted small">
                <div><strong>User:</strong> {me?.username}</div>
                <div><strong>Email:</strong> {me?.email}</div>
                <div className="text-capitalize"><strong>Role:</strong> {me?.role}</div>
              </div>
            </div>
          </div>

          <div className="card shadow-sm">
            <div className="card-body">
              <h5 className="card-title mb-3">Change Password</h5>
              <form onSubmit={changePassword} className="row g-3">
                <div className="col-12">
                  <label className="form-label">Current password</label>
                  <input
                    type="password"
                    className="form-control"
                    value={currentPw}
                    onChange={(e) => setCurrentPw(e.target.value)}
                  />
                </div>
                <div className="col-12">
                  <label className="form-label">New password</label>
                  <input
                    type="password"
                    className="form-control"
                    value={newPw}
                    onChange={(e) => setNewPw(e.target.value)}
                    placeholder="8+ chars, upper/lower/number"
                  />
                  {!pwStrong && newPw.length > 0 && (
                    <div className="form-text text-danger">
                      Must be 8+ chars and include upper, lower, number.
                    </div>
                  )}
                </div>
                <div className="col-12">
                  <label className="form-label">Confirm new password</label>
                  <input
                    type="password"
                    className="form-control"
                    value={confirmPw}
                    onChange={(e) => setConfirmPw(e.target.value)}
                  />
                  {pwMismatch && <div className="form-text text-danger">Passwords do not match.</div>}
                </div>
                <div className="col-12">
                  <button className="btn btn-outline-primary" disabled={savingPw}>
                    {savingPw ? "Updating…" : "Update password"}
                  </button>
                </div>
              </form>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default AccountSettings;
