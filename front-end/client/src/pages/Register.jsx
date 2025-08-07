// src/pages/Register.jsx
import React, { useState } from 'react';
import axios from '../utils/axios';
import { useNavigate } from 'react-router-dom';

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    name: '',
    surname: '',
    role: 'client',
  });

  const navigate = useNavigate();

  const handleChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      await axios.post('/auth/register', formData);
      alert('Registration successful. You can now login.');
      navigate('/login');
    } catch (err) {
      alert('Registration failed: ' + err.response?.data?.message);
    }
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h2>Register</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Username: </label>
          <input name="username" onChange={handleChange} required />
        </div>
        <div>
          <label>Email: </label>
          <input name="email" type="email" onChange={handleChange} required />
        </div>
        <div>
          <label>Password: </label>
          <input name="password" type="password" onChange={handleChange} required />
        </div>
        <div>
          <label>Name: </label>
          <input name="name" onChange={handleChange} />
        </div>
        <div>
          <label>Surname: </label>
          <input name="surname" onChange={handleChange} />
        </div>
        <div>
          <label>Role: </label>
          <select name="role" onChange={handleChange}>
            <option value="client">Client</option>
            <option value="contractor">Contractor</option>
          </select>
        </div>
        <button type="submit">Register</button>
      </form>
    </div>
  );
};

export default Register;
