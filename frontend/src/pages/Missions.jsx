import React, { useState } from 'react';
import api from '../services/api';
import { Loader2, CheckCircle } from 'lucide-react';

const Missions = () => {
    const [mission, setMission] = useState(null);
    const [loading, setLoading] = useState(false);

    const generateMission = async () => {
        setLoading(true);
        try {
            // Mock farmer data for now
            const farmerData = {
                crop: 'Wheat',
                location: 'Punjab',
                season: 'Rabi',
                landSize: '5 acres'
            };
            const response = await api.post('/missions/generate', farmerData);
            setMission(response.data.mission);
        } catch (error) {
            console.error("Failed to generate mission", error);
            // alert("Failed to generate mission. Is the backend running?");
        } finally {
            setLoading(false);
        }
    };

    // Auto-generate mission on mount
    React.useEffect(() => {
        generateMission();
    }, []);

    return (
        <div className="space-y-6">
            <header className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Daily Missions</h1>
                    <p className="text-gray-600">Complete tasks to earn credits and improve your EcoScore.</p>
                </div>
                <button
                    onClick={generateMission}
                    disabled={loading}
                    className="bg-eco-600 text-white px-4 py-2 rounded-lg hover:bg-eco-700 transition flex items-center gap-2 disabled:opacity-50"
                >
                    {loading ? <Loader2 className="animate-spin w-5 h-5" /> : 'Generate New Mission'}
                </button>
            </header>

            {mission ? (
                <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-eco-100">
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
            ) : (
                <div className="text-center py-20 bg-white rounded-xl border border-dashed border-gray-300">
                    <p className="text-gray-500">No active mission. Generate one to get started!</p>
                </div>
            )}
        </div>
    );
};

export default Missions;
