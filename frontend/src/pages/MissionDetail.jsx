import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import useEcoStore from '../store/useEcoStore'; // Added
import { useAuth } from '../context/AuthContext'; // Added
import PhotoUpload from '../components/PhotoUpload';
import {
    ArrowLeft, CheckCircle, Upload, Loader2, Calendar, Award,
    AlertCircle, Clock, XCircle, Image as ImageIcon
} from 'lucide-react';
import TextToSpeech from '../components/TextToSpeech';

const MissionDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth(); // Needed for cache key
    const { activeMissions, pendingMissions } = useEcoStore(); // Needed for fast lookup

    const [notes, setNotes] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [uploadedImage, setUploadedImage] = useState(null);
    const [missionData, setMissionData] = useState(null);
    const [loading, setLoading] = useState(true);

    // Fetch mission data (Offline First Strategy)
    useEffect(() => {
        const loadMission = async () => {
            setLoading(true);

            // 1. Try Store (Fastest, Memory)
            const allMissions = [...activeMissions, ...pendingMissions];
            const fromStore = allMissions.find(m => m.id === id);

            if (fromStore) {
                console.log('✅ Loaded mission from Memory Store');
                setMissionData(fromStore);
                setLoading(false);
                return;
            }

            // 2. Try Offline Cache (IndexedDB)
            try {
                if (user?.uid) {
                    const { getFromCache } = await import('../utils/indexedDB');
                    const cachedMissions = await getFromCache(`missions_${user.uid}`);

                    if (cachedMissions) {
                        const fromCache = cachedMissions.find(m => m.id === id);
                        if (fromCache) {
                            console.log('📦 Loaded mission from IndexedDB Cache');
                            setMissionData(fromCache);
                            setLoading(false);
                            return;
                        }
                    }
                }
            } catch (err) {
                console.error("Cache check failed:", err);
            }

            // 3. Try Network (API) - Fallback
            try {
                if (navigator.onLine) {
                    // Try to get from dashboard data which includes all missions
                    const response = await api.get('/gamification/dashboard');
                    const missions = response.data.missions || [];
                    const foundMission = missions.find(m => m.id === id);

                    if (foundMission) {
                        setMissionData(foundMission);
                    } else {
                        console.warn("Mission not found in API response");
                    }
                } else {
                    console.warn("Offline and mission not in cache.");
                }
            } catch (error) {
                console.error('Error fetching mission:', error);
            } finally {
                setLoading(false);
            }
        };

        loadMission();
    }, [id, user?.uid, activeMissions.length]); // Re-run if store updates

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-eco-600" />
            </div>
        );
    }

    if (!missionData) {
        return (
            <div className="text-center p-8">
                <p className="text-gray-500 mb-4">Mission not found or loading...</p>
                <button onClick={() => navigate('/dashboard/missions')} className="text-eco-600 hover:underline">
                    Back to Dashboard
                </button>
            </div>
        );
    }

    const handleSubmitMission = async () => {
        if (!uploadedImage) {
            alert('Please upload a photo proof');
            return;
        }

        setSubmitting(true);
        try {
            // OFFLINE HANDLING
            if (!navigator.onLine) {
                // Dynamic Import to avoid huge bundle
                const { offlineQueue } = await import('../utils/OfflineQueue');
                const { compressImage } = await import('../utils/imageCompression');

                // 1. Compress Image
                const compressedBlob = await compressImage(uploadedImage);

                // 2. Queue Action
                await offlineQueue.output('MISSION_PROOF', {
                    missionId: id,
                    imageBlob: compressedBlob,
                    notes: notes,
                    timestamp: new Date().toISOString()
                }, 2); // Priority 2

                alert("You are OFFLINE. Mission proof saved locally! 💾\nIt will auto-sync when you reconnect.");
                setUploadedImage(null);
                setNotes('');
                navigate('/dashboard/offline'); // Redirect to show queue
                return;
            }

            // ONLINE HANDLING
            const formData = new FormData();
            formData.append('image', uploadedImage);
            formData.append('notes', notes);

            const response = await api.post(`/missions/${id}/submit`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            // Clear form
            setUploadedImage(null);
            setNotes('');

            alert(response.data.message || 'Mission submitted! AI verification in progress...');

            // Refresh mission data to show new status
            await fetchMissionData();
        } catch (error) {
            console.error('Submission error:', error);
            if (error.message.includes("Offline")) {
                alert("Offline Storage Full or Error. Please check connection.");
            } else {
                alert(error.response?.data?.message || 'Failed to submit mission');
            }
        } finally {
            setSubmitting(false);
        }
    };

    const getStatusBadge = () => {
        const status = missionData.status?.toUpperCase() || 'ASSIGNED';

        const badges = {
            'ASSIGNED': { color: 'bg-blue-100 text-blue-700', icon: Calendar, text: 'Active' },
            'SUBMITTED': { color: 'bg-yellow-100 text-yellow-700', icon: Clock, text: 'Verifying...' },
            'VERIFIED': { color: 'bg-green-100 text-green-700', icon: CheckCircle, text: 'Approved' },
            'COMPLETED': { color: 'bg-green-100 text-green-700', icon: CheckCircle, text: 'Completed' },
            'REJECTED': { color: 'bg-red-100 text-red-700', icon: XCircle, text: 'Rejected' }
        };

        const badge = badges[status] || badges['ASSIGNED'];
        const Icon = badge.icon;

        return (
            <span className={`px-3 py-1 ${badge.color} rounded-full text-xs font-medium uppercase tracking-wide flex items-center gap-1 w-fit`}>
                <Icon className="w-3 h-3" />
                {badge.text}
            </span>
        );
    };

    const renderActionSection = () => {
        const status = missionData.status?.toUpperCase() || 'ASSIGNED';

        // ASSIGNED, ACTIVE, or REJECTED - Show submission form
        if (status === 'ASSIGNED' || status === 'ACTIVE' || status === 'REJECTED') {
            return (
                <div className="p-6 border-t border-gray-100">
                    {status === 'REJECTED' && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                            <div className="flex items-start gap-3">
                                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                                <div>
                                    <h4 className="font-semibold text-red-900 mb-1">Mission Rejected</h4>
                                    <p className="text-sm text-red-700">{missionData.verificationReason}</p>
                                    <p className="text-xs text-red-600 mt-2">You can re-submit with a new photo</p>
                                </div>
                            </div>
                        </div>
                    )}

                    <h3 className="font-semibold text-gray-900 mb-4">Submit Mission Proof</h3>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Photo Proof <span className="text-red-500">*</span>
                            </label>
                            <PhotoUpload
                                onUpload={setUploadedImage}
                                disabled={submitting}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Notes (Optional)
                            </label>
                            <textarea
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                placeholder="Add any additional notes about your work..."
                                className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-eco-500 focus:border-transparent"
                                rows="3"
                                disabled={submitting}
                            />
                        </div>

                        <button
                            onClick={handleSubmitMission}
                            disabled={!uploadedImage || submitting}
                            className="w-full py-3 rounded-xl font-bold shadow-lg transition-all transform hover:-translate-y-0.5 bg-eco-600 text-white hover:bg-eco-700 shadow-eco-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
                        >
                            {submitting ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Submitting...
                                </>
                            ) : (
                                <>
                                    <Upload className="w-5 h-5" />
                                    Submit Mission
                                </>
                            )}
                        </button>
                    </div>
                </div>
            );
        }

        // SUBMITTED - Show waiting message
        if (status === 'SUBMITTED') {
            return (
                <div className="p-6 border-t border-gray-100 bg-yellow-50">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin" />
                        <div>
                            <h4 className="font-semibold text-yellow-900">AI Verification in Progress</h4>
                            <p className="text-sm text-yellow-700">Your submission is being verified...</p>
                        </div>
                    </div>

                    {missionData.imageUrl && (
                        <div className="mt-4">
                            <p className="text-xs text-gray-600 mb-2">Submitted Photo:</p>
                            <img
                                src={missionData.imageUrl}
                                alt="Submitted proof"
                                className="w-full h-48 object-cover rounded-lg border-2 border-yellow-300"
                            />
                        </div>
                    )}

                    <button
                        disabled
                        className="w-full mt-4 py-3 rounded-xl font-bold bg-gray-300 text-gray-600 cursor-not-allowed"
                    >
                        Awaiting Verification
                    </button>
                </div>
            );
        }

        // VERIFIED or COMPLETED - Show success
        if (status === 'VERIFIED' || status === 'COMPLETED') {
            return (
                <div className="p-6 border-t border-gray-100 bg-green-50">
                    <div className="flex items-center gap-3 mb-4">
                        <CheckCircle className="w-10 h-10 text-green-600" />
                        <div>
                            <h4 className="font-semibold text-green-900">Mission Approved!</h4>
                            <p className="text-sm text-green-700">
                                {missionData.aiVerified ? 'Verified by AI' : 'Manually approved by admin'}
                            </p>
                        </div>
                    </div>

                    <div className="bg-white border border-green-200 rounded-lg p-4 mb-4">
                        <div className="flex items-center justify-between">
                            <span className="text-gray-700">Points Earned:</span>
                            <span className="text-2xl font-bold text-eco-600">+{missionData.points}</span>
                        </div>
                    </div>

                    {missionData.imageUrl && (
                        <div className="mt-4">
                            <p className="text-xs text-gray-600 mb-2">Submitted Photo:</p>
                            <img
                                src={missionData.imageUrl}
                                alt="Approved proof"
                                className="w-full h-48 object-cover rounded-lg border-2 border-green-300"
                            />
                        </div>
                    )}

                    {missionData.verificationReason && (
                        <div className="mt-4 p-3 bg-green-100 rounded-lg">
                            <p className="text-xs text-green-800">
                                <strong>Verification Note:</strong> {missionData.verificationReason}
                            </p>
                        </div>
                    )}

                    <button
                        disabled
                        className="w-full mt-4 py-3 rounded-xl font-bold bg-green-600 text-white cursor-default"
                    >
                        ✓ Mission Completed
                    </button>
                </div>
            );
        }

        return null;
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
                        {getStatusBadge()}
                        <div className="flex items-center gap-1 text-eco-600 font-bold">
                            <Award className="w-5 h-5" />
                            <span>{missionData.points} pts</span>
                        </div>
                    </div>

                    <h1 className="text-2xl font-bold text-gray-900 mb-2">{missionData.title}</h1>

                    {/* OPTIMIZED TEXT RENDERING */}
                    <div className="text-gray-600 leading-relaxed space-y-4">
                        {(() => {
                            // SPECIAL HANDLING: Extract Weather Info if present
                            // AI often appends: "**Today's weather is...**" OR "**Current weather is...**"
                            // Regex looks for strictly bolded sections that contain the word "weather"
                            const weatherRegex = /(\*\*.*weather.*?\*\*)/i;
                            const parts = (missionData.description || '').split(weatherRegex);

                            return parts.map((part, idx) => {
                                if (!part.trim()) return null;

                                // If this part matches the weather regex, render it as a special alert
                                if (part.match(weatherRegex)) {
                                    // Remove asterisks for display
                                    const cleanText = part.replace(/\*\*/g, '').trim();
                                    return (
                                        <div key={idx} className="bg-blue-50 border border-blue-100 rounded-lg p-4 flex items-start gap-3 my-4">
                                            <div className="bg-blue-100 p-2 rounded-full">
                                                <span className="text-xl">🌤️</span>
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-blue-900 text-sm uppercase tracking-wide mb-1">Weather Insight</h4>
                                                <p className="text-blue-800 text-sm font-medium leading-relaxed">
                                                    {cleanText}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                }

                                // Standard Text: render **bold** correctly
                                return (
                                    <p key={idx}>
                                        {part.split(/(\*\*.*?\*\*)/g).map((subPart, subIdx) => {
                                            if (subPart.startsWith('**') && subPart.endsWith('**')) {
                                                return <strong key={subIdx} className="text-gray-900">{subPart.slice(2, -2)}</strong>;
                                            }
                                            return <span key={subIdx}>{subPart}</span>;
                                        })}
                                    </p>
                                );
                            });
                        })()}
                    </div>
                </div>

                <div className="p-6 bg-gray-50">
                    {/* Audio Player */}
                    {/* Audio Player */}
                    {/* Audio Player */}
                    <TextToSpeech
                        textEn={missionData.audioText || `${missionData.title}. ${missionData.description}. ${missionData.steps
                            ? 'Steps to complete: ' + missionData.steps.map(s => typeof s === 'string' ? s : s.text).join('. ')
                            : ''
                            }`}
                        textHi={missionData.audioTextHindi}
                        layout="card"
                    />

                    {/* Why Section */}
                    {missionData.why && (
                        <div className="mb-6">
                            <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                                <span className="text-xl">💡</span> Why this mission?
                            </h3>
                            <p className="text-gray-700 text-sm bg-blue-50 p-3 rounded-lg border border-blue-100">
                                {missionData.why}
                            </p>
                        </div>
                    )}

                    <h3 className="font-semibold text-gray-900 mb-4">Steps to Complete</h3>
                    <div className="space-y-3">
                        {missionData.steps?.map((step, index) => {
                            // Handle both old format (string) and new format (object)
                            const stepText = typeof step === 'string' ? step : step.text;
                            const needsVisual = typeof step === 'object' && step.needsVisual;
                            const videoQuery = typeof step === 'object' ? step.videoQuery : null;
                            const imageQuery = typeof step === 'object' ? step.imageQuery : null;

                            return (
                                <div key={index} className="bg-white p-4 rounded-lg border border-gray-100">
                                    <div className="flex gap-3 mb-3">
                                        <div className="w-6 h-6 rounded-full bg-eco-100 text-eco-700 flex items-center justify-center text-sm font-bold flex-shrink-0">
                                            {index + 1}
                                        </div>
                                        <p className="text-gray-700 text-sm flex-1">{stepText}</p>
                                    </div>

                                    {/* Video Search Button */}
                                    {videoQuery && (
                                        <div className="mt-3 bg-eco-50 border border-eco-200 rounded-lg p-3">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xl">📹</span>
                                                    <span className="text-sm font-semibold text-gray-800">Video Tutorial Available</span>
                                                </div>
                                                <a
                                                    href={`https://www.youtube.com/results?search_query=${encodeURIComponent(videoQuery)}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="px-4 py-2 bg-eco-600 text-white rounded-lg text-sm font-medium hover:bg-eco-700 transition-colors flex items-center gap-2"
                                                >
                                                    <span>Watch Video</span>
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                                    </svg>
                                                </a>
                                            </div>
                                        </div>
                                    )}

                                    {/* Image Search Button */}
                                    {imageQuery && !videoQuery && (
                                        <div className="mt-3 bg-eco-50 border border-eco-200 rounded-lg p-3">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xl">🖼️</span>
                                                    <span className="text-sm font-semibold text-gray-800">Reference Images Available</span>
                                                </div>
                                                <a
                                                    href={`https://www.google.com/search?tbm=isch&q=${encodeURIComponent(imageQuery)}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="px-4 py-2 bg-eco-600 text-white rounded-lg text-sm font-medium hover:bg-eco-700 transition-colors flex items-center gap-2"
                                                >
                                                    <span>View Images</span>
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                                    </svg>
                                                </a>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {renderActionSection()}
            </div>
        </div>
    );
};

export default MissionDetail;
