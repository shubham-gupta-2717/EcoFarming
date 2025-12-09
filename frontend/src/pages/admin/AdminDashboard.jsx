import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Users, FileCheck, AlertCircle, TrendingUp, Loader2, BookOpen, Briefcase, Truck, X, Lock, Eye, EyeOff, AlertTriangle, Ban } from 'lucide-react';
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
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // Fraud Activity Modal State
    const [fraudModalOpen, setFraudModalOpen] = useState(false);
    const [selectedFraudFarmer, setSelectedFraudFarmer] = useState(null);

    const handleChangePassword = async (e) => {
        e.preventDefault();
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            alert("New passwords do not match!");
            return;
        }

        try {
            setChangingPassword(true);
            await api.post('/institutions/change-password', {
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

    const handleViewFraudActivity = (farmer) => {
        setSelectedFraudFarmer(farmer);
        setFraudModalOpen(true);
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
                <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-3 sm:py-0 sm:h-16 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0">
                    <div className="flex items-center gap-2">
                        <div className="bg-indigo-600 p-2 rounded-lg">
                            <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                        </div>
                        <span className="text-base sm:text-xl font-bold text-gray-900">Institute Admin</span>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 sm:gap-4 w-full sm:w-auto">
                        <span className="text-xs sm:text-sm text-gray-600 hidden md:inline">Welcome, {user?.name}</span>
                        <button
                            onClick={() => setShowPasswordModal(true)}
                            className="text-xs sm:text-sm font-medium text-indigo-600 hover:text-indigo-700 px-2 py-1 sm:px-0 sm:py-0 rounded hover:bg-indigo-50 sm:hover:bg-transparent transition"
                        >
                            Change Password
                        </button>
                        <button
                            onClick={handleLogout}
                            className="text-xs sm:text-sm font-medium text-red-600 hover:text-red-700 px-2 py-1 sm:px-0 sm:py-0 rounded hover:bg-red-50 sm:hover:bg-transparent transition"
                        >
                            Logout
                        </button>
                        <GoogleTranslate />
                    </div>
                </div>
            </header>

            {/* Change Password Modal */}
            {showPasswordModal && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-[100] p-3 sm:p-4 transition-all duration-300">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md border border-gray-100 overflow-hidden transform transition-all scale-100">
                        {/* Header */}
                        <div className="bg-gray-50 px-4 sm:px-8 py-4 sm:py-6 border-b border-gray-100 flex justify-between items-center">
                            <div className="flex items-center gap-2 sm:gap-3">
                                <div className="bg-indigo-100 p-1.5 sm:p-2 rounded-lg">
                                    <Lock className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-600" />
                                </div>
                                <h2 className="text-lg sm:text-xl font-bold text-gray-800">Change Password</h2>
                            </div>
                            <button
                                onClick={() => setShowPasswordModal(false)}
                                className="text-gray-400 hover:text-gray-600 transition p-2 hover:bg-gray-200 rounded-full"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleChangePassword} className="p-4 sm:p-8 space-y-4 sm:space-y-5">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Current Password</label>
                                <div className="relative">
                                    <input
                                        type={showCurrentPassword ? "text" : "password"}
                                        required
                                        className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition bg-gray-50 focus:bg-white outline-none text-sm sm:text-base pr-10"
                                        placeholder="Enter current password"
                                        value={passwordData.currentPassword}
                                        onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                    >
                                        {showCurrentPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">New Password</label>
                                <div className="relative">
                                    <input
                                        type={showNewPassword ? "text" : "password"}
                                        required
                                        className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition bg-gray-50 focus:bg-white outline-none text-sm sm:text-base pr-10"
                                        placeholder="Enter new password"
                                        value={passwordData.newPassword}
                                        onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowNewPassword(!showNewPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                    >
                                        {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Confirm New Password</label>
                                <div className="relative">
                                    <input
                                        type={showConfirmPassword ? "text" : "password"}
                                        required
                                        className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition bg-gray-50 focus:bg-white outline-none text-sm sm:text-base pr-10"
                                        placeholder="Confirm new password"
                                        value={passwordData.confirmPassword}
                                        onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                    >
                                        {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>
                            </div>

                            <div className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-3 pt-2 sm:pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowPasswordModal(false)}
                                    className="w-full px-4 py-2.5 sm:py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl font-medium transition text-sm sm:text-base"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={changingPassword}
                                    className="w-full px-4 py-2.5 sm:py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 hover:shadow-lg hover:shadow-indigo-200 transition disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center text-sm sm:text-base"
                                >
                                    {changingPassword ? (
                                        <>
                                            <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin mr-2" />
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
                </div>

                {/* Quick Actions */}
                <div className="mb-8">
                    <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">


                        <Link
                            to="/admin/learning"
                            className="bg-gradient-to-r from-eco-600 to-green-600 text-white p-6 rounded-xl shadow-md hover:shadow-lg transition flex items-center justify-between group"
                        >
                            <div>
                                <h3 className="text-base sm:text-lg font-semibold mb-1">Learning Centre</h3>
                                <p className="text-green-100 text-xs sm:text-sm">Create & manage learning modules</p>
                            </div>
                            <BookOpen className="w-8 h-8 opacity-80 group-hover:opacity-100 transition" />
                        </Link>

                        <Link
                            to="/admin/community"
                            className="bg-gradient-to-r from-orange-600 to-red-600 text-white p-6 rounded-xl shadow-md hover:shadow-lg transition flex items-center justify-between group"
                        >
                            <div>
                                <h3 className="text-base sm:text-lg font-semibold mb-1">Community Moderation</h3>
                                <p className="text-orange-100 text-xs sm:text-sm">Manage & delete posts</p>
                            </div>
                            <Users className="w-8 h-8 opacity-80 group-hover:opacity-100 transition" />
                        </Link>

                        <Link
                            to="/admin/store"
                            className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white p-6 rounded-xl shadow-md hover:shadow-lg transition flex items-center justify-between group"
                        >
                            <div>
                                <h3 className="text-base sm:text-lg font-semibold mb-1">Store Management</h3>
                                <p className="text-emerald-100 text-xs sm:text-sm">Add/Edit Products</p>
                            </div>
                            <TrendingUp className="w-8 h-8 opacity-80 group-hover:opacity-100 transition" />
                        </Link>

                        <Link
                            to="/admin/orders"
                            className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 rounded-xl shadow-md hover:shadow-lg transition flex items-center justify-between group"
                        >
                            <div>
                                <h3 className="text-base sm:text-lg font-semibold mb-1">Order Management</h3>
                                <p className="text-blue-100 text-xs sm:text-sm">Track & Update Orders</p>
                            </div>
                            <Truck className="w-8 h-8 opacity-80 group-hover:opacity-100 transition" />
                        </Link>

                        <Link
                            to="/institute/missions"
                            className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white p-6 rounded-xl shadow-md hover:shadow-lg transition flex items-center justify-between group"
                        >
                            <div>
                                <h3 className="text-base sm:text-lg font-semibold mb-1">Manage Missions</h3>
                                <p className="text-blue-100 text-xs sm:text-sm">Assign & Remove Missions</p>
                            </div>
                            <Briefcase className="w-8 h-8 opacity-80 group-hover:opacity-100 transition" />
                        </Link>

                        <Link
                            to="/admin/schemes"
                            className="bg-gradient-to-r from-pink-600 to-rose-600 text-white p-6 rounded-xl shadow-md hover:shadow-lg transition flex items-center justify-between group"
                        >
                            <div>
                                <h3 className="text-base sm:text-lg font-semibold mb-1">Manage Schemes</h3>
                                <p className="text-pink-100 text-xs sm:text-sm">Add/Remove Schemes</p>
                            </div>
                            <BookOpen className="w-8 h-8 opacity-80 group-hover:opacity-100 transition" />
                        </Link>

                        <Link
                            to="/admin/emergency"
                            className="bg-gradient-to-r from-red-600 to-rose-600 text-white p-6 rounded-xl shadow-md hover:shadow-lg transition flex items-center justify-between group"
                        >
                            <div>
                                <h3 className="text-base sm:text-lg font-semibold mb-1">Emergency Requests</h3>
                                <p className="text-red-100 text-xs sm:text-sm">View & Respond</p>
                            </div>
                            <AlertCircle className="w-8 h-8 opacity-80 group-hover:opacity-100 transition" />
                        </Link>
                    </div>
                </div>



                {/* Farmer Directory with Filters */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100">
                        <h3 className="text-sm sm:text-base font-semibold text-gray-900 mb-4">Farmer Directory</h3>

                        {/* Filters */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
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
                                <div key={farmer.id} className="p-4 hover:bg-gray-50 transition">
                                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                                        <div className="w-10 h-10 bg-eco-100 rounded-full flex items-center justify-center text-eco-700 font-bold flex-shrink-0">
                                            {farmer.name ? farmer.name[0] : 'F'}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium text-gray-800 text-sm sm:text-base truncate">{farmer.name}</p>
                                            <div className="flex flex-wrap items-center text-xs text-gray-500 gap-1 sm:gap-2 mt-1">
                                                <span className="truncate max-w-[120px] sm:max-w-none">{farmer.mobile}</span>
                                                {farmer.email && (
                                                    <>
                                                        <span className="hidden sm:inline">•</span>
                                                        <span className="truncate max-w-[150px] sm:max-w-none">{farmer.email}</span>
                                                    </>
                                                )}
                                                <span className="hidden sm:inline">•</span>
                                                <span className="bg-gray-100 px-1.5 py-0.5 rounded text-xs truncate max-w-[200px]">
                                                    {farmer.state ? `${farmer.state}, ` : ''}
                                                    {farmer.district ? `${farmer.district}, ` : ''}
                                                    {farmer.subDistrict || farmer.location || 'India'}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 w-full sm:w-auto">
                                            {(farmer.isSuspended || farmer.flagCount > 0) && (
                                                <button
                                                    onClick={() => handleViewFraudActivity(farmer)}
                                                    className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded-full hover:bg-red-200 transition-colors cursor-pointer"
                                                >
                                                    <Ban className="w-3 h-3" />
                                                    Suspicious Activity
                                                </button>
                                            )}
                                            {farmer.riskLevel === 'high' && !farmer.isSuspended && farmer.flagCount === 0 && (
                                                <span className="inline-flex items-center gap-1 px-2 py-1 bg-orange-100 text-orange-800 text-xs font-medium rounded-full">
                                                    <AlertTriangle className="w-3 h-3" />
                                                    High Risk
                                                </span>
                                            )}
                                            {farmer.riskLevel === 'medium' && farmer.flagCount === 0 && (
                                                <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full">
                                                    ⚠️ Medium Risk
                                                </span>
                                            )}
                                            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full inline-block">
                                                {farmer.crop || 'No Crop'}
                                            </span>
                                        </div>
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

            </main >

            {/* Fraud Activity Modal */}
            {fraudModalOpen && selectedFraudFarmer && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden shadow-xl flex flex-col">
                        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-red-50">
                            <div>
                                <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                                    <Ban className="w-5 h-5 text-red-600" />
                                    Suspicious Activities
                                </h3>
                                <p className="text-sm text-gray-500">For {selectedFraudFarmer?.name}</p>
                            </div>
                            <button
                                onClick={() => setFraudModalOpen(false)}
                                className="p-2 hover:bg-gray-200 rounded-full transition-colors"
                            >
                                <X className="w-5 h-5 text-gray-500" />
                            </button>
                        </div>

                        <div className="p-6 overflow-y-auto">
                            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <p className="text-sm text-gray-600">Fraud Score</p>
                                        <p className="text-2xl font-bold text-red-600">{selectedFraudFarmer.fraudScore || 0}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Risk Level</p>
                                        <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${selectedFraudFarmer.riskLevel === 'high' ? 'bg-red-100 text-red-800' :
                                                selectedFraudFarmer.riskLevel === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                                    'bg-green-100 text-green-800'
                                            }`}>
                                            {selectedFraudFarmer.riskLevel?.toUpperCase()}
                                        </span>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Total Flags</p>
                                        <p className="text-2xl font-bold text-orange-600">{selectedFraudFarmer.flagCount || 0}</p>
                                    </div>
                                </div>
                            </div>

                            {selectedFraudFarmer.isSuspended && (
                                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Ban className="w-5 h-5 text-red-600" />
                                        <h4 className="font-bold text-red-800">Account Suspended</h4>
                                    </div>
                                    <p className="text-sm text-red-700">
                                        This farmer is currently suspended from submitting mission proofs.
                                    </p>
                                </div>
                            )}

                            <div>
                                <h4 className="font-bold text-gray-800 mb-4">Detected Activities:</h4>
                                {selectedFraudFarmer.flagCount > 0 ? (
                                    <div className="space-y-3">
                                        <div className="p-4 border border-gray-200 rounded-lg">
                                            <div className="flex items-start gap-3">
                                                <div className="w-2 h-2 rounded-full mt-2 bg-red-500"></div>
                                                <div className="flex-1">
                                                    <p className="font-medium text-gray-900">Multiple Suspicious Flags Detected</p>
                                                    <p className="text-sm text-gray-600 mt-1">
                                                        This farmer has been flagged {selectedFraudFarmer.flagCount} time(s) for suspicious behavior.
                                                    </p>
                                                    <div className="mt-3 space-y-2">
                                                        <p className="text-xs text-gray-500">Possible reasons:</p>
                                                        <ul className="text-sm text-gray-700 space-y-1 ml-4">
                                                            <li>• Duplicate image submissions</li>
                                                            <li>• Photos taken far from registered farm location</li>
                                                            <li>• Missing GPS data in submitted images</li>
                                                            <li>• Stock or downloaded photos detected</li>
                                                            <li>• Rapid submission patterns</li>
                                                            <li>• High rejection rate</li>
                                                        </ul>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-center py-8 text-gray-500">
                                        <AlertTriangle className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                                        <p>No specific fraud flags recorded.</p>
                                        <p className="text-sm mt-1">Fraud score based on behavioral patterns.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div >
    );
};

export default AdminDashboard;
