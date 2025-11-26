import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import useEcoStore from '../store/useEcoStore';
import StreakWidget from '../components/StreakWidget';
import MissionCard from '../components/MissionCard';
import BadgeGallery from '../components/BadgeGallery';
import { Loader2, Plus, Trophy } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
// import { BADGE_DEFINITIONS } from '../components/BadgeGallery'; // Removed invalid import

const GamificationDashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [assigning, setAssigning] = useState(false);

    // Read from Global Store
    const {
        userProfile,
        activeMissions,
        badgesEarned
    } = useEcoStore();

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

            {/* Active Missions */}
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
                        {activeMissions.map(mission => (
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


        </div>
    );
};

export default GamificationDashboard;
