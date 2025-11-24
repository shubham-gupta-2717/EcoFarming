import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Users, FileCheck, AlertCircle, TrendingUp, Loader2, BookOpen } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import useEcoStore from '../../store/useEcoStore';

const AdminDashboard = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    // Read from Global Store
    const { adminStats, recentActivity, recentFarmers } = useEcoStore();

    // Store handles sync, UI reacts to data
    const loading = false;

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
                        <span className="text-xl font-bold text-gray-900">Institute Admin</span>
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
                                <p className="text-3xl font-bold text-gray-900">{adminStats.totalFarmers}</p>
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
                                <p className="text-3xl font-bold text-gray-900">{adminStats.pendingVerifications}</p>
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
                                <p className="text-3xl font-bold text-gray-900">{adminStats.approvedToday + adminStats.rejectedToday}</p>
                                <p className="text-green-600 text-sm mt-2">
                                    ✓ {adminStats.approvedToday} approved, ✗ {adminStats.rejectedToday} rejected
                                </p>
                            </>
                        )}
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="mb-8">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

                        <Link
                            to="/admin/learning"
                            className="bg-gradient-to-r from-eco-600 to-green-600 text-white p-6 rounded-xl shadow-md hover:shadow-lg transition flex items-center justify-between group"
                        >
                            <div>
                                <h3 className="text-lg font-semibold mb-1">Learning Centre</h3>
                                <p className="text-green-100 text-sm">Create & manage learning modules</p>
                            </div>
                            <BookOpen className="w-8 h-8 opacity-80 group-hover:opacity-100 transition" />
                        </Link>

                        <Link
                            to="/admin/community"
                            className="bg-gradient-to-r from-orange-600 to-red-600 text-white p-6 rounded-xl shadow-md hover:shadow-lg transition flex items-center justify-between group"
                        >
                            <div>
                                <h3 className="text-lg font-semibold mb-1">Community Moderation</h3>
                                <p className="text-orange-100 text-sm">Manage & delete posts</p>
                            </div>
                            <Users className="w-8 h-8 opacity-80 group-hover:opacity-100 transition" />
                        </Link>

                        <Link
                            to="/admin/store"
                            className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white p-6 rounded-xl shadow-md hover:shadow-lg transition flex items-center justify-between group"
                        >
                            <div>
                                <h3 className="text-lg font-semibold mb-1">Store Management</h3>
                                <p className="text-emerald-100 text-sm">Add/Edit Products</p>
                            </div>
                            <TrendingUp className="w-8 h-8 opacity-80 group-hover:opacity-100 transition" />
                        </Link>
                    </div>
                </div>

                {/* Recent Activity & Farmers Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Recent Verifications */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                            <h3 className="font-semibold text-gray-900">Recent Verifications</h3>
                            <Link to="/admin/verify" className="text-sm text-indigo-600 hover:text-indigo-700 font-medium">View All</Link>
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

                    {/* Recent Farmers */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-100">
                            <h3 className="font-semibold text-gray-900">New Farmers</h3>
                        </div>
                        {loading ? (
                            <div className="p-6 text-center py-12">
                                <Loader2 className="w-8 h-8 animate-spin text-gray-400 mx-auto" />
                            </div>
                        ) : recentFarmers.length > 0 ? (
                            <div className="divide-y">
                                {recentFarmers.map((farmer) => (
                                    <div key={farmer.id} className="p-4 hover:bg-gray-50 transition flex items-center gap-3">
                                        <div className="w-10 h-10 bg-eco-100 rounded-full flex items-center justify-center text-eco-700 font-bold">
                                            {farmer.name ? farmer.name[0] : 'F'}
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-medium text-gray-800">{farmer.name}</p>
                                            <div className="flex items-center text-xs text-gray-500 gap-2">
                                                <span>{farmer.mobile}</span>
                                                {farmer.email && (
                                                    <>
                                                        <span>•</span>
                                                        <span>{farmer.email}</span>
                                                    </>
                                                )}
                                                <span>•</span>
                                                <span>{farmer.location || 'India'}</span>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                                                {farmer.crop || 'No Crop'}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="p-6 text-center text-gray-500 py-12">
                                No registered farmers yet.
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default AdminDashboard;
