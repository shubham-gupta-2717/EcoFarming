import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Users, FileCheck, AlertCircle, TrendingUp, Loader2, BookOpen, Briefcase, Truck, X, Lock } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import useEcoStore from '../../store/useEcoStore';
import GoogleTranslate from '../../components/GoogleTranslate';

import api from '../../services/api';
import { useState, useEffect } from 'react';

const AdminDashboard = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    // Read from Global Store
    const { adminStats, setAdminStats, recentActivity } = useEcoStore();

    // Local State for Filtering
    const [states, setStates] = useState([]);
    const [districts, setDistricts] = useState([]);
    const [subDistricts, setSubDistricts] = useState([]);

    const [selectedState, setSelectedState] = useState('');
    const [selectedDistrict, setSelectedDistrict] = useState('');
    const [selectedSubDistrict, setSelectedSubDistrict] = useState('');

    const [filteredFarmers, setFilteredFarmers] = useState([]);
    const [loadingFarmers, setLoadingFarmers] = useState(false);

    // Password Change State
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
    const [changingPassword, setChangingPassword] = useState(false);

    const handleChangePassword = async (e) => {
        e.preventDefault();
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            alert("New passwords do not match!");
            return;
        }

        try {
            setChangingPassword(true);
            await api.post('/institution/change-password', {
                currentPassword: passwordData.currentPassword,
                newPassword: passwordData.newPassword
            });
            alert("Password updated successfully!");
            setShowPasswordModal(false);
            setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (error) {
            console.error("Error changing password:", error);
            alert(error.response?.data?.message || "Failed to update password");
        } finally {
            setChangingPassword(false);
        }
    };

    // Store handles sync, UI reacts to data
    const loading = false;

    // Fetch States on Mount
    useEffect(() => {
        const fetchStates = async () => {
            try {
                const res = await api.get('/locations/states');
                setStates(res.data);
            } catch (error) {
                console.error("Error fetching states:", error);
            }
        };

        const fetchStats = async () => {
            try {
                const res = await api.get('/admin/stats');
                setAdminStats({
                    totalFarmers: res.data.totalFarmers || 0,
                    pendingVerifications: res.data.pendingRequests || 0,
                    approvedToday: 0, // Backend doesn't return this yet
                    rejectedToday: 0  // Backend doesn't return this yet
                });
            } catch (error) {
                console.error("Error fetching admin stats:", error);
            }
        };

        fetchStates();
        fetchStats();
        fetchFarmers(); // Initial fetch
    }, []);

    // Fetch Districts when State changes
    useEffect(() => {
        if (selectedState) {
            const fetchDistricts = async () => {
                try {
                    const res = await api.get(`/locations/districts/${selectedState}`);
                    setDistricts(res.data);
                    setSubDistricts([]); // Reset sub-districts
                    setSelectedDistrict('');
                    setSelectedSubDistrict('');
                } catch (error) {
                    console.error("Error fetching districts:", error);
                }
            };
            fetchDistricts();
        } else {
            setDistricts([]);
            setSubDistricts([]);
        }
        fetchFarmers();
    }, [selectedState]);

    // Fetch Sub-Districts when District changes
    useEffect(() => {
        if (selectedState && selectedDistrict) {
            const fetchSubDistricts = async () => {
                try {
                    const res = await api.get(`/locations/sub-districts/${selectedState}/${selectedDistrict}`);
                    setSubDistricts(res.data);
                    setSelectedSubDistrict('');
                } catch (error) {
                    console.error("Error fetching sub-districts:", error);
                }
            };
            fetchSubDistricts();
        } else {
            setSubDistricts([]);
        }
        fetchFarmers();
    }, [selectedDistrict]);

    // Fetch Farmers when Sub-District changes (or any filter)
    useEffect(() => {
        fetchFarmers();
    }, [selectedSubDistrict]);

    const fetchFarmers = async () => {
        setLoadingFarmers(true);
        try {
            let query = '/admin/farmers?';
            if (selectedState) query += `state=${selectedState}&`;
            if (selectedDistrict) query += `district=${selectedDistrict}&`;
            if (selectedSubDistrict) query += `subDistrict=${selectedSubDistrict}`;

            const res = await api.get(query);
            setFilteredFarmers(res.data);
        } catch (error) {
            console.error("Error fetching farmers:", error);
        } finally {
            setLoadingFarmers(false);
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/admin/login');
    };

    const formatDate = (timestamp) => {
        if (!timestamp) return 'N/A';
        let date;
        if (timestamp._seconds) {
            date = new Date(timestamp._seconds * 1000);
        } else if (timestamp.toDate) {
            date = timestamp.toDate();
        } else {
            date = new Date(timestamp);
        }
        return date.toLocaleString('en-IN', {
            day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
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
                            onClick={() => setShowPasswordModal(true)}
                            className="text-sm font-medium text-indigo-600 hover:text-indigo-700"
                        >
                            Change Password
                        </button>
                        <button
                            onClick={handleLogout}
                            className="text-sm font-medium text-red-600 hover:text-red-700"
                        >
                            Logout
                        </button>
                        <GoogleTranslate />
                    </div>
                </div>
            </header>

            {/* Change Password Modal */}
            {showPasswordModal && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-[100] p-4 transition-all duration-300">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md border border-gray-100 overflow-hidden transform transition-all scale-100">
                        {/* Header */}
                        <div className="bg-gray-50 px-8 py-6 border-b border-gray-100 flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <div className="bg-indigo-100 p-2 rounded-lg">
                                    <Lock className="w-5 h-5 text-indigo-600" />
                                </div>
                                <h2 className="text-xl font-bold text-gray-800">Change Password</h2>
                            </div>
                            <button
                                onClick={() => setShowPasswordModal(false)}
                                className="text-gray-400 hover:text-gray-600 transition p-2 hover:bg-gray-200 rounded-full"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleChangePassword} className="p-8 space-y-5">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Current Password</label>
                                <input
                                    type="password"
                                    required
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition bg-gray-50 focus:bg-white outline-none"
                                    placeholder="Enter current password"
                                    value={passwordData.currentPassword}
                                    onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">New Password</label>
                                <input
                                    type="password"
                                    required
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition bg-gray-50 focus:bg-white outline-none"
                                    placeholder="Enter new password"
                                    value={passwordData.newPassword}
                                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Confirm New Password</label>
                                <input
                                    type="password"
                                    required
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition bg-gray-50 focus:bg-white outline-none"
                                    placeholder="Confirm new password"
                                    value={passwordData.confirmPassword}
                                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                />
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowPasswordModal(false)}
                                    className="flex-1 px-4 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl font-medium transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={changingPassword}
                                    className="flex-1 px-4 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 hover:shadow-lg hover:shadow-indigo-200 transition disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center"
                                >
                                    {changingPassword ? (
                                        <>
                                            <Loader2 className="w-5 h-5 animate-spin mr-2" />
                                            Updating...
                                        </>
                                    ) : 'Update Password'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

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

                        <Link
                            to="/admin/orders"
                            className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 rounded-xl shadow-md hover:shadow-lg transition flex items-center justify-between group"
                        >
                            <div>
                                <h3 className="text-lg font-semibold mb-1">Order Management</h3>
                                <p className="text-blue-100 text-sm">Track & Update Orders</p>
                            </div>
                            <Truck className="w-8 h-8 opacity-80 group-hover:opacity-100 transition" />
                        </Link>

                        <Link
                            to="/institute/missions"
                            className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white p-6 rounded-xl shadow-md hover:shadow-lg transition flex items-center justify-between group"
                        >
                            <div>
                                <h3 className="text-lg font-semibold mb-1">Manage Missions</h3>
                                <p className="text-blue-100 text-sm">Assign & Remove Missions</p>
                            </div>
                            <Briefcase className="w-8 h-8 opacity-80 group-hover:opacity-100 transition" />
                        </Link>

                        <Link
                            to="/admin/schemes"
                            className="bg-gradient-to-r from-pink-600 to-rose-600 text-white p-6 rounded-xl shadow-md hover:shadow-lg transition flex items-center justify-between group"
                        >
                            <div>
                                <h3 className="text-lg font-semibold mb-1">Manage Schemes</h3>
                                <p className="text-pink-100 text-sm">Add/Remove Schemes</p>
                            </div>
                            <BookOpen className="w-8 h-8 opacity-80 group-hover:opacity-100 transition" />
                        </Link>

                        <Link
                            to="/admin/emergency"
                            className="bg-gradient-to-r from-red-600 to-rose-600 text-white p-6 rounded-xl shadow-md hover:shadow-lg transition flex items-center justify-between group"
                        >
                            <div>
                                <h3 className="text-lg font-semibold mb-1">Emergency Requests</h3>
                                <p className="text-red-100 text-sm">View & Respond</p>
                            </div>
                            <AlertCircle className="w-8 h-8 opacity-80 group-hover:opacity-100 transition" />
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

                    {/* Farmer Directory with Filters */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-100">
                            <h3 className="font-semibold text-gray-900 mb-4">Farmer Directory</h3>

                            {/* Filters */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <select
                                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                                    value={selectedState}
                                    onChange={(e) => setSelectedState(e.target.value)}
                                >
                                    <option value="">All States</option>
                                    {states.map(s => <option key={s} value={s}>{s}</option>)}
                                </select>

                                <select
                                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                                    value={selectedDistrict}
                                    onChange={(e) => setSelectedDistrict(e.target.value)}
                                    disabled={!selectedState}
                                >
                                    <option value="">All Districts</option>
                                    {districts.map(d => <option key={d} value={d}>{d}</option>)}
                                </select>

                                <select
                                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                                    value={selectedSubDistrict}
                                    onChange={(e) => setSelectedSubDistrict(e.target.value)}
                                    disabled={!selectedDistrict}
                                >
                                    <option value="">All Sub-Districts</option>
                                    {subDistricts.map(sd => <option key={sd} value={sd}>{sd}</option>)}
                                </select>
                            </div>
                        </div>

                        {loadingFarmers ? (
                            <div className="p-6 text-center py-12">
                                <Loader2 className="w-8 h-8 animate-spin text-gray-400 mx-auto" />
                            </div>
                        ) : filteredFarmers.length > 0 ? (
                            <div className="divide-y max-h-96 overflow-y-auto">
                                {filteredFarmers.map((farmer) => (
                                    <div key={farmer.id} className="p-4 hover:bg-gray-50 transition flex items-center gap-3">
                                        <div className="w-10 h-10 bg-eco-100 rounded-full flex items-center justify-center text-eco-700 font-bold">
                                            {farmer.name ? farmer.name[0] : 'F'}
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-medium text-gray-800">{farmer.name}</p>
                                            <div className="flex items-center text-xs text-gray-500 gap-2 flex-wrap">
                                                <span>{farmer.mobile}</span>
                                                {farmer.email && (
                                                    <>
                                                        <span>•</span>
                                                        <span>{farmer.email}</span>
                                                    </>
                                                )}
                                                <span>•</span>
                                                <span className="bg-gray-100 px-1 rounded">
                                                    {farmer.state ? `${farmer.state}, ` : ''}
                                                    {farmer.district ? `${farmer.district}, ` : ''}
                                                    {farmer.subDistrict || farmer.location || 'India'}
                                                </span>
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
                                No farmers found for the selected filters.
                            </div>
                        )}
                    </div>
                </div>
            </main >
        </div >
    );
};

export default AdminDashboard;
