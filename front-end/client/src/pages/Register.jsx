// src/pages/Register.jsx
import React, { useState } from 'react';
import axios from '../utils/axios';
import { useNavigate, Link } from 'react-router-dom';

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    name: '',
    surname: '',
    role: 'client',
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    try {
      await axios.post('/auth/register', formData);
      alert('Registration successful. You can now login.');
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed.');
    }
  };

  return (
    <div className="container d-flex align-items-center justify-content-center min-vh-100">
      <div className="card shadow-sm w-100" style={{ maxWidth: 500 }}>
        <div className="card-body p-4">
          <h2 className="text-center mb-4">Register</h2>

          {error && <div className="alert alert-danger py-2">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label">Username</label>
              <input
                name="username"
                className="form-control"
                value={formData.username}
                onChange={handleChange}
                required
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Email</label>
              <input
                name="email"
                type="email"
                className="form-control"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Password</label>
              <input
                name="password"
                type="password"
                className="form-control"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Name</label>
              <input
                name="name"
                className="form-control"
                value={formData.name}
                onChange={handleChange}
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Surname</label>
              <input
                name="surname"
                className="form-control"
                value={formData.surname}
                onChange={handleChange}
              />
            </div>

            <div className="mb-4">
              <label className="form-label">Role</label>
              <select
                name="role"
                className="form-select"
                value={formData.role}
                onChange={handleChange}
              >
                <option value="client">Client</option>
                <option value="contractor">Contractor</option>
              </select>
            </div>

            <div className="d-grid">
              <button type="submit" className="btn btn-success">Register</button>
            </div>
          </form>

          <p className="text-center mt-3 mb-0 text-muted">
            Already have an account?{' '}
            <Link to="/login" className="text-decoration-none">Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
