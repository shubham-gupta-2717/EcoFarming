import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import useEcoStore from '../store/useEcoStore';
import StreakWidget from '../components/StreakWidget';
import MissionCard from '../components/MissionCard';
import BadgeGallery from '../components/BadgeGallery';
import { Loader2, Plus, Trophy } from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
// import { BADGE_DEFINITIONS } from '../components/BadgeGallery'; // Removed invalid import

const GamificationDashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [assigning, setAssigning] = useState(false);
    const [activeTab, setActiveTab] = useState(location.state?.initialTab || 'missions');
    const [history, setHistory] = useState([]);
    const [creditHistory, setCreditHistory] = useState([]); // New State
    const [historyLoading, setHistoryLoading] = useState(false);

    // Read from Global Store
    const {
        userProfile,
        activeMissions,
        badgesEarned
    } = useEcoStore();

    // Fetch History when tab changes
    React.useEffect(() => {
        if (activeTab === 'history' && history.length === 0) {
            fetchHistory();
        }
        if (activeTab === 'credit_history' && creditHistory.length === 0) {
            fetchCreditHistory();
        }
    }, [activeTab]);

    const fetchHistory = async () => {
        try {
            setHistoryLoading(true);
            const res = await api.get('/gamification/history');
            setHistory(res.data.history);
        } catch (error) {
            console.error("Failed to fetch history", error);
        } finally {
            setHistoryLoading(false);
        }
    };

    const fetchCreditHistory = async () => {
        try {
            setHistoryLoading(true);
            const res = await api.get('/gamification/credits/history');
            setCreditHistory(res.data.history);
        } catch (error) {
            console.error("Failed to fetch credit history", error);
        } finally {
            setHistoryLoading(false);
        }
    };

    // Prepare Badge Data (Merge definitions with earned status)
    // Note: Ideally definitions are static or fetched once.
    // For now, we'll assume we have a local copy or fetch them.
    // Let's use a hardcoded list for definitions if not available in store yet.
    const allBadges = [
        { id: 'crop_champion', name: 'Crop Champion', icon: 'Wheat', description: 'Completed 5 crop-specific missions' },
        { id: 'water_saver', name: 'Water Saver', icon: 'Droplets', description: 'Completed 3 water conservation missions' },
        { id: 'pest_protector', name: 'Pest Protector', icon: 'Bug', description: 'Completed 3 pest management missions' },
        { id: 'streak_master', name: 'Streak Master', icon: 'Flame', description: 'Maintained a 7-day streak' },
        { id: 'community_voice', name: 'Community Voice', icon: 'Users', description: 'Shared 5 posts in the community' }
    ];

    const displayBadges = allBadges.map(b => ({
        ...b,
        earned: badgesEarned.includes(b.id)
    }));

    const handleStartMission = async (missionId) => {
        try {
            await api.post('/gamification/mission/start', { missionId });
            // Store will auto-update via listener
        } catch (error) {
            console.error("Failed to start mission", error);
        }
    };

    const handleNewMission = () => {
        navigate('/dashboard/new-mission');
    };

    if (!userProfile) return <div className="flex justify-center p-8"><Loader2 className="animate-spin text-eco-600" /></div>;

    return (
        <div className="max-w-4xl mx-auto px-4 py-6 space-y-8">
            {/* Header Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <StreakWidget
                    streak={userProfile.currentStreakDays || 0}
                    longestStreak={userProfile.longestStreakDays || 0}
                />

                <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex flex-col justify-center items-center text-center">
                    <span className="text-gray-500 text-sm font-medium uppercase tracking-wide">EcoScore</span>
                    <div className="text-4xl font-bold text-eco-700 mt-1">{userProfile.ecoScore || 0}</div>
                    <Link to="/dashboard/leaderboard" className="text-sm text-eco-600 hover:underline mt-2 flex items-center gap-1">
                        <Trophy className="w-3 h-3" /> View Leaderboard
                    </Link>
                </div>

                <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex flex-col justify-center items-center text-center">
                    <span className="text-gray-500 text-sm font-medium uppercase tracking-wide">Credits Earned</span>
                    <div className="text-4xl font-bold text-yellow-500 mt-1">{userProfile.credits || 0}</div>
                    <Link to="/dashboard/store" className="text-sm text-gray-500 hover:text-eco-600 mt-2">
                        Redeem in Store →
                    </Link>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-200 overflow-x-auto">
                <button
                    onClick={() => setActiveTab('missions')}
                    className={`pb-4 px-6 text-sm font-medium transition-colors relative whitespace-nowrap ${activeTab === 'missions' ? 'text-eco-600 border-b-2 border-eco-600 -mb-[1px]' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    Active Missions
                </button>
                <button
                    onClick={() => setActiveTab('history')}
                    className={`pb-4 px-6 text-sm font-medium transition-colors relative whitespace-nowrap ${activeTab === 'history' ? 'text-eco-600 border-b-2 border-eco-600 -mb-[1px]' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    EcoScore History
                </button>
                <button
                    onClick={() => setActiveTab('credit_history')}
                    className={`pb-4 px-6 text-sm font-medium transition-colors relative whitespace-nowrap ${activeTab === 'credit_history' ? 'text-yellow-600 border-b-2 border-yellow-500 -mb-[1px]' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    Credit History
                </button>
            </div>

            {/* Content */}
            {activeTab === 'missions' ? (
                <div>
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold text-gray-800">Your Missions</h2>
                        <button
                            onClick={handleNewMission}
                            className="flex items-center gap-1 text-sm font-medium text-eco-600 hover:bg-eco-50 px-3 py-1.5 rounded-lg transition"
                        >
                            <Plus className="w-4 h-4" />
                            New Mission
                        </button>
                    </div>

                    {activeMissions.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {activeMissions
                                .filter((mission, index, self) =>
                                    index === self.findIndex((m) => m.title === mission.title)
                                )
                                .map(mission => (
                                    <MissionCard
                                        key={mission.id}
                                        mission={mission}
                                        onStart={handleStartMission}
                                    />
                                ))}
                        </div>
                    ) : (
                        <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                            <p className="text-gray-500 mb-2">No active missions</p>
                            <button
                                onClick={handleNewMission}
                                className="bg-eco-600 text-white px-4 py-2 rounded-lg hover:bg-eco-700 font-medium"
                            >
                                Get Your First Mission
                            </button>
                        </div>
                    )}
                </div>
            ) : activeTab === 'history' ? (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <h2 className="text-xl font-bold text-gray-800 mb-6">Score History</h2>
                    {historyLoading ? (
                        <div className="flex justify-center py-12">
                            <Loader2 className="w-8 h-8 animate-spin text-eco-600" />
                        </div>
                    ) : history.length > 0 ? (
                        <div className="space-y-6">
                            {history.map((item, index) => {
                                const isPositive = item.change > 0;
                                return (
                                    <div key={item.id || index} className="flex gap-4">
                                        <div className="flex flex-col items-center">
                                            <div className={`w-3 h-3 rounded-full mt-1.5 ${isPositive ? 'bg-green-500' : 'bg-red-500'}`}></div>
                                            {index !== history.length - 1 && <div className="w-0.5 flex-1 bg-gray-200 my-1"></div>}
                                        </div>
                                        <div className="flex-1 pb-6">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <p className="font-medium text-gray-900">{item.reason}</p>
                                                </div>
                                                <span className={`font-bold ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                                                    {isPositive ? '+' : ''}{item.change}
                                                </span>
                                            </div>
                                            <p className="text-xs text-gray-500">
                                                {(() => {
                                                    const ts = item.timestamp;
                                                    if (!ts) return 'Unknown Date';
                                                    if (ts.seconds) return new Date(ts.seconds * 1000).toLocaleDateString();
                                                    return new Date(ts).toLocaleDateString();
                                                })()} • {item.actionType}
                                            </p>
                                            <div className="mt-2 text-xs text-gray-400">
                                                Score: {item.oldScore} → {item.newScore}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="text-center py-12 text-gray-500">
                            No history available yet.
                        </div>
                    )}
                </div>
            ) : (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <h2 className="text-xl font-bold text-gray-800 mb-6">Credit History</h2>
                    {historyLoading ? (
                        <div className="flex justify-center py-12">
                            <Loader2 className="w-8 h-8 animate-spin text-eco-600" />
                        </div>
                    ) : creditHistory.length > 0 ? (
                        <div className="space-y-6">
                            {creditHistory.map((item, index) => {
                                const isPositive = item.change > 0;
                                return (
                                    <div key={item.id || index} className="flex gap-4">
                                        <div className="flex flex-col items-center">
                                            <div className={`w-3 h-3 rounded-full mt-1.5 ${isPositive ? 'bg-yellow-500' : 'bg-orange-500'}`}></div>
                                            {index !== creditHistory.length - 1 && <div className="w-0.5 flex-1 bg-gray-200 my-1"></div>}
                                        </div>
                                        <div className="flex-1 pb-6">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <p className="font-medium text-gray-900">{item.reason}</p>
                                                </div>
                                                <span className={`font-bold ${isPositive ? 'text-yellow-600' : 'text-orange-600'}`}>
                                                    {isPositive ? '+' : ''}{item.change} Credits
                                                </span>
                                            </div>
                                            <p className="text-xs text-gray-500">
                                                {(() => {
                                                    const ts = item.timestamp;
                                                    if (!ts) return 'Unknown Date';
                                                    if (ts.seconds) return new Date(ts.seconds * 1000).toLocaleDateString();
                                                    return new Date(ts).toLocaleDateString();
                                                })()} • {item.actionType}
                                            </p>
                                            <div className="mt-2 text-xs text-gray-400">
                                                Balance: {item.oldCredits} → {item.newCredits}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="text-center py-12 text-gray-500">
                            No credit history available yet.
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default GamificationDashboard;
