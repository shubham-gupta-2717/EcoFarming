import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import useEcoStore from '../store/useEcoStore';
import StreakWidget from '../components/StreakWidget';
import MissionCard from '../components/MissionCard';
import BadgeGallery from '../components/BadgeGallery';
import { Loader2, Plus, Trophy, CheckCircle } from 'lucide-react';
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
        pendingMissions, // Fetch pending missions too
        completedMissions, // Fetch completed missions
        badgesEarned,
        setMissions
    } = useEcoStore();

    // Fetch History when tab changes
    React.useEffect(() => {
        if (activeTab === 'history' && history.length === 0) {
            fetchHistory();
        }
        if (activeTab === 'credit_history' && creditHistory.length === 0) {
            fetchCreditHistory();
        }
        // Fetch missions if accessing history (to ensure completed ones are loaded)
        if (activeTab === 'mission_history' && completedMissions.length === 0) {
            fetchMissions();
        }
    }, [activeTab]);

    const fetchMissions = async () => {
        try {
            setHistoryLoading(true);
            const res = await api.get('/gamification/dashboard');
            // Update store with fresh data (Active, Pending, Completed)
            if (res.data.missions) {
                setMissions(res.data.missions);
            }
        } catch (error) {
            console.error("Failed to fetch missions", error);
        } finally {
            setHistoryLoading(false);
        }
    };

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
                    onClick={() => setActiveTab('mission_history')}
                    className={`pb-4 px-6 text-sm font-medium transition-colors relative whitespace-nowrap ${activeTab === 'mission_history' ? 'text-green-600 border-b-2 border-green-600 -mb-[1px]' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    Completed Journey
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

                    {activeMissions.length > 0 || pendingMissions.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {[...pendingMissions, ...activeMissions] // Show Pending (New) first, then Active
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
            ) : activeTab === 'mission_history' ? (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                        <span className="text-2xl">📜</span> Your Farming Journeys
                    </h2>

                    {/* Group by Crop */}
                    {(() => {
                        // Get unique crops from both active and completed missions
                        const allMissions = [...activeMissions, ...completedMissions, ...pendingMissions];
                        const cropNames = [...new Set(allMissions.map(m => m.crop || 'General'))];

                        // Helper to get crop stage from user profile
                        const getCropStage = (cName) => {
                            if (!userProfile?.crops) return 'Unknown';
                            const crop = userProfile.crops.find(c => c.cropName === cName);
                            return crop ? crop.stage : 'General';
                        };

                        if (cropNames.length === 0) {
                            return (
                                <div className="text-center py-12 text-gray-500">
                                    <p>No missions found. Start a mission to see your journey!</p>
                                </div>
                            );
                        }

                        return (
                            <div className="space-y-12">
                                {cropNames.map(cropName => {
                                    const cropStage = getCropStage(cropName);
                                    const cropActive = activeMissions.find(m => m.crop === cropName);
                                    const cropCompleted = completedMissions
                                        .filter(m => m.crop === cropName)
                                        .sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)); // Newest first

                                    return (
                                        <div key={cropName} className="border border-eco-100 rounded-xl overflow-hidden">
                                            {/* Crop Header */}
                                            <div className="bg-eco-50 p-4 border-b border-eco-100 flex justify-between items-center">
                                                <div>
                                                    <h3 className="font-bold text-lg text-gray-800 flex items-center gap-2">
                                                        {cropName === 'Tomato' ? '🍅' : cropName === 'Wheat' ? '🌾' : '🌱'} {cropName} Cycle
                                                    </h3>
                                                    <p className="text-sm text-eco-700 font-medium mt-1">
                                                        Current Stage: <span className="bg-white px-2 py-0.5 rounded border border-eco-200">{cropStage}</span>
                                                    </p>
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-2xl font-bold text-eco-600">{cropCompleted.length}</div>
                                                    <div className="text-xs text-eco-600 uppercase tracking-wide">Missions Done</div>
                                                </div>
                                            </div>

                                            <div className="p-6 bg-white">
                                                {/* 1. CURRENT ACTIVE MISSION */}
                                                <div className="mb-8">
                                                    <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-3">📍 Current Focus</h4>
                                                    {cropActive ? (
                                                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex justify-between items-center shadow-sm">
                                                            <div>
                                                                <h5 className="font-bold text-gray-900">{cropActive.title || cropActive.task}</h5>
                                                                <p className="text-sm text-blue-700 mt-1">In Progress • Step {cropCompleted.length + 1}</p>
                                                            </div>
                                                            <button
                                                                onClick={() => navigate(`/dashboard/mission/${cropActive.id || cropActive.missionId}`)}
                                                                className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-blue-700 transition"
                                                            >
                                                                Continue
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <div className="bg-gray-50 border border-dashed border-gray-300 rounded-lg p-4 text-center text-gray-500 text-sm">
                                                            No active mission. <button onClick={handleNewMission} className="text-eco-600 font-bold hover:underline">Generate Next Step</button>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* 2. HISTORY TIMELINE */}
                                                <div>
                                                    <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-4">📜 Completed History</h4>
                                                    {cropCompleted.length > 0 ? (
                                                        <div className="relative pl-4 border-l-2 border-green-200 space-y-6">
                                                            {cropCompleted.map((historyMission, hIdx) => (
                                                                <div
                                                                    key={hIdx}
                                                                    onClick={() => navigate(`/dashboard/mission/${historyMission.id || historyMission.missionId}`)}
                                                                    className="relative bg-gray-50 p-4 rounded-lg border border-gray-200 cursor-pointer hover:border-eco-300 transition-colors"
                                                                >
                                                                    {/* Timeline Dot */}
                                                                    <div className="absolute -left-[25px] top-6 w-4 h-4 rounded-full bg-green-500 border-2 border-white shadow-sm"></div>

                                                                    <div className="flex justify-between items-start">
                                                                        <div>
                                                                            <h5 className="font-bold text-gray-800">{historyMission.task || historyMission.title}</h5>
                                                                            <p className="text-xs text-gray-500 mt-1">
                                                                                {historyMission.status === 'submitted'
                                                                                    ? `Submitted on ${historyMission.submittedAt ? new Date((typeof historyMission.submittedAt === 'object' && historyMission.submittedAt.seconds ? historyMission.submittedAt.seconds : Date.now() / 1000) * 1000).toLocaleDateString() : new Date().toLocaleDateString()}`
                                                                                    : `Verified on ${historyMission.verifiedAt ? new Date((typeof historyMission.verifiedAt === 'object' && historyMission.verifiedAt.seconds ? historyMission.verifiedAt.seconds : Date.now() / 1000) * 1000).toLocaleDateString() : 'Unknown Status'}`
                                                                                }
                                                                            </p>
                                                                        </div>
                                                                        {historyMission.status === 'submitted' ? (
                                                                            <span className="bg-yellow-100 text-yellow-700 text-xs px-2 py-1 rounded-full font-bold flex items-center gap-1">
                                                                                ⏳ Under Review
                                                                            </span>
                                                                        ) : (
                                                                            <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full font-bold flex items-center gap-1">
                                                                                Verify Done
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    ) : (
                                                        <p className="text-sm text-gray-400 italic">No history yet.</p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        );
                    })()}
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
