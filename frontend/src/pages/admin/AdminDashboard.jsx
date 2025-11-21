import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Users, FileCheck, AlertCircle, TrendingUp, LogOut, Loader2 } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../services/api';

const AdminDashboard = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        totalFarmers: 0,
        pendingVerifications: 0,
        approvedToday: 0,
        rejectedToday: 0
    });
    const [recentActivity, setRecentActivity] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAdminStats();
    }, []);

    const fetchAdminStats = async () => {
        try {
            const response = await api.get('/admin/stats');
            if (response.data.stats) {
                setStats(response.data.stats);
            }
            if (response.data.recentActivity) {
                setRecentActivity(response.data.recentActivity);
            }
        } catch (error) {
            console.error('Error fetching admin stats:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/admin/login');
    };

    const formatDate = (timestamp) => {
        if (!timestamp) return 'N/A';
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        return date.toLocaleString('en-IN', {
            day: 'numeric',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Admin Header */}
            <header className="bg-white shadow-sm border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <div className="bg-indigo-600 p-2 rounded-lg">
                            <TrendingUp className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-xl font-bold text-gray-900">EcoAdmin</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <span className="text-sm text-gray-600">Welcome, {user?.name}</span>
                        <button
                            onClick={handleLogout}
                            className="text-sm font-medium text-red-600 hover:text-red-700"
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard Overview</h1>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-gray-500 text-sm font-medium">Total Farmers</h3>
                            <Users className="w-5 h-5 text-indigo-600" />
                        </div>
                        {loading ? (
                            <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
                        ) : (
                            <>
                                <p className="text-3xl font-bold text-gray-900">{stats.totalFarmers}</p>
                                <p className="text-gray-500 text-sm mt-2">Registered users</p>
                            </>
                        )}
                    </div>

                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-gray-500 text-sm font-medium">Pending Verifications</h3>
                            <FileCheck className="w-5 h-5 text-orange-500" />
                        </div>
                        {loading ? (
                            <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
                        ) : (
                            <>
                                <p className="text-3xl font-bold text-gray-900">{stats.pendingVerifications}</p>
                                <p className="text-gray-500 text-sm mt-2">Requires attention</p>
                            </>
                        )}
                    </div>

                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-gray-500 text-sm font-medium">Today's Activity</h3>
                            <AlertCircle className="w-5 h-5 text-green-600" />
                        </div>
                        {loading ? (
                            <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
                        ) : (
                            <>
                                <p className="text-3xl font-bold text-gray-900">{stats.approvedToday + stats.rejectedToday}</p>
                                <p className="text-green-600 text-sm mt-2">
                                    ✓ {stats.approvedToday} approved, ✗ {stats.rejectedToday} rejected
                                </p>
                            </>
                        )}
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="mb-8">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Link
                            to="/admin/verify"
                            className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6 rounded-xl shadow-md hover:shadow-lg transition flex items-center justify-between group"
                        >
                            <div>
                                <h3 className="text-lg font-semibold mb-1">Verify Submissions</h3>
                                <p className="text-indigo-100 text-sm">Review pending farmer missions</p>
                            </div>
                            <FileCheck className="w-8 h-8 opacity-80 group-hover:opacity-100 transition" />
                        </Link>

                        <div className="bg-gradient-to-r from-green-600 to-teal-600 text-white p-6 rounded-xl shadow-md opacity-50 cursor-not-allowed">
                            <div>
                                <h3 className="text-lg font-semibold mb-1">Generate Reports</h3>
                                <p className="text-green-100 text-sm">Coming soon...</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Recent Activity */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100">
                        <h3 className="font-semibold text-gray-900">Recent Verifications</h3>
                    </div>
                    {loading ? (
                        <div className="p-6 text-center py-12">
                            <Loader2 className="w-8 h-8 animate-spin text-gray-400 mx-auto" />
                        </div>
                    ) : recentActivity.length > 0 ? (
                        <div className="divide-y">
                            {recentActivity.map((activity) => (
                                <div key={activity.id} className="p-4 hover:bg-gray-50 transition">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="font-medium text-gray-800">{activity.farmerName}</p>
                                            <p className="text-sm text-gray-600">{activity.missionTitle}</p>
                                        </div>
                                        <div className="text-right">
                                            <span className={`px-2 py-1 rounded-full text-xs ${activity.status === 'approved'
                                                    ? 'bg-green-100 text-green-700'
                                                    : 'bg-red-100 text-red-700'
                                                }`}>
                                                {activity.status}
                                            </span>
                                            <p className="text-xs text-gray-500 mt-1">{formatDate(activity.verifiedAt)}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="p-6 text-center text-gray-500 py-12">
                            No recent activity to show.
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default AdminDashboard;
