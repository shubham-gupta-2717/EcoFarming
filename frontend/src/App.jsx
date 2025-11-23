import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import { CartProvider } from './context/CartContext';
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
import GamificationDashboard from './pages/GamificationDashboard';
import MissionDetail from './pages/MissionDetail';
import Leaderboard from './pages/Leaderboard';
import useFirestoreSync from './hooks/useFirestoreSync';
import Behavior from './pages/Behavior';
import OfflineSync from './pages/OfflineSync';
import Learning from './pages/Learning';
import LearningCentre from './pages/LearningCentre';
import LearningCategory from './pages/LearningCategory';
import LearningModule from './pages/LearningModule';
import Store from './pages/Store';
import StoreCategory from './pages/StoreCategory';
import Cart from './pages/Cart';

// Admin Pages
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminVerify from './pages/admin/AdminVerify';
import AdminLearning from './pages/admin/AdminLearning';
import SuperAdminLogin from './pages/admin/SuperAdminLogin';
import SuperAdminDashboard from './pages/admin/SuperAdminDashboard';
import SuperAdminInstitutions from './pages/admin/SuperAdminInstitutions';
import SuperAdminFarmers from './pages/admin/SuperAdminFarmers';
import AdminCommunity from './pages/admin/AdminCommunity';


function App() {
  // Global Sync Hook
  useFirestoreSync();

  return (
    <AuthProvider>
      <LanguageProvider>
        <CartProvider>
          <Router>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/get-started" element={<GetStarted />} />
              <Route path="/institution-registration" element={<InstitutionRegistration />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* Farmer Routes (Protected) */}
              <Route path="/dashboard" element={
                <ProtectedRoute allowedRoles={['farmer']}>
                  <Layout />
                </ProtectedRoute>
              }>
                <Route index element={<Dashboard />} />
                <Route path="store" element={<Store />} />
                <Route path="store/category/:categoryId" element={<StoreCategory />} />
                <Route path="store/cart" element={<Cart />} />
                <Route path="missions" element={<GamificationDashboard />} />
                <Route path="new-mission" element={<Missions />} />
                <Route path="mission/:id" element={<MissionDetail />} />
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
              {/* Admin Routes */}

              <Route path="/admin/login" element={<AdminLogin />} />
              <Route path="/super-admin/login" element={<SuperAdminLogin />} />
              <Route
                path="/super-admin/dashboard"
                element={
                  <ProtectedRoute allowedRoles={['superadmin']}>
                    <SuperAdminDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/super-admin/institutions"
                element={
                  <ProtectedRoute allowedRoles={['superadmin']}>
                    <SuperAdminInstitutions />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/super-admin/farmers"
                element={
                  <ProtectedRoute allowedRoles={['superadmin']}>
                    <SuperAdminFarmers />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/dashboard"
                element={
                  <ProtectedRoute allowedRoles={['admin', 'institution']}>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/verify"
                element={
                  <ProtectedRoute allowedRoles={['admin', 'institution']}>
                    <AdminVerify />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/learning"
                element={
                  <ProtectedRoute allowedRoles={['admin', 'institution']}>
                    <AdminLearning />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/community"
                element={
                  <ProtectedRoute allowedRoles={['admin', 'institution']}>
                    <AdminCommunity />
                  </ProtectedRoute>
                }
              />    <Route path="*" element={<div>App Shell Loaded</div>} />
            </Routes>
          </Router>
        </CartProvider>
      </LanguageProvider>
    </AuthProvider>
  );
}

export default App;
