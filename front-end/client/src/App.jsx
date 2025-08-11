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
import Profile from './pages/Profile';
import Gallery from './pages/Gallery';
import JobPostDetails from "./pages/JobPostDetails";
import MatchingJobs from './pages/MatchingJobs';
import PublicUserProfile from './pages/PublicUserProfile';
import AdminPanel from './pages/AdminPanel';
import JobPostEdit from './pages/JobPostEdit';


const App = () => {
  return (
    <>
      <MainNav />

      <Routes>
        {/* public */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* private */}
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/job-posts" element={<ProtectedRoute><JobPosts /></ProtectedRoute>} />
        <Route path="/bookings" element={<ProtectedRoute><Bookings /></ProtectedRoute>} />
        <Route path="/ratings" element={<ProtectedRoute><Ratings /></ProtectedRoute>} />
        <Route path="/skills" element={<ProtectedRoute><Skills /></ProtectedRoute>} />
        <Route path="/account-settings" element={<ProtectedRoute><AccountSettings /></ProtectedRoute>} />
        <Route path="/matching-jobs" element={<ProtectedRoute><MatchingJobs /></ProtectedRoute>} />
        <Route path="/job-posts/:id" element={<JobPostDetails />} />
        <Route path="/users/:id" element={<PublicUserProfile />} />
        <Route path="/admin" element={<ProtectedRoute><AdminPanel /></ProtectedRoute>} />

        <Route
          path="/job-posts/:id/edit"
          element={
            <ProtectedRoute>
              <JobPostEdit />
            </ProtectedRoute>
          }
        />

        {/* profile supports both /profile and /profile/:userId */}
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/profile/:userId" element={<ProtectedRoute><Profile /></ProtectedRoute>} />

        <Route path="*" element={<div className="container py-4 text-muted">Not Found</div>} />

        <Route
          path="/gallery"
          element={
            <ProtectedRoute>
              <Gallery />
            </ProtectedRoute>
          }
        />

        

      </Routes>
    </>
  );
};

export default App;
