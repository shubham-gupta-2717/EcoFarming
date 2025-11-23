import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    LayoutDashboard,
    Users,
    Building2,
    LogOut,
    Search,
    MapPin,
    Sprout,
    Phone
} from 'lucide-react';

const SuperAdminFarmers = () => {
    const navigate = useNavigate();
    const [farmers, setFarmers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchFarmers();
    }, []);

    const fetchFarmers = async () => {
        try {
            const token = localStorage.getItem('adminToken');
            const response = await fetch('http://localhost:5000/api/admin/farmers', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setFarmers(data);
            }
        } catch (error) {
            console.error('Error fetching farmers:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleRemoveFarmer = async (id) => {
        if (!window.confirm('Are you sure you want to remove this farmer? This action cannot be undone.')) {
            return;
        }

        try {
            const token = localStorage.getItem('adminToken');
            const response = await fetch(`http://localhost:5000/api/admin/farmers/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                setFarmers(farmers.filter(farmer => farmer.id !== id));
            } else {
                alert('Failed to remove farmer');
            }
        } catch (error) {
            console.error('Error removing farmer:', error);
            alert('Error removing farmer');
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminRole');
        navigate('/super-admin/login');
    };

    const filteredFarmers = farmers.filter(farmer =>
        farmer.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        farmer.mobile?.includes(searchTerm)
    );

    return (
        <div className="min-h-screen bg-gray-50 font-sans">
            {/* Sidebar */}
            <aside className="fixed inset-y-0 left-0 w-64 bg-white border-r border-gray-200 z-20 hidden lg:block">
                <div className="h-16 flex items-center px-6 border-b border-gray-100">
                    <span className="text-xl font-bold text-green-700">EcoAdmin</span>
                </div>
                <nav className="p-4 space-y-1">
                    <button onClick={() => navigate('/super-admin/dashboard')} className="w-full flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-xl font-medium transition-colors">
                        <LayoutDashboard className="w-5 h-5" />
                        Dashboard
                    </button>
                    <button onClick={() => navigate('/super-admin/institutions')} className="w-full flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-xl font-medium transition-colors">
                        <Building2 className="w-5 h-5" />
                        Institutions
                    </button>
                    <button onClick={() => navigate('/super-admin/farmers')} className="w-full flex items-center gap-3 px-4 py-3 text-green-700 bg-green-50 rounded-xl font-medium">
                        <Users className="w-5 h-5" />
                        Farmers
                    </button>
                </nav>
                <div className="absolute bottom-0 w-full p-4 border-t border-gray-100">
                    <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl font-medium w-full transition-colors">
                        <LogOut className="w-5 h-5" />
                        Logout
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="lg:ml-64 min-h-screen">
                <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 sm:px-8 sticky top-0 z-10">
                    <h1 className="text-xl font-bold text-gray-800">Registered Farmers</h1>
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-green-700 font-bold">SA</div>
                </header>

                <div className="p-4 sm:p-8 space-y-6">
                    {/* Search */}
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
                        <Search className="w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search farmers..."
                            className="flex-1 outline-none text-gray-700"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    {/* Table */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-semibold">
                                    <tr>
                                        <th className="px-6 py-4">Farmer Name</th>
                                        <th className="px-6 py-4">Mobile</th>
                                        <th className="px-6 py-4">Location</th>
                                        <th className="px-6 py-4">Eco Score</th>
                                        <th className="px-6 py-4">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {loading ? (
                                        <tr><td colSpan="5" className="px-6 py-8 text-center">Loading...</td></tr>
                                    ) : filteredFarmers.length === 0 ? (
                                        <tr><td colSpan="5" className="px-6 py-8 text-center text-gray-500">No farmers found.</td></tr>
                                    ) : (
                                        filteredFarmers.map((farmer) => (
                                            <tr key={farmer.id} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-green-700 font-bold text-xs">
                                                            {farmer.name ? farmer.name[0] : 'F'}
                                                        </div>
                                                        <p className="font-semibold text-gray-900">{farmer.name}</p>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <p className="text-sm text-gray-600 flex items-center gap-1"><Phone className="w-3 h-3" /> {farmer.mobile}</p>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <p className="text-sm text-gray-600 flex items-center gap-1"><MapPin className="w-3 h-3" /> {farmer.location || 'N/A'}</p>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="font-bold text-green-600">{farmer.ecoScore || 0}</span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <button
                                                        onClick={() => handleRemoveFarmer(farmer.id)}
                                                        className="flex items-center gap-2 px-3 py-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors text-sm font-medium"
                                                        title="Remove Farmer"
                                                    >
                                                        <LogOut className="w-4 h-4" />
                                                        Remove
                                                    </button>
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

export default SuperAdminFarmers;
