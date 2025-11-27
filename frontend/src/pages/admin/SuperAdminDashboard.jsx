import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    LayoutDashboard,
    Users,
    Building2,
    LogOut,
    CheckCircle,
    Clock,
    Search,
    MoreVertical,
    ShieldCheck
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const SuperAdminDashboard = () => {
    const navigate = useNavigate();
    const { logout } = useAuth();
    const [stats, setStats] = useState({
        totalFarmers: 0,
        totalInstitutions: 0,
        pendingRequests: 0
    });
    const [requests, setRequests] = useState([]);
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(null);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const token = localStorage.getItem('adminToken');
            if (!token) {
                navigate('/super-admin/login');
                return;
            }

            const [statsRes, requestsRes, historyRes] = await Promise.all([
                fetch('http://localhost:5000/api/admin/stats', {
                    headers: { 'Authorization': `Bearer ${token}` }
                }),
                fetch('http://localhost:5000/api/admin/requests', {
                    headers: { 'Authorization': `Bearer ${token}` }
                }),
                fetch('http://localhost:5000/api/admin/history', {
                    headers: { 'Authorization': `Bearer ${token}` }
                })
            ]);

            if (statsRes.ok && requestsRes.ok && historyRes.ok) {
                const statsData = await statsRes.json();
                const requestsData = await requestsRes.json();
                const historyData = await historyRes.json();
                setStats(statsData);
                setRequests(requestsData);
                setHistory(historyData);
            }
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (id) => {
        if (!window.confirm('Are you sure you want to approve this institution? An email with credentials will be sent.')) return;

        setActionLoading(id);
        try {
            const token = localStorage.getItem('adminToken');
            const response = await fetch(`http://localhost:5000/api/admin/approve/${id}`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                alert('Institution approved successfully!');
                fetchDashboardData(); // Refresh data
            } else {
                alert('Failed to approve institution');
            }
        } catch (error) {
            console.error('Error approving institution:', error);
            alert('Error approving institution');
        } finally {
            setActionLoading(null);
        }
    };

    const handleDeny = async (id) => {
        if (!window.confirm('Are you sure you want to deny this request? An email will be sent to the institution.')) return;

        setActionLoading(id);
        try {
            const token = localStorage.getItem('adminToken');
            const response = await fetch(`http://localhost:5000/api/admin/deny/${id}`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                alert('Request denied successfully.');
                fetchDashboardData(); // Refresh data
            } else {
                alert('Failed to deny request.');
            }
        } catch (error) {
            console.error('Error denying request:', error);
            alert('Error denying request.');
        } finally {
            setActionLoading(null);
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/super-admin/login');
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 font-sans">
            {/* Sidebar */}
            <aside className="fixed inset-y-0 left-0 w-64 bg-white border-r border-gray-200 z-20 hidden lg:block">
                <div className="h-16 flex items-center px-6 border-b border-gray-100">
                    <span className="text-xl font-bold text-green-700">EcoAdmin</span>
                </div>
                <nav className="p-4 space-y-1">
                    <button onClick={() => navigate('/super-admin/dashboard')} className="w-full flex items-center gap-3 px-4 py-3 text-green-700 bg-green-50 rounded-xl font-medium">
                        <LayoutDashboard className="w-5 h-5" />
                        Dashboard
                    </button>
                    <button onClick={() => navigate('/super-admin/institutions')} className="w-full flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-xl font-medium transition-colors">
                        <Building2 className="w-5 h-5" />
                        Institutions
                    </button>
                    <button onClick={() => navigate('/super-admin/farmers')} className="w-full flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-xl font-medium transition-colors">
                        <Users className="w-5 h-5" />
                        Farmers
                    </button>
                </nav>
                <div className="absolute bottom-0 w-full p-4 border-t border-gray-100">
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl font-medium w-full transition-colors"
                    >
                        <LogOut className="w-5 h-5" />
                        Logout
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="lg:ml-64 min-h-screen">
                {/* Header */}
                <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 sm:px-8 sticky top-0 z-10">
                    <h1 className="text-xl font-bold text-gray-800">Dashboard Overview</h1>
                    <div className="flex items-center gap-4">
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-green-700 font-bold">
                            SA
                        </div>
                    </div>
                </header>

                <div className="p-4 sm:p-8 space-y-8">
                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                            <div className="flex items-center justify-between mb-4">
                                <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
                                    <Building2 className="w-6 h-6 text-blue-600" />
                                </div>
                                <span className="text-green-500 text-sm font-medium">+12%</span>
                            </div>
                            <h3 className="text-gray-500 text-sm font-medium">Total Institutions</h3>
                            <p className="text-3xl font-bold text-gray-900 mt-1">{stats.totalInstitutions}</p>
                        </div>
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                            <div className="flex items-center justify-between mb-4">
                                <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center">
                                    <Users className="w-6 h-6 text-green-600" />
                                </div>
                                <span className="text-green-500 text-sm font-medium">+24%</span>
                            </div>
                            <h3 className="text-gray-500 text-sm font-medium">Total Farmers</h3>
                            <p className="text-3xl font-bold text-gray-900 mt-1">{stats.totalFarmers}</p>
                        </div>
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                            <div className="flex items-center justify-between mb-4">
                                <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center">
                                    <Clock className="w-6 h-6 text-orange-600" />
                                </div>
                                <span className="text-orange-500 text-sm font-medium">Action Needed</span>
                            </div>
                            <h3 className="text-gray-500 text-sm font-medium">Pending Requests</h3>
                            <p className="text-3xl font-bold text-gray-900 mt-1">{stats.pendingRequests}</p>
                        </div>
                    </div>

                    {/* Pending Requests Table */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <h2 className="text-lg font-bold text-gray-900">Pending Institution Requests</h2>
                            <div className="relative">
                                <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search requests..."
                                    className="pl-9 pr-4 py-2 rounded-lg border border-gray-200 text-sm focus:border-green-500 focus:ring-2 focus:ring-green-100 outline-none w-full sm:w-64"
                                />
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-semibold">
                                    <tr>
                                        <th className="px-6 py-4">Institution</th>
                                        <th className="px-6 py-4">Contact Person</th>
                                        <th className="px-6 py-4">Location</th>
                                        <th className="px-6 py-4">Type</th>
                                        <th className="px-6 py-4">Date</th>
                                        <th className="px-6 py-4 text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {requests.length === 0 ? (
                                        <tr>
                                            <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                                                No pending requests found.
                                            </td>
                                        </tr>
                                    ) : (
                                        requests.map((req) => (
                                            <tr key={req.id} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div>
                                                        <p className="font-semibold text-gray-900">{req.institutionName}</p>
                                                        <p className="text-xs text-gray-500">{req.email}</p>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div>
                                                        <p className="text-sm text-gray-900">{req.contactPerson}</p>
                                                        <p className="text-xs text-gray-500">{req.phone}</p>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <p className="text-sm text-gray-600">
                                                        {req.village ? `${req.village}, ` : ''}
                                                        {req.subDistrict}, {req.district}
                                                    </p>
                                                    <p className="text-xs text-gray-500">{req.state}</p>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                        {req.type}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-500">
                                                    {new Date(req.createdAt).toLocaleDateString()}
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <button
                                                            onClick={() => handleDeny(req.id)}
                                                            disabled={actionLoading === req.id}
                                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-600 text-sm font-medium rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50"
                                                        >
                                                            <LogOut className="w-4 h-4" />
                                                            Deny
                                                        </button>
                                                        <button
                                                            onClick={() => handleApprove(req.id)}
                                                            disabled={actionLoading === req.id}
                                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                                                        >
                                                            {actionLoading === req.id ? (
                                                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                                            ) : (
                                                                <ShieldCheck className="w-4 h-4" />
                                                            )}
                                                            Approve
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Institution History Table */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="p-6 border-b border-gray-100">
                            <h2 className="text-lg font-bold text-gray-900">Institution History</h2>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-semibold">
                                    <tr>
                                        <th className="px-6 py-4">Institution</th>
                                        <th className="px-6 py-4">Action</th>
                                        <th className="px-6 py-4">Date</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {history.length === 0 ? (
                                        <tr>
                                            <td colSpan="3" className="px-6 py-8 text-center text-gray-500">
                                                No history available.
                                            </td>
                                        </tr>
                                    ) : (
                                        history.map((item) => (
                                            <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-6 py-4">
                                                    <p className="font-semibold text-gray-900">{item.institutionName}</p>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${item.action === 'Approved' ? 'bg-green-100 text-green-800' :
                                                        item.action === 'Denied' ? 'bg-red-100 text-red-800' :
                                                            'bg-gray-100 text-gray-800'
                                                        }`}>
                                                        {item.action}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-500">
                                                    {new Date(item.timestamp).toLocaleString()}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default SuperAdminDashboard;
