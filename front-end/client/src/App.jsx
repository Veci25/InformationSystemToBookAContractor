import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import JobPosts from './pages/JobPosts';
import Bookings from './pages/Bookings';
import AccountSettings from './pages/AccountSettings';


const App = () => {
  return (
    <div>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/job-posts" element={<JobPosts />} />
        <Route path="/bookings" element={<Bookings />} />
        <Route path="/account-settings" element={<AccountSettings />} />
      </Routes>
    </div>
  );
};

export default App;
