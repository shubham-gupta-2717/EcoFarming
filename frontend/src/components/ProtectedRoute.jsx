import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Loader2 } from 'lucide-react';

const ProtectedRoute = ({ children, allowedRoles }) => {
    const { user, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-eco-600" />
            </div>
        );
    }

    if (!user) {
        // Redirect to appropriate login based on path
        if (location.pathname.startsWith('/admin')) {
            return <Navigate to="/admin/login" state={{ from: location }} replace />;
        }
        if (location.pathname.startsWith('/super-admin')) {
            return <Navigate to="/super-admin/login" state={{ from: location }} replace />;
        }
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (allowedRoles && !allowedRoles.includes(user.role)) {
        console.log("ProtectedRoute: Access denied. User role:", user.role, "Allowed:", allowedRoles);
        // User is logged in but doesn't have permission
        if (user.role === 'admin' || user.role === 'institution') {
            return <Navigate to="/admin/dashboard" replace />;
        }
        if (user.role === 'superadmin') {
            return <Navigate to="/super-admin/dashboard" replace />;
        }
        return <Navigate to="/" replace />;
    }

    return children;
};

export default ProtectedRoute;
