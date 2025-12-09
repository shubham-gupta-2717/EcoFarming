import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import { CartProvider } from './context/CartContext';
import { StoreProvider } from './context/StoreContext';
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
import RaiseTicket from './pages/RaiseTicket';
import DisasterHelp from './pages/DisasterHelp'; // NEW // NEW
import Help from './pages/Help';
import Leaderboard from './pages/Leaderboard';
import useFirestoreSync from './hooks/useFirestoreSync';

import OfflineSync from './pages/OfflineSync';
import Quiz from './pages/Quiz';

import LearningCentre from './pages/LearningCentre';
import LearningCategory from './pages/LearningCategory';
import LearningModule from './pages/LearningModule';
import Store from './pages/Store';
import StoreCategory from './pages/StoreCategory';
import GiftCardRedemption from './pages/GiftCardRedemption';
import Cart from './pages/Cart';
import Orders from './pages/Orders';
import Schemes from './pages/Schemes';

// Admin Pages
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminVerify from './pages/admin/AdminVerify';
import AdminLearning from './pages/admin/AdminLearning';
import SuperAdminLogin from './pages/admin/SuperAdminLogin';
import InstituteEmergencyHelp from './pages/admin/InstituteEmergencyHelp'; // NEW
import SuperAdminDashboard from './pages/admin/SuperAdminDashboard';
import SuperAdminInstitutions from './pages/admin/SuperAdminInstitutions';
import SuperAdminTickets from './pages/admin/SuperAdminTickets';
import SuperAdminFarmers from './pages/admin/SuperAdminFarmers';
import AdminCommunity from './pages/admin/AdminCommunity';
import AdminStore from './pages/admin/AdminStore';
import InstituteMissionManagement from './pages/InstituteMissionManagement';
import AdminSchemes from './pages/admin/AdminSchemes';
import MissionApprovals from './pages/admin/MissionApprovals';
import AdminOrders from './pages/admin/AdminOrders';


// Helper to trigger global sync inside Auth Context
const DataSynchronizer = () => {
  useFirestoreSync();
  return null;
};

function App() {
  return (
    <AuthProvider>
      <LanguageProvider>
        <StoreProvider>
          <CartProvider>
            <DataSynchronizer /> {/* Active Sync Engine */}
            <Router>
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Home />} />
                <Route path="/get-started" element={<GetStarted />} />
                <Route path="/institution-registration" element={<InstitutionRegistration />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                {/* Farmer Routes (Protected) */}
                <Route
                  path="/dashboard/mission/:id"
                  element={
                    <ProtectedRoute allowedRoles={['farmer']}>
                      <MissionDetail />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/dashboard/tickets/new"
                  element={
                    <ProtectedRoute allowedRoles={['farmer']}>
                      <RaiseTicket />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/dashboard/disaster/new"
                  element={
                    <ProtectedRoute allowedRoles={['farmer']}>
                      <DisasterHelp />
                    </ProtectedRoute>
                  }
                />
                <Route path="/dashboard" element={
                  <ProtectedRoute allowedRoles={['farmer']}>
                    <Layout />
                  </ProtectedRoute>
                }>
                  <Route index element={<Dashboard />} />
                  <Route path="store" element={<Store />} />
                  <Route path="store/category/:categoryId" element={<StoreCategory />} />
                  <Route path="store/redeem/:id" element={<GiftCardRedemption />} />
                  <Route path="store/cart" element={<Cart />} />
                  <Route path="store/orders" element={<Orders />} />
                  <Route path="schemes" element={<Schemes />} />
                  <Route path="missions" element={<GamificationDashboard />} />
                  <Route path="new-mission" element={<Missions />} />
                  <Route path="mission/:id" element={<MissionDetail />} />
                  <Route path="profile" element={<Profile />} />
                  <Route path="community" element={<Community />} />
                  <Route path="leaderboard" element={<Leaderboard />} />

                  <Route path="learning" element={<LearningCentre />} />
                  <Route path="learning/:categoryId" element={<LearningCategory />} />
                  <Route path="learning/module/:moduleId" element={<LearningModule />} />

                  <Route path="offline" element={<OfflineSync />} />
                  <Route path="quiz" element={<Quiz />} />
                  <Route path="help" element={<Help />} />
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
                  path="/super-admin/tickets"
                  element={
                    <ProtectedRoute allowedRoles={['superadmin']}>
                      <SuperAdminTickets />
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
                    <ProtectedRoute allowedRoles={['admin', 'superadmin', 'institution']}>
                      <AdminVerify />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/emergency"
                  element={
                    <ProtectedRoute allowedRoles={['admin', 'superadmin', 'institution']}>
                      <InstituteEmergencyHelp />
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
                  path="/admin/mission-approvals"
                  element={
                    <ProtectedRoute allowedRoles={['admin', 'institution']}>
                      <MissionApprovals />
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
                />
                <Route
                  path="/admin/store"
                  element={
                    <ProtectedRoute allowedRoles={['admin', 'institution']}>
                      <AdminStore />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/institute/missions"
                  element={
                    <ProtectedRoute allowedRoles={['admin', 'institution']}>
                      <InstituteMissionManagement />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/schemes"
                  element={
                    <ProtectedRoute allowedRoles={['admin', 'institution']}>
                      <AdminSchemes />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/orders"
                  element={
                    <ProtectedRoute allowedRoles={['admin', 'institution']}>
                      <AdminOrders />
                    </ProtectedRoute>
                  }
                />

                <Route path="*" element={
                  <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
                    <h1 className="text-4xl font-bold text-gray-800 mb-4">404</h1>
                    <p className="text-gray-600 mb-8">Page not found</p>
                    <a href="/dashboard" className="text-emerald-600 hover:underline">Go to Dashboard</a>
                  </div>
                } />
              </Routes>
            </Router>
          </CartProvider>
        </StoreProvider>
      </LanguageProvider>
    </AuthProvider>
  );
}

export default App;
