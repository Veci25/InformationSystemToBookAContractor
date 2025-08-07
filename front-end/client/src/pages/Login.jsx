// src/pages/Login.jsx
import React, { useState } from 'react';
import axios from '../utils/axios';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [formData, setFormData] = useState({ username: '', password: '' });
  const navigate = useNavigate();

  const handleChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      const res = await axios.post('/auth/login', formData);
      localStorage.setItem('token', res.data.token);
      alert('Login successful!');
      navigate('/dashboard'); // You'll need to create this
    } catch (err) {
      alert('Login failed. Check credentials.');
    }
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Username: </label>
          <input name="username" onChange={handleChange} required />
        </div>
        <div>
          <label>Password: </label>
          <input name="password" type="password" onChange={handleChange} required />
        </div>
        <button type="submit">Login</button>
      </form>
    </div>
  );
};

export default Login;
