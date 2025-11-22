import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Loader2, CheckCircle, Sprout, Cloud, Droplets, Wind } from 'lucide-react';
import CropSelector from '../components/CropSelector';

const Missions = () => {
    const [mission, setMission] = useState(null);
    const [loading, setLoading] = useState(false);
    const [selectedCrop, setSelectedCrop] = useState(null);
    const [showCropSelector, setShowCropSelector] = useState(true);

    const generateMission = async () => {
        if (!selectedCrop) {
            alert('Please select a crop first');
            return;
        }

        setLoading(true);

        // Step 1: Get location automatically
        let locationData = {};

        try {
            // Try browser geolocation first
            if ("geolocation" in navigator) {
                const position = await new Promise((resolve, reject) => {
                    navigator.geolocation.getCurrentPosition(resolve, reject, {
                        timeout: 5000,
                        enableHighAccuracy: true
                    });
                });

                locationData = {
                    lat: position.coords.latitude,
                    lon: position.coords.longitude,
                    method: 'gps'
                };
                console.log('Location detected via GPS:', locationData);
            } else {
                // No geolocation support - use IP fallback
                locationData = { useIpFallback: true, method: 'ip' };
                console.log('Using IP-based location fallback');
            }
        } catch (geoError) {
            // Permission denied or timeout - use IP fallback
            console.log('Geolocation failed, using IP fallback:', geoError.message);
            locationData = { useIpFallback: true, method: 'ip' };
        }

        // Step 2: Generate mission with location data
        try {
            const response = await api.post('/missions/generateForCrop', {
                selectedCrop: selectedCrop,
                ...locationData
            });
            setMission(response.data.mission);
            setShowCropSelector(false);
        } catch (error) {
            console.error("Failed to generate mission", error);
            alert(error.response?.data?.message || "Failed to generate mission");
        } finally {
            setLoading(false);
        }
    };

    const selectAnotherCrop = () => {
        setShowCropSelector(true);
        setMission(null);
        setSelectedCrop(null);
    };

    return (
        <div className="space-y-6">
            <header className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Crop Missions</h1>
                    <p className="text-gray-600">Generate crop-specific tasks to earn credits and improve your EcoScore.</p>
                </div>
                {!showCropSelector && (
                    <button
                        onClick={selectAnotherCrop}
                        className="text-eco-600 hover:text-eco-700 font-medium"
                    >
                        ← Select Different Crop
                    </button>
                )}
            </header>

            {showCropSelector ? (
                <>
                    <CropSelector
                        onCropSelect={setSelectedCrop}
                        selectedCrop={selectedCrop}
                        loading={loading}
                    />

                    {selectedCrop && (
                        <div className="text-center">
                            <button
                                onClick={generateMission}
                                disabled={loading}
                                className="bg-eco-600 text-white px-8 py-3 rounded-lg hover:bg-eco-700 transition flex items-center gap-2 mx-auto disabled:opacity-50 text-lg font-semibold"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="animate-spin w-5 h-5" />
                                        Detecting location & generating mission...
                                    </>
                                ) : (
                                    <>Generate Task for {selectedCrop}</>
                                )}
                            </button>
                        </div>
                    )}
                </>
            ) : mission ? (
                <div className="space-y-4">
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

                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-white/60 rounded-lg p-3 flex items-center gap-3">
                                    <Droplets className="w-6 h-6 text-blue-500" />
                                    <div>
                                        <p className="text-xs text-gray-500 font-medium">Humidity</p>
                                        <p className="text-lg font-bold text-gray-800">{mission.weatherSnapshot.humidity}%</p>
                                    </div>
                                </div>
                                <div className="bg-white/60 rounded-lg p-3 flex items-center gap-3">
                                    <Wind className="w-6 h-6 text-blue-500" />
                                    <div>
                                        <p className="text-xs text-gray-500 font-medium">Rain Chance</p>
                                        <p className="text-lg font-bold text-gray-800">{Math.round(mission.weatherSnapshot.rainProbability || 0)}%</p>
                                    </div>
                                </div>
                            </div>

                            {mission.weatherAlerts && mission.weatherAlerts.length > 0 && (
                                <div className="mt-4 bg-red-50 border-2 border-red-300 rounded-lg p-3 flex items-start gap-2">
                                    <svg className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                    </svg>
                                    <div>
                                        <p className="text-sm font-bold text-red-900">Weather Alert</p>
                                        <p className="text-xs text-red-700">{mission.weatherAlerts[0].event}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Mission Card */}
                    <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-eco-100">
                        {/* Crop Tag */}
                        <div className="bg-gradient-to-r from-eco-500 to-eco-600 px-6 py-2 flex items-center gap-2">
                            <Sprout className="w-5 h-5 text-white" />
                            <span className="text-white font-medium">
                                {mission.cropTarget} - {mission.cropStage || 'Growing'}
                            </span>
                        </div>

                        <div className="bg-eco-600 p-4 text-white">
                            <div className="flex justify-between items-start">
                                <h2 className="text-xl font-bold">{mission.task}</h2>
                                <span className="bg-white/20 px-2 py-1 rounded text-sm">{mission.difficulty}</span>
                            </div>
                            <p className="opacity-90 mt-1">Credits: {mission.credits} | EcoScore: +{mission.ecoScoreImpact}</p>
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

                            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                                <h3 className="font-semibold text-blue-800 mb-1">Why do this?</h3>
                                <p className="text-blue-700 text-sm">{mission.benefits}</p>
                            </div>

                            {mission.microLearning && (
                                <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-100">
                                    <h3 className="font-semibold text-yellow-800 mb-1">💡 Did you know?</h3>
                                    <p className="text-yellow-700 text-sm">{mission.microLearning}</p>
                                </div>
                            )}

                            <div className="border-t pt-4">
                                <h3 className="font-semibold text-gray-800 mb-2">Verification Required:</h3>
                                <p className="text-gray-600 text-sm mb-4">{mission.verification}</p>
                                <button className="w-full border-2 border-dashed border-gray-300 rounded-lg p-8 text-gray-500 hover:border-eco-500 hover:text-eco-600 transition flex flex-col items-center gap-2">
                                    <CheckCircle className="w-8 h-8" />
                                    <span>Upload Proof (Photo/Video)</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            ) : null}
        </div>
    );
};

export default Missions;
