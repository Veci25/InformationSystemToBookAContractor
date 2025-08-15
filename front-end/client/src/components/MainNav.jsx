import React, { useEffect, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import axios from "../utils/axios";

export default function MainNav() {
  const navigate = useNavigate();
  const [isAuthed, setIsAuthed] = useState(!!localStorage.getItem("token"));
  const [me, setMe] = useState(null);

  useEffect(() => {
    const syncAuth = () => setIsAuthed(!!localStorage.getItem("token"));
    window.addEventListener("storage", syncAuth);
    window.addEventListener("auth-changed", syncAuth);
    return () => {
      window.removeEventListener("storage", syncAuth);
      window.removeEventListener("auth-changed", syncAuth);
    };
  }, []);

  useEffect(() => {
    (async () => {
      if (!isAuthed) { setMe(null); return; }
      try { const { data } = await axios.get('/users/me'); setMe(data); }
      catch { setMe(null); }
    })();
  }, [isAuthed]);

  const logout = () => {
    localStorage.removeItem("token");
    window.dispatchEvent(new Event("auth-changed"));
    navigate("/login");
  };

  const linkClass = ({ isActive }) =>
    "nav-link px-2" + (isActive ? " fw-bold text-dark" : " text-muted");

  return (
    <nav className="navbar bg-light border-bottom">
      <div className="container d-flex align-items-center">
        <Link to="/" className="navbar-brand fw-semibold me-4">ContractMe</Link>

        <ul className="nav gap-4 ms-1">
          <li className="nav-item"><NavLink to="/dashboard" className={linkClass}>Dashboard</NavLink></li>
          <li className="nav-item"><NavLink to="/job-posts" className={linkClass}>Job Posts</NavLink></li>
          <li className="nav-item"><NavLink to="/bookings" className={linkClass}>Bookings</NavLink></li>
          <li className="nav-item"><NavLink to="/ratings" className={linkClass}>Ratings</NavLink></li>
          {(me?.role === 'admin' || me?.role === 'contractor') && (
           <li className="nav-item"><NavLink to="/skills" className={linkClass}>Skills</NavLink></li>
          )}
          {me?.role === 'admin' && (
            <li className="nav-item"><NavLink to="/admin" className={linkClass}>Admin</NavLink></li>
          )}
        </ul>

        <div className="ms-auto d-flex gap-2">
          {isAuthed ? (
            <>
              <Link className="btn btn-outline-secondary" to="/profile">Profile</Link>
              <button className="btn btn-danger" onClick={logout}>Logout</button>
            </>
          ) : (
            <>
              <Link className="btn btn-primary" to="/login">Login</Link>
              <Link className="btn btn-primary" to="/register">Register</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
