import React, { useState, useEffect } from 'react';
import { ArrowLeft, MapPin, Award, Sprout, Loader2 } from 'lucide-react';
import api from '../services/api';

const FarmerProfile = ({ farmer, onBack }) => {
    const [badgeDefinitions, setBadgeDefinitions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchBadges = async () => {
            try {
                const response = await api.get('/gamification/badges');
                setBadgeDefinitions(response.data.badges || []);
            } catch (error) {
                console.error("Failed to fetch badge definitions", error);
            } finally {
                setLoading(false);
            }
        };

        fetchBadges();
    }, []);

    // Helper to find badge details
    const getBadgeDetails = (badgeId) => {
        return badgeDefinitions.find(b => b.id === badgeId) || {
            name: badgeId,
            icon: '🏅',
            description: 'Badge earned'
        };
    };

    const farmerBadges = farmer.badges || [];
    const farmerCrops = farmer.crops || [];

    return (
        <div className="bg-white min-h-screen sm:min-h-0 sm:h-full w-full absolute top-0 left-0 z-50 sm:relative sm:z-0">
            {/* Header with Back Button */}
            <div className="sticky top-0 bg-white z-10 px-4 py-4 border-b border-gray-100 flex items-center gap-4 shadow-sm">
                <button
                    onClick={onBack}
                    className="p-2 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
                >
                    <ArrowLeft className="w-5 h-5 text-gray-700" />
                </button>
                <h2 className="text-xl font-bold text-gray-800">Farmer Profile</h2>
            </div>

            <div className="p-6 max-w-3xl mx-auto space-y-8">
                {/* Profile Header */}
                <div className="flex flex-col items-center text-center">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-green-100 to-green-200 flex items-center justify-center text-4xl font-bold text-green-700 mb-4 shadow-inner">
                        {farmer.avatar || farmer.name?.[0]?.toUpperCase() || 'F'}
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-1">{farmer.name}</h1>
                    <div className="flex items-center gap-1 text-gray-500 text-sm">
                        <MapPin className="w-4 h-4" />
                        <span>
                            {farmer.location?.village ? `${farmer.location.village}, ` : ''}
                            {farmer.location?.subDistrict ? `${farmer.location.subDistrict}, ` : ''}
                            {farmer.location?.district}, {farmer.location?.state}
                        </span>
                    </div>

                    <div className="mt-4 flex gap-6">
                        <div className="text-center">
                            <div className="text-2xl font-bold text-green-600">{farmer.score}</div>
                            <div className="text-xs text-gray-500 uppercase tracking-wide">EcoScore</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-orange-600">{farmerBadges.length}</div>
                            <div className="text-xs text-gray-500 uppercase tracking-wide">Badges</div>
                        </div>
                    </div>
                </div>

                {/* Crops Section */}
                <div className="bg-green-50 rounded-2xl p-6 border border-green-100">
                    <div className="flex items-center gap-2 mb-4">
                        <Sprout className="w-5 h-5 text-green-700" />
                        <h3 className="font-bold text-gray-800">Crops Cultivated</h3>
                    </div>

                    {farmerCrops.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                            {farmerCrops.map((crop, index) => (
                                <span
                                    key={index}
                                    className="bg-white text-green-800 px-3 py-1.5 rounded-lg text-sm font-medium border border-green-200 shadow-sm"
                                >
                                    {typeof crop === 'string' ? crop : crop.cropName}
                                </span>
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-500 text-sm italic">No crops listed yet.</p>
                    )}
                </div>

                {/* Badges Section */}
                <div>
                    <div className="flex items-center gap-2 mb-4 px-1">
                        <Award className="w-5 h-5 text-yellow-600" />
                        <h3 className="font-bold text-gray-800">Badges Earned</h3>
                    </div>

                    {loading ? (
                        <div className="flex justify-center py-8">
                            <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                        </div>
                    ) : farmerBadges.length > 0 ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                            {farmerBadges.map((badgeId) => {
                                const badge = getBadgeDetails(badgeId);
                                return (
                                    <div
                                        key={badgeId}
                                        className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col items-center text-center gap-2"
                                    >
                                        <div className="text-3xl">{badge.icon}</div>
                                        <div>
                                            <div className="font-bold text-gray-800 text-sm">{badge.name}</div>
                                            <div className="text-xs text-gray-500 line-clamp-2">{badge.description}</div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="text-center py-8 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                            <p className="text-gray-500 text-sm">No badges earned yet.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default FarmerProfile;
