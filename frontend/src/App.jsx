import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Missions from './pages/Missions';
import Leaderboard from './pages/Leaderboard';
import Community from './pages/Community';
import Verification from './pages/Verification';
import Profile from './pages/Profile';
import CropCalendar from './pages/CropCalendar';
import Schemes from './pages/Schemes';
import Register from './pages/Register';
import Login from './pages/Login';
import Learning from './pages/Learning'; // Added Learning import
import Behavior from './pages/Behavior';
import OfflineSync from './pages/OfflineSync';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  return <Layout>{children}</Layout>;
};

function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/missions" element={<ProtectedRoute><Missions /></ProtectedRoute>} />
            <Route path="/leaderboard" element={<ProtectedRoute><Leaderboard /></ProtectedRoute>} />
            <Route path="/community" element={<ProtectedRoute><Community /></ProtectedRoute>} />
            <Route path="/verification" element={<ProtectedRoute><Verification /></ProtectedRoute>} />
            <Route path="/calendar" element={<ProtectedRoute><CropCalendar /></ProtectedRoute>} />
            <Route path="/schemes" element={<ProtectedRoute><Schemes /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/learning" element={<ProtectedRoute><Learning /></ProtectedRoute>} /> {/* Added Learning route */}
            <Route path="/behavior" element={<ProtectedRoute><Behavior /></ProtectedRoute>} />
            <Route path="/offline" element={<ProtectedRoute><OfflineSync /></ProtectedRoute>} />
          </Routes>
        </Router>
      </AuthProvider>
    </LanguageProvider>
  );
}

export default App;
