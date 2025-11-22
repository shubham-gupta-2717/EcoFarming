import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Home from './pages/Home';
import GetStarted from './pages/GetStarted';
import InstitutionRegistration from './pages/InstitutionRegistration';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Missions from './pages/Missions';
import Profile from './pages/Profile';
import Community from './pages/Community';
import Leaderboard from './pages/Leaderboard';
import Behavior from './pages/Behavior';
import OfflineSync from './pages/OfflineSync';
import Learning from './pages/Learning';
import LearningCentre from './pages/LearningCentre';
import LearningCategory from './pages/LearningCategory';
import LearningModule from './pages/LearningModule';

// Admin Pages
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminVerify from './pages/admin/AdminVerify';
import AdminLearning from './pages/admin/AdminLearning';

function App() {
  return (
    <AuthProvider>
      <LanguageProvider>
        <Router>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/get-started" element={<GetStarted />} />
            <Route path="/institution-registration" element={<InstitutionRegistration />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Admin Routes */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route
              path="/admin/dashboard"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/verify"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminVerify />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/learning"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminLearning />
                </ProtectedRoute>
              }
            />

            {/* Farmer Routes (Protected) */}
            <Route path="/dashboard" element={
              <ProtectedRoute allowedRoles={['farmer']}>
                <Layout />
              </ProtectedRoute>
            }>
              <Route index element={<Dashboard />} />
              <Route path="missions" element={<Missions />} />
              <Route path="profile" element={<Profile />} />
              <Route path="community" element={<Community />} />
              <Route path="leaderboard" element={<Leaderboard />} />
              <Route path="learning-old" element={<Learning />} />
              <Route path="learning" element={<LearningCentre />} />
              <Route path="learning/:categoryId" element={<LearningCategory />} />
              <Route path="learning/module/:moduleId" element={<LearningModule />} />
              <Route path="behavior" element={<Behavior />} />
              <Route path="offline" element={<OfflineSync />} />
            </Route>

            {/* Catch all */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </LanguageProvider>
    </AuthProvider>
  );
}

export default App;
