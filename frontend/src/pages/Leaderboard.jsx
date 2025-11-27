import React, { useState, useEffect } from 'react';
import useEcoStore from '../store/useEcoStore';
import { Trophy, MapPin, Filter, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Leaderboard = () => {
    const { user } = useAuth();
    const { leaderboardSnapshot, syncLeaderboard } = useEcoStore();
    const [loading, setLoading] = useState(false);
    const [scope, setScope] = useState('global');
    const [scopeValue, setScopeValue] = useState('');

    const [userCrops, setUserCrops] = useState([]);
    const [selectedCrop, setSelectedCrop] = useState('');

    useEffect(() => {
        // Parse user crops
        if (user?.crop) {
            const crops = user.crop.split(',').map(c => c.trim()).filter(Boolean);
            setUserCrops(crops);
            if (crops.length > 0 && !selectedCrop) {
                setSelectedCrop(crops[0]);
            }
        }
    }, [user]);

    useEffect(() => {
        // Set default scope value based on user profile when scope changes
        if (scope === 'state') setScopeValue(user?.location?.state || user?.state || '');
        else if (scope === 'district') setScopeValue(user?.location?.district || user?.district || '');
        else if (scope === 'subDistrict') setScopeValue(user?.location?.subDistrict || user?.subDistrict || '');
        else if (scope === 'village') setScopeValue(user?.location?.village || user?.village || '');
        else if (scope === 'crop') setScopeValue(selectedCrop || user?.crop || '');
        else setScopeValue('');
    }, [scope, user, selectedCrop]);

    useEffect(() => {
        // Only sync if global, or if we have a scope value
        // This prevents fetching with empty value when switching scopes (race condition)
        if (scope === 'global' || scopeValue) {
            handleSync();
        }
    }, [scope, scopeValue]);

    const handleSync = async () => {
        console.log('Syncing Leaderboard:', { scope, scopeValue });
        setLoading(true);
        await syncLeaderboard(scope, scopeValue);
        setLoading(false);
    };

    return (
        <div className="max-w-4xl mx-auto px-4 py-6">
            <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center justify-center gap-2">
                    <Trophy className="w-8 h-8 text-yellow-500" />
                    Eco Champions
                </h1>
                <p className="text-gray-600">Top performing farmers leading the sustainable revolution</p>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6 flex flex-wrap gap-4 items-center justify-center">
                <div className="flex items-center gap-2 text-gray-600">
                    <Filter className="w-4 h-4" />
                    <span className="text-sm font-medium">Filter by:</span>
                </div>

                <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0 no-scrollbar">
                    {['global', 'state', 'district', 'subDistrict', 'village', 'crop'].map((s) => (
                        <button
                            key={s}
                            onClick={() => setScope(s)}
                            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${scope === s
                                ? 'bg-green-600 text-white shadow-md'
                                : 'bg-white text-gray-600 hover:bg-green-50'
                                }`}
                        >
                            {s.charAt(0).toUpperCase() + s.slice(1).replace(/([A-Z])/g, ' $1')}
                        </button>
                    ))}
                </div>

                {/* Scope Value Display or Warning */}
                <div className="bg-green-50 px-4 py-3 rounded-xl flex items-center gap-2 flex-wrap">
                    <Filter className="w-4 h-4 text-green-600" />

                    {scope === 'crop' && userCrops.length > 1 ? (
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-green-800">Filter by Crop:</span>
                            <select
                                value={selectedCrop}
                                onChange={(e) => setSelectedCrop(e.target.value)}
                                className="text-sm border-gray-300 rounded-md shadow-sm focus:border-green-500 focus:ring focus:ring-green-200 focus:ring-opacity-50 py-1 pl-2 pr-8 bg-white"
                            >
                                {userCrops.map(crop => (
                                    <option key={crop} value={crop}>{crop}</option>
                                ))}
                            </select>
                        </div>
                    ) : (
                        <span className="text-sm font-medium text-green-800">
                            {scope === 'global' ? 'Global Leaderboard' :
                                scopeValue ? `Filtering by ${scope}: ${scopeValue}` :
                                    `Please update your profile to filter by ${scope}`}
                        </span>
                    )}

                    {!scopeValue && scope !== 'global' && (
                        <button
                            onClick={() => navigate('/profile')}
                            className="ml-auto text-xs bg-green-600 text-white px-3 py-1 rounded-lg hover:bg-green-700 shadow-sm"
                        >
                            Update Profile
                        </button>
                    )}
                </div>
            </div>

            {/* List */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                {loading && leaderboardSnapshot.length === 0 ? (
                    <div className="p-12 flex justify-center">
                        <Loader2 className="w-8 h-8 animate-spin text-eco-600" />
                    </div>
                ) : leaderboardSnapshot.length > 0 ? (
                    <div className="divide-y divide-gray-100">
                        {leaderboardSnapshot.map((leader, index) => (
                            <div
                                key={leader.userId}
                                className={`p-4 flex items-center gap-4 hover:bg-gray-50 transition ${leader.userId === user?.uid ? 'bg-eco-50' : ''
                                    }`}
                            >
                                <div className={`w-8 h-8 flex items-center justify-center font-bold rounded-full ${index === 0 ? 'bg-yellow-100 text-yellow-700' :
                                    index === 1 ? 'bg-gray-100 text-gray-700' :
                                        index === 2 ? 'bg-orange-100 text-orange-700' :
                                            'text-gray-500'
                                    }`}>
                                    {index + 1}
                                </div>

                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-eco-100 to-eco-200 flex items-center justify-center text-eco-700 font-bold">
                                    {leader.avatar}
                                </div>

                                <div className="flex-1">
                                    <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                                        {leader.name}
                                        {leader.userId === user?.uid && (
                                            <span className="text-[10px] bg-eco-200 text-eco-800 px-1.5 py-0.5 rounded-full">You</span>
                                        )}
                                    </h3>
                                    <p className="text-xs text-gray-500">
                                        {leader.location?.village ? `${leader.location.village}, ` : ''}
                                        {leader.location?.subDistrict ? `${leader.location.subDistrict}, ` : ''}
                                        {leader.location?.district}, {leader.location?.state}
                                    </p>
                                </div>

                                <div className="text-right">
                                    <div className="font-bold text-eco-700">{leader.score}</div>
                                    <div className="text-[10px] text-gray-400 uppercase tracking-wide">Points</div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="p-12 text-center text-gray-500">
                        No leaders found for this category yet.
                    </div>
                )}
            </div>
        </div>
    );
};

export default Leaderboard;
