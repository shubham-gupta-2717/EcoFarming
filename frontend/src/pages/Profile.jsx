import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Award, TrendingUp, Flame, LogOut, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import ManageCrops from '../components/ManageCrops';

const Profile = () => {
    const { user, logout, login, updateUser } = useAuth(); // Assuming login updates context
    const navigate = useNavigate();
    const [badges, setBadges] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    // Edit States
    const [editingEmail, setEditingEmail] = useState(false);
    const [email, setEmail] = useState('');
    const [editingName, setEditingName] = useState(false);
    const [name, setName] = useState('');
    const [editingLocation, setEditingLocation] = useState(false);
    const [location, setLocation] = useState('');
    const [updating, setUpdating] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const handleUpdateProfile = async (field) => {
        let value;
        if (field === 'email') value = email;
        else if (field === 'name') value = name;
        else if (field === 'location') value = location;

        if (field === 'email' && (!value || !value.includes('@'))) {
            alert('Please enter a valid email');
            return;
        }
        if (field === 'name' && !value.trim()) {
            alert('Please enter a valid name');
            return;
        }
        if (field === 'location' && !value.trim()) {
            alert('Please enter a valid location');
            return;
        }

        try {
            setUpdating(true);
            const updateData = {};
            if (field === 'email') updateData.email = value;
            if (field === 'name') updateData.name = value;
            if (field === 'location') updateData.location = value;

            const response = await api.put('/auth/profile', updateData);

            if (response.data.success) {
                updateUser(updateData);
                if (field === 'email') setEditingEmail(false);
                if (field === 'name') setEditingName(false);
                if (field === 'location') setEditingLocation(false);
            }
        } catch (error) {
            console.error(`Failed to update ${field}`, error);
            const errorMessage = error.response?.data?.message || error.message || 'Unknown error';
            alert(`Failed to update ${field}: ${errorMessage}`);
        } finally {
            setUpdating(false);
        }
    };

    useEffect(() => {
        const fetchProfileData = async () => {
            try {
                const [badgesResponse, statsResponse] = await Promise.all([
                    api.get('/gamification/badges'),
                    api.get('/gamification/stats')
                ]);

                setBadges(badgesResponse.data.badges);
                setStats(statsResponse.data.stats);
            } catch (error) {
                console.error("Failed to fetch profile data", error);
            } finally {
                setLoading(false);
            }
        };

        fetchProfileData();
    }, []);

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <Loader2 className="w-8 h-8 animate-spin text-eco-600" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <header className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">My Profile</h1>
                    <p className="text-gray-600">Track your progress and achievements</p>
                </div>
                <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition"
                >
                    <LogOut className="w-4 h-4" />
                    Logout
                </button>
            </header>

            {/* User Info Card */}
            <div className="bg-gradient-to-r from-eco-600 to-eco-700 rounded-xl p-6 text-white shadow-lg">
                <div className="flex items-center gap-4">
                    <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center text-3xl font-bold">
                        {user?.name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'D'}
                    </div>
                    <div className="flex-1">
                        {/* Name Edit Section */}
                        <div className="flex items-center gap-2 mb-1">
                            {editingName ? (
                                <div className="flex items-center gap-2">
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="px-2 py-1 rounded text-gray-800 text-lg font-bold focus:outline-none focus:ring-2 focus:ring-eco-300 w-48"
                                        placeholder="Enter name"
                                    />
                                    <button
                                        onClick={() => handleUpdateProfile('name')}
                                        disabled={updating}
                                        className="bg-white/20 hover:bg-white/30 px-2 py-1 rounded text-xs font-medium transition"
                                    >
                                        {updating ? 'Saving...' : 'Save'}
                                    </button>
                                    <button
                                        onClick={() => setEditingName(false)}
                                        className="text-white/70 hover:text-white text-xs"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            ) : (
                                <div className="flex items-center gap-2 group">
                                    <h2 className="text-2xl font-bold">{user?.name || 'Demo Farmer'}</h2>
                                    <button
                                        onClick={() => {
                                            setName(user?.name || '');
                                            setEditingName(true);
                                        }}
                                        className="opacity-0 group-hover:opacity-100 transition text-xs bg-white/20 px-2 py-0.5 rounded hover:bg-white/30"
                                    >
                                        Edit
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Location Edit Section */}
                        <div className="flex items-center gap-2 text-white/80 text-sm">
                            {editingLocation ? (
                                <div className="flex items-center gap-2">
                                    <input
                                        type="text"
                                        value={location}
                                        onChange={(e) => setLocation(e.target.value)}
                                        className="px-2 py-0.5 rounded text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-eco-300 w-32"
                                        placeholder="Enter location"
                                    />
                                    <button
                                        onClick={() => handleUpdateProfile('location')}
                                        disabled={updating}
                                        className="bg-white/20 hover:bg-white/30 px-2 py-0.5 rounded text-xs font-medium transition"
                                    >
                                        Save
                                    </button>
                                    <button
                                        onClick={() => setEditingLocation(false)}
                                        className="text-white/70 hover:text-white text-xs"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            ) : (
                                <div className="flex items-center gap-2 group">
                                    <span>{user?.location || 'India'}</span>
                                    <button
                                        onClick={() => {
                                            setLocation(user?.location || '');
                                            setEditingLocation(true);
                                        }}
                                        className="opacity-0 group-hover:opacity-100 transition text-xs bg-white/20 px-2 py-0.5 rounded hover:bg-white/30"
                                    >
                                        Edit
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Email Edit Section */}
                        <div className="flex items-center gap-2 mt-1">
                            {editingEmail ? (
                                <div className="flex items-center gap-2">
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="px-2 py-1 rounded text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-eco-300"
                                        placeholder="Enter email"
                                    />
                                    <button
                                        onClick={() => handleUpdateProfile('email')}
                                        disabled={updating}
                                        className="bg-white/20 hover:bg-white/30 px-2 py-1 rounded text-xs font-medium transition"
                                    >
                                        {updating ? 'Saving...' : 'Save'}
                                    </button>
                                    <button
                                        onClick={() => setEditingEmail(false)}
                                        className="text-white/70 hover:text-white text-xs"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            ) : (
                                <div className="flex items-center gap-2 group">
                                    <p className="opacity-90">{user?.email || 'Add email address'}</p>
                                    <button
                                        onClick={() => {
                                            setEmail(user?.email || '');
                                            setEditingEmail(true);
                                        }}
                                        className="opacity-0 group-hover:opacity-100 transition text-xs bg-white/20 px-2 py-0.5 rounded hover:bg-white/30"
                                    >
                                        Edit
                                    </button>
                                </div>
                            )}
                        </div>
                        {/* Mobile Number (non-editable) */}
                        <div className="flex items-center gap-2 mt-1">
                            <span className="text-gray-400">Mobile:</span>
                            <span className="text-lg font-mono text-gray-800">{user?.mobile || ''}</span>
                        </div>

                        <p className="text-sm opacity-75 mt-1">
                            Level {stats?.level || 1} • {stats?.levelTitle || 'Beginner Farmer'}
                        </p>
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-eco-100 rounded-full">
                            <TrendingUp className="w-6 h-6 text-eco-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">EcoScore</p>
                            <p className="text-2xl font-bold text-gray-800">{stats?.ecoScore || 0}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-orange-100 rounded-full">
                            <Flame className="w-6 h-6 text-orange-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Day Streak</p>
                            <p className="text-2xl font-bold text-gray-800">{stats?.streak || 0} Days</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-yellow-100 rounded-full">
                            <Award className="w-6 h-6 text-yellow-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Badges Earned</p>
                            <p className="text-2xl font-bold text-gray-800">{stats?.badges || 0}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Crop Management */}
            <ManageCrops />

            {/* Badges Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">My Badges</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {badges.map((badge) => (
                        <div
                            key={badge.id}
                            className={`p-4 rounded-lg border-2 text-center transition ${badge.earned
                                ? 'border-eco-200 bg-eco-50'
                                : 'border-gray-200 bg-gray-50 opacity-50'
                                }`}
                        >
                            <div className="text-4xl mb-2">{badge.icon}</div>
                            <p className="text-sm font-medium text-gray-700">{badge.name}</p>
                            {badge.description && (
                                <p className="text-xs text-gray-500 mt-1">{badge.description}</p>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Transaction History Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Transaction History</h3>
                <div className="space-y-4">
                    {user?.transactions?.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                            <p>No transactions yet</p>
                        </div>
                    ) : (
                        user?.transactions?.map((tx, index) => (
                            <div key={tx.id || index} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors border border-transparent hover:border-gray-100">
                                <div className="flex items-center gap-3">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${tx.type === 'credit' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                                        }`}>
                                        {tx.type === 'credit' ? <TrendingUp className="w-5 h-5" /> : <LogOut className="w-5 h-5 rotate-180" />}
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-800">{tx.description}</p>
                                        <p className="text-xs text-gray-500">{tx.date}</p>
                                    </div>
                                </div>
                                <span className={`font-bold ${tx.type === 'credit' ? 'text-green-600' : 'text-red-600'
                                    }`}>
                                    {tx.type === 'credit' ? '+' : '-'}{tx.amount}
                                </span>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div >
    );
};

export default Profile;
