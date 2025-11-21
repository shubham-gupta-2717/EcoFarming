import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Award, TrendingUp, Flame, LogOut, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import ManageCrops from '../components/ManageCrops';

const Profile = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [badges, setBadges] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    const handleLogout = () => {
        logout();
        navigate('/login');
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
                    <div>
                        <h2 className="text-2xl font-bold">{user?.name || 'Demo Farmer'}</h2>
                        <p className="opacity-90">{user?.email || 'demo@ecofarming.com'}</p>
                        <p className="text-sm opacity-75 mt-1">
                            Level {stats?.level || 3} • {stats?.levelTitle || 'Expert Farmer'}
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
                            <p className="text-2xl font-bold text-gray-800">{stats?.ecoScore || 850}</p>
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
                            <p className="text-2xl font-bold text-gray-800">{stats?.streak || 5} Days</p>
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
                            <p className="text-2xl font-bold text-gray-800">{stats?.badges || 12}</p>
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
        </div>
    );
};

export default Profile;
