// src/App.jsx
import React from 'react';
import { Routes, Route } from 'react-router-dom';

import MainNav from './components/MainNav';
import ProtectedRoute from './components/ProtectedRoute';

import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import JobPosts from './pages/JobPosts';
import Bookings from './pages/Bookings';
import Ratings from './pages/Ratings';
import AccountSettings from './pages/AccountSettings';
import Skills from './pages/Skills';

const App = () => {
  return (
    <>
      <MainNav />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/job-posts"
          element={
            <ProtectedRoute>
              <JobPosts />
            </ProtectedRoute>
          }
        />
        <Route
          path="/bookings"
          element={
            <ProtectedRoute>
              <Bookings />
            </ProtectedRoute>
          }
        />
        <Route
          path="/ratings"
          element={
            <ProtectedRoute>
              <Ratings />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/account-settings"
          element={
            <ProtectedRoute>
              <AccountSettings />
            </ProtectedRoute>
          }
        />

        <Route
          path="/skills"
          element={
            <ProtectedRoute>
              <Skills />
            </ProtectedRoute>
          }
        />

      </Routes>
    </>
  );
};

export default App;
