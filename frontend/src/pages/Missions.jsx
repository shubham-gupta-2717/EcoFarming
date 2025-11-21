import React, { useState } from 'react';
import api from '../services/api';
import { Loader2, CheckCircle, Sprout } from 'lucide-react';
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
        try {
            const response = await api.post('/missions/generateForCrop', {
                selectedCrop: selectedCrop
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
                                        Preparing your mission for {selectedCrop}...
                                    </>
                                ) : (
                                    <>Generate Task for {selectedCrop}</>
                                )}
                            </button>
                        </div>
                    )}
                </>
            ) : mission ? (
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
            ) : null}
        </div>
    );
};

export default Missions;

