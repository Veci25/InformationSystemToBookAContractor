// src/pages/Home.jsx
import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div style={{ padding: '2rem' }}>
      <h1>🏗️ Welcome to ContractMe</h1>
      <p>Your trusted platform to connect clients with professional contractors.</p>
      <div style={{ marginTop: '1rem' }}>
        <Link to="/login">
          <button>Login</button>
        </Link>
        <Link to="/register" style={{ marginLeft: '1rem' }}>
          <button>Register</button>
        </Link>
      </div>
    </div>
  );
};

export default Home;
