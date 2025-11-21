import React, { useEffect, useState } from 'react';
import { TrendingUp, Award, Calendar, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const StatCard = ({ icon: Icon, label, value, color, loading }) => (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
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
    const [todayMission, setTodayMission] = useState(null);
    const [loading, setLoading] = useState(true);
    const [statsLoading, setStatsLoading] = useState(true);
    const [stats, setStats] = useState({
        ecoScore: 0,
        badges: 0,
        streak: 0
    });

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                // Fetch today's mission
                const missionResponse = await api.get('/missions/daily');
                if (missionResponse.data.mission) {
                    setTodayMission(missionResponse.data.mission);
                }
            } catch (error) {
                console.error("Failed to fetch dashboard data", error);
            } finally {
                setLoading(false);
            }
        };

        const fetchUserStats = async () => {
            try {
                const statsResponse = await api.get('/gamification/stats');
                if (statsResponse.data.stats) {
                    setStats(statsResponse.data.stats);
                }
            } catch (error) {
                console.error("Failed to fetch user stats", error);
            } finally {
                setStatsLoading(false);
            }
        };

        fetchDashboardData();
        fetchUserStats();
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

            <section className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <h2 className="text-lg font-semibold mb-4">Today's Priority Mission</h2>
                {loading ? (
                    <div className="flex justify-center items-center py-8">
                        <Loader2 className="w-8 h-8 animate-spin text-eco-600" />
                    </div>
                ) : todayMission ? (
                    <div className="bg-eco-50 p-4 rounded-lg border border-eco-100">
                        <h3 className="font-bold text-eco-800 text-lg">{todayMission.task}</h3>
                        <p className="text-gray-600 mt-1">{todayMission.benefits}</p>
                        <div className="mt-2 flex gap-2 text-sm text-eco-700">
                            <span className="bg-eco-100 px-2 py-1 rounded">
                                {todayMission.credits} Credits
                            </span>
                            <span className="bg-eco-100 px-2 py-1 rounded">
                                {todayMission.difficulty}
                            </span>
                        </div>
                        <div className="mt-4 flex gap-2">
                            <button
                                onClick={() => navigate('/missions')}
                                className="bg-eco-600 text-white px-4 py-2 rounded-lg hover:bg-eco-700 transition"
                            >
                                Start Mission
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-8 text-gray-500">
                        <p>No mission available. Generate one from the Missions page!</p>
                        <button
                            onClick={() => navigate('/missions')}
                            className="mt-4 bg-eco-600 text-white px-4 py-2 rounded-lg hover:bg-eco-700 transition"
                        >
                            Go to Missions
                        </button>
                    </div>
                )}
            </section>
        </div>
    );
};

export default Dashboard;
