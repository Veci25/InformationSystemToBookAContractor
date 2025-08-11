import React, { useState } from 'react';
import axios from '../utils/axios';
import { useNavigate, Link } from 'react-router-dom';

const Login = () => {
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await axios.post('/auth/login', {
        username: formData.username.trim(),
        password: formData.password,
      });
      localStorage.setItem('token', res.data.token);
      window.dispatchEvent(new Event('auth-changed')); 
      navigate('/dashboard');
    } catch (err) {
      console.error('LOGIN ERROR', {
        message: err.message,
        responseStatus: err.response?.status,
        responseData: err.response?.data,
        requestUrl: err.config ? `${err.config.baseURL || ''}${err.config.url || ''}` : undefined,
      });

      if (!err.response) {
        setError('Network error. Could not reach the API. Check baseURL/CORS.');
      } else {
        const status = err.response.status;
        const msg =
          err.response.data?.message ||
          (status === 404
            ? 'User not found'
            : status === 401
            ? 'Invalid username or password.'
            : 'Login failed. Try again.');
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container d-flex align-items-center justify-content-center min-vh-100">
      <div className="card shadow-sm w-100" style={{ maxWidth: 420 }}>
        <div className="card-body p-4">
          <h2 className="text-center mb-4">Login</h2>

          {error && <div className="alert alert-danger py-2">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label htmlFor="username" className="form-label">Username</label>
              <input
                id="username"
                name="username"
                type="text"
                className="form-control"
                value={formData.username}
                onChange={handleChange}
                placeholder="Enter your username"
                required
                autoComplete="username"
              />
            </div>

            <div className="mb-3">
              <label htmlFor="password" className="form-label">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                className="form-control"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                required
                autoComplete="current-password"
              />
            </div>

            <div className="d-grid">
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? 'Signing in…' : 'Login'}
              </button>
            </div>
          </form>

          <p className="text-center mt-3 mb-0 text-muted">
            Don’t have an account?{' '}
            <Link to="/register" className="text-decoration-none">Register</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
