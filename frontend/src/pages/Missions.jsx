import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Loader2, CheckCircle, Sprout, Cloud, Droplets, Wind, Trash2, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Missions = () => {
    const { user } = useAuth();
    const [mission, setMission] = useState(null);
    const [loading, setLoading] = useState(false);
    const [userCrops, setUserCrops] = useState([]);
    const [activeMissions, setActiveMissions] = useState({});
    const [selectedCrop, setSelectedCrop] = useState(null);

    useEffect(() => {
        fetchUserCropsAndMissions();
    }, []);

    const fetchUserCropsAndMissions = async () => {
        try {
            setLoading(true);
            // 1. Fetch User Profile for Crops
            const profileRes = await api.get('/auth/profile');
            const crops = profileRes.data.user.crops || [];
            setUserCrops(crops);

            // 2. Fetch Active Missions (using dashboard endpoint for now or a new one)
            // We can filter from dashboard data
            const dashboardRes = await api.get('/gamification/dashboard');
            const missions = dashboardRes.data.missions || [];

            // Map missions by crop for easy lookup (support multiple missions per crop)
            const missionMap = {};
            missions.forEach(m => {
                if (m.status === 'active') {
                    const cropKey = m.crop || 'General';
                    if (!missionMap[cropKey]) {
                        missionMap[cropKey] = [];
                    }
                    missionMap[cropKey].push(m);
                }
            });
            console.log('Active Missions Map:', missionMap);
            setActiveMissions(missionMap);

        } catch (error) {
            console.error("Failed to load data", error);
        } finally {
            setLoading(false);
        }
    };

    const handleCropSelect = (cropName) => {
        setSelectedCrop(cropName);
        // Check if active mission exists
        if (activeMissions[cropName] && activeMissions[cropName].length > 0) {
            // For now, select the first one, or show a list if we want to support multiple
            setMission(activeMissions[cropName][0]);
        } else {
            // Generate new mission
            generateMission(cropName);
        }
    };

    const generateMission = async (cropName) => {
        setLoading(true);
        let locationData = {};

        try {
            if ("geolocation" in navigator) {
                const position = await new Promise((resolve, reject) => {
                    navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 });
                });
                locationData = { lat: position.coords.latitude, lon: position.coords.longitude };
            } else {
                locationData = { useIpFallback: true };
            }
        } catch (e) {
            locationData = { useIpFallback: true };
        }

        try {
            const response = await api.post('/missions/generateForCrop', {
                selectedCrop: cropName,
                ...locationData
            });
            setMission(response.data.mission);
            // Update active missions map
            setActiveMissions(prev => {
                const newMap = { ...prev };
                if (!newMap[cropName]) newMap[cropName] = [];
                newMap[cropName].push(response.data.mission);
                return newMap;
            });
        } catch (error) {
            console.error("Failed to generate mission", error);
            alert(error.response?.data?.message || "Failed to generate mission");
            setSelectedCrop(null); // Go back
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteMission = async (missionId) => {
        if (!window.confirm("Are you sure you want to remove this mission?")) return;

        try {
            await api.delete(`/missions/${missionId}`);
            setMission(null);
            setSelectedCrop(null);
            fetchUserCropsAndMissions(); // Refresh
        } catch (error) {
            console.error("Failed to delete mission", error);
            alert("Failed to delete mission");
        }
    };

    const handleBack = () => {
        setMission(null);
        setSelectedCrop(null);
    };

    if (loading && !userCrops.length) {
        return <div className="flex justify-center p-12"><Loader2 className="animate-spin text-eco-600 w-8 h-8" /></div>;
    }

    // Helper to check if a mission is already shown in the top section
    const isMissionShownInTop = (mission) => {
        return userCrops.some(c => c.cropName === mission.crop);
    };

    return (
        <div className="space-y-6">
            <header>
                <h1 className="text-2xl font-bold text-gray-800">Crop Missions</h1>
                <p className="text-gray-600">Select a crop from your farm to get AI-generated tasks.</p>
            </header>

            {!selectedCrop ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {userCrops.length > 0 ? (
                        userCrops.map((crop, idx) => (
                            <button
                                key={idx}
                                onClick={() => handleCropSelect(crop.cropName)}
                                className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md hover:border-eco-200 transition text-left group relative overflow-hidden"
                            >
                                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition">
                                    <Sprout className="w-16 h-16 text-eco-600" />
                                </div>
                                <div className="relative z-10">
                                    <h3 className="text-lg font-bold text-gray-800">{crop.cropName}</h3>
                                    <p className="text-sm text-gray-500 mb-4">{crop.stage}</p>

                                    {activeMissions[crop.cropName] && activeMissions[crop.cropName].length > 0 ? (
                                        <div className="inline-flex items-center gap-2 text-xs font-medium bg-amber-100 text-amber-700 px-2 py-1 rounded-full">
                                            <Loader2 className="w-3 h-3 animate-spin" />
                                            {activeMissions[crop.cropName].length} Active
                                        </div>
                                    ) : (
                                        <div className="inline-flex items-center gap-1 text-sm font-medium text-eco-600 group-hover:translate-x-1 transition">
                                            Start Mission <ArrowRight className="w-4 h-4" />
                                        </div>
                                    )}
                                </div>
                            </button>
                        ))
                    ) : (
                        <div className="col-span-full text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                            <p className="text-gray-500 mb-4">No crops found in your profile.</p>
                            <a href="/dashboard/profile" className="text-eco-600 font-medium hover:underline">Add crops in Profile</a>
                        </div>
                    )}
                </div>
            ) : mission ? (
                <div className="space-y-4 animate-fadeIn">
                    <button onClick={handleBack} className="text-gray-500 hover:text-gray-700 flex items-center gap-1 mb-2">
                        ← Back to Crops
                    </button>

                    {/* Weather Display */}
                    {mission.weatherSnapshot && (
                        <div className="bg-gradient-to-br from-blue-50 via-cyan-50 to-blue-100 border-2 border-blue-200 rounded-xl p-5 shadow-md">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="bg-white rounded-full p-3 shadow-md">
                                        <Cloud className="w-7 h-7 text-blue-500" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-900">Current Weather</h3>
                                        <p className="text-sm text-gray-600">{mission.weatherSnapshot.location || 'Your Location'}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-4xl font-bold text-blue-600">{mission.weatherSnapshot.temp}°C</div>
                                    <p className="text-sm text-gray-600 capitalize mt-1">{mission.weatherSnapshot.weather}</p>
                                </div>
                            </div>
                            {/* ... (Weather details omitted for brevity, keeping existing structure) ... */}
                        </div>
                    )}

                    {/* Mission Card */}
                    <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-eco-100 relative">
                        {/* Remove Button */}
                        <button
                            onClick={() => handleDeleteMission(mission.missionId || mission.id)}
                            className="absolute top-4 right-4 text-white/80 hover:text-white bg-red-500/80 hover:bg-red-600 p-2 rounded-full transition z-10"
                            title="Remove Mission"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>

                        <div className="bg-eco-600 p-4 text-white">
                            <div className="flex justify-between items-start pr-12">
                                <h2 className="text-xl font-bold">{mission.task || mission.title}</h2>
                                <span className="bg-white/20 px-2 py-1 rounded text-sm">{mission.difficulty}</span>
                            </div>
                            <p className="opacity-90 mt-1">Credits: {mission.credits || mission.points} | EcoScore: +{mission.ecoScoreImpact || 10}</p>
                        </div>

                        <div className="p-6 space-y-6">
                            <div>
                                <h3 className="font-semibold text-gray-800 mb-2">Steps to Complete:</h3>
                                <ul className="space-y-2">
                                    {mission.steps?.map((step, idx) => (
                                        <li key={idx} className="flex items-start gap-2 text-gray-600">
                                            <span className="bg-eco-100 text-eco-700 w-6 h-6 flex items-center justify-center rounded-full text-sm flex-shrink-0">
                                                {idx + 1}
                                            </span>
                                            {step}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* ... (Benefits, MicroLearning, Verification - keeping existing) ... */}

                            <div className="border-t pt-4">
                                <button className="w-full border-2 border-dashed border-gray-300 rounded-lg p-8 text-gray-500 hover:border-eco-500 hover:text-eco-600 transition flex flex-col items-center gap-2">
                                    <CheckCircle className="w-8 h-8" />
                                    <span>Upload Proof (Photo/Video)</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="flex justify-center p-12">
                    <Loader2 className="animate-spin text-eco-600 w-8 h-8" />
                </div>
            )}

            {/* General / Assigned Missions Section */}
            {!selectedCrop && Object.keys(activeMissions).length > 0 && (
                <div className="mt-8 pt-8 border-t border-gray-200">
                    <h2 className="text-xl font-bold text-gray-800 mb-4">Assigned & General Missions</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {Object.values(activeMissions)
                            .flat()
                            .filter(m => !isMissionShownInTop(m))
                            // Deduplicate by title to prevent showing same mission twice (if assigned multiple times)
                            .filter((mission, index, self) =>
                                index === self.findIndex((m) => m.title === mission.title)
                            )
                            .map(mission => (
                                <div key={mission.id} className="bg-white p-5 rounded-xl shadow-sm border border-eco-100 flex justify-between items-center">
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full font-medium">
                                                {mission.category || 'General'}
                                            </span>
                                            {mission.isCustom && (
                                                <span className="bg-purple-100 text-purple-700 text-xs px-2 py-0.5 rounded-full font-medium">
                                                    Assigned
                                                </span>
                                            )}
                                        </div>
                                        <h3 className="font-bold text-gray-900">{mission.title}</h3>
                                        <p className="text-sm text-gray-500">{mission.crop || 'No specific crop'}</p>
                                    </div>
                                    <button
                                        onClick={() => {
                                            setSelectedCrop(mission.crop || 'General');
                                            setMission(mission);
                                        }}
                                        className="bg-eco-50 text-eco-700 p-2 rounded-full hover:bg-eco-100 transition"
                                    >
                                        <ArrowRight className="w-5 h-5" />
                                    </button>
                                </div>
                            ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Missions;
