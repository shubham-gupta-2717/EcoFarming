import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import useEcoStore from '../store/useEcoStore';
import { ArrowLeft, CheckCircle, Upload, Loader2, Calendar, Award } from 'lucide-react';

const MissionDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [checkInNote, setCheckInNote] = useState('');
    const [submitting, setSubmitting] = useState(false);

    // Read from Global Store
    const { activeMissions, pendingMissions, completedMissions } = useEcoStore();

    // Find mission in store
    const mission = [...activeMissions, ...pendingMissions, ...completedMissions].find(m => m.id === id);

    if (!mission) {
        return (
            <div className="text-center p-8">
                <p className="text-gray-500 mb-4">Mission not found or loading...</p>
                <button onClick={() => navigate('/dashboard/missions')} className="text-eco-600 hover:underline">
                    Back to Dashboard
                </button>
            </div>
        );
    }

    const handleCheckIn = async () => {
        if (!checkInNote.trim()) return;
        setSubmitting(true);
        try {
            await api.post('/gamification/mission/checkin', {
                missionId: id,
                note: checkInNote
            });
            alert('Check-in successful! +10 Points');
            setCheckInNote('');
            // Store auto-updates
        } catch (error) {
            alert('Check-in failed');
        } finally {
            setSubmitting(false);
        }
    };

    const handleComplete = async () => {
        if (!window.confirm('Are you sure you have completed all steps?')) return;
        setSubmitting(true);
        try {
            const response = await api.post('/gamification/mission/complete', { missionId: id });
            alert(`Mission Completed! +${response.data.pointsAwarded} Points`);
            navigate('/dashboard/missions');
        } catch (error) {
            alert('Failed to complete mission');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto px-4 py-6">
            <button
                onClick={() => navigate('/dashboard/missions')}
                className="flex items-center gap-2 text-gray-500 hover:text-eco-600 mb-6"
            >
                <ArrowLeft className="w-4 h-4" /> Back to Missions
            </button>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                    <div className="flex justify-between items-start mb-4">
                        <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium uppercase tracking-wide">
                            {mission.category}
                        </span>
                        <div className="flex items-center gap-1 text-eco-600 font-bold">
                            <Award className="w-5 h-5" />
                            <span>{mission.points} pts</span>
                        </div>
                    </div>

                    <h1 className="text-2xl font-bold text-gray-900 mb-2">{mission.title}</h1>
                    <p className="text-gray-600">{mission.description}</p>
                </div>

                <div className="p-6 bg-gray-50">
                    <h3 className="font-semibold text-gray-900 mb-4">Steps to Complete</h3>
                    <div className="space-y-3">
                        {mission.steps?.map((step, index) => (
                            <div key={index} className="flex gap-3 bg-white p-3 rounded-lg border border-gray-100">
                                <div className="w-6 h-6 rounded-full bg-eco-100 text-eco-700 flex items-center justify-center text-sm font-bold flex-shrink-0">
                                    {index + 1}
                                </div>
                                <p className="text-gray-700 text-sm">{step}</p>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="p-6">
                    <h3 className="font-semibold text-gray-900 mb-4">Daily Check-in</h3>
                    <textarea
                        value={checkInNote}
                        onChange={(e) => setCheckInNote(e.target.value)}
                        placeholder="What did you do today? (e.g. Watered the plants, checked for pests)"
                        className="w-full p-3 border border-gray-200 rounded-lg mb-3 focus:ring-2 focus:ring-eco-500 focus:border-transparent"
                        rows="3"
                    />

                    <div className="flex gap-3">
                        <button
                            onClick={handleCheckIn}
                            disabled={!checkInNote.trim() || submitting}
                            className="flex-1 bg-eco-600 text-white py-2.5 rounded-lg font-medium hover:bg-eco-700 disabled:opacity-50 flex justify-center items-center gap-2"
                        >
                            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                            Submit Check-in
                        </button>

                        {/* Placeholder for Media Upload */}
                        <button className="px-4 py-2.5 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50">
                            <Upload className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-center">
                    <button
                        onClick={handleComplete}
                        disabled={submitting || mission.status === 'completed'}
                        className={`w-full py-3 rounded-xl font-bold shadow-lg transition-all transform hover:-translate-y-0.5 ${mission.status === 'completed'
                            ? 'bg-gray-300 text-gray-600 cursor-not-allowed shadow-none'
                            : 'bg-green-600 text-white hover:bg-green-700 shadow-green-200'
                            }`}
                    >
                        {mission.status === 'completed' ? 'Mission Completed' : 'Complete Mission & Claim Points'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default MissionDetail;
