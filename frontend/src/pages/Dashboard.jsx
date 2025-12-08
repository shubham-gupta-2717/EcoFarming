import React, { useEffect, useState } from 'react';
import { TrendingUp, Award, Calendar, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

import useEcoStore from '../store/useEcoStore';
import WeatherWidget from '../components/WeatherWidget';

const StatCard = ({ icon: Icon, label, value, color, loading, onClick }) => (
    <div
        onClick={onClick}
        className={`bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4 ${onClick ? 'cursor-pointer hover:shadow-md transition-shadow' : ''}`}
    >
        <div className={`p-3 rounded-full ${color}`}>
            <Icon className="w-6 h-6 text-white" />
        </div>
        <div>
            <p className="text-sm text-gray-500">{label}</p>
            {loading ? (
                <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
            ) : (
                <p className="text-xl font-bold text-gray-800">{value}</p>
            )}
        </div>
    </div>
);

const Dashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [statsLoading, setStatsLoading] = useState(true);
    const { userProfile, badgesEarned, activeMissions } = useEcoStore();

    const stats = {
        ecoScore: userProfile?.ecoScore || 0,
        badges: badgesEarned?.length || 0,
        streak: userProfile?.currentStreakDays || 0
    };

    useEffect(() => {
        // Simulate loading stats or wait for store
        const timer = setTimeout(() => {
            setStatsLoading(false);
        }, 500);
        return () => clearTimeout(timer);
    }, []);

    return (
        <div className="space-y-6">
            <header>
                <h1 className="text-2xl font-bold text-gray-800">
                    Welcome back, {user?.name || 'Farmer'}! 🌾
                </h1>
                <p className="text-gray-600">Here is your farming summary for today.</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <StatCard
                    icon={TrendingUp}
                    label="EcoScore"
                    value={stats.ecoScore}
                    color="bg-eco-500"
                    loading={statsLoading}
                    onClick={() => navigate('/dashboard/missions', { state: { initialTab: 'history' } })}
                />
                <StatCard
                    icon={Award}
                    label="Badges"
                    value={stats.badges}
                    color="bg-yellow-500"
                    loading={statsLoading}
                />
                <StatCard
                    icon={Calendar}
                    label="Day Streak"
                    value={`${stats.streak} Days`}
                    color="bg-blue-500"
                    loading={statsLoading}
                />
            </div>

            <div className="mt-6">
                <WeatherWidget />
            </div>
        </div>
    );
};

export default Dashboard;
