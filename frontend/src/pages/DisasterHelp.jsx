import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { ArrowLeft, AlertTriangle, Loader2, MapPin, Camera } from 'lucide-react';
import PhotoUpload from '../components/PhotoUpload';

const DisasterHelp = () => {
    const navigate = useNavigate();
    const [type, setType] = useState('Flood');
    const [details, setDetails] = useState('');
    const [photo, setPhoto] = useState(null);
    const [gps, setGps] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [locationLoading, setLocationLoading] = useState(false);

    const handleGetLocation = () => {
        setLocationLoading(true);
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setGps({
                        lat: position.coords.latitude,
                        lon: position.coords.longitude
                    });
                    setLocationLoading(false);
                },
                (error) => {
                    console.error("Error getting location:", error);
                    alert("Could not fetch location. Please ensure GPS is enabled.");
                    setLocationLoading(false);
                }
            );
        } else {
            alert("Geolocation is not supported by this browser.");
            setLocationLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!details.trim()) {
            alert('Please provide details about the situation');
            return;
        }

        setSubmitting(true);
        try {
            const requestData = {
                type,
                details,
                photo: photo ? 'mock-photo-url' : null,
                gps: gps ? `${gps.lat},${gps.lon}` : null
            };

            await api.post('/disaster', requestData);
            alert('Emergency request sent! Institutes in your area have been notified.');
            navigate('/dashboard');
        } catch (error) {
            console.error('Error sending request:', error);
            alert('Failed to send request. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="max-w-xl mx-auto px-4 py-6">
            <button
                onClick={() => navigate('/dashboard')}
                className="flex items-center gap-2 text-gray-500 hover:text-red-600 mb-6"
            >
                <ArrowLeft className="w-4 h-4" /> Back to Dashboard
            </button>

            <div className="bg-white rounded-xl shadow-sm border border-red-100 overflow-hidden">
                <div className="p-6 border-b border-red-100 bg-red-50">
                    <h1 className="text-xl font-bold text-red-700 flex items-center gap-2">
                        <AlertTriangle className="w-6 h-6" />
                        Emergency Help Request
                    </h1>
                    <p className="text-red-600 text-sm mt-1">
                        Alert local institutes about natural disasters or emergencies.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Emergency Type
                        </label>
                        <select
                            value={type}
                            onChange={(e) => setType(e.target.value)}
                            className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white"
                        >
                            <option value="Flood">Flood</option>
                            <option value="Drought">Drought</option>
                            <option value="Pest Outbreak">Pest Outbreak</option>
                            <option value="Storm Damage">Storm Damage</option>
                            <option value="Heatwave Damage">Heatwave Damage</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Details <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            value={details}
                            onChange={(e) => setDetails(e.target.value)}
                            placeholder="Describe the damage or situation..."
                            className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                            rows="4"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Location (GPS)
                        </label>
                        <button
                            type="button"
                            onClick={handleGetLocation}
                            disabled={locationLoading || gps}
                            className={`w-full py-3 rounded-lg border-2 border-dashed flex items-center justify-center gap-2 transition-colors ${gps
                                    ? 'border-green-500 bg-green-50 text-green-700'
                                    : 'border-gray-300 text-gray-500 hover:border-red-400 hover:text-red-500'
                                }`}
                        >
                            {locationLoading ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : gps ? (
                                <>
                                    <MapPin className="w-5 h-5" />
                                    Location Attached ({gps.lat.toFixed(4)}, {gps.lon.toFixed(4)})
                                </>
                            ) : (
                                <>
                                    <MapPin className="w-5 h-5" />
                                    Attach Current Location
                                </>
                            )}
                        </button>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Photo Evidence (Optional)
                        </label>
                        <PhotoUpload onUpload={setPhoto} />
                    </div>

                    <button
                        type="submit"
                        disabled={submitting}
                        className="w-full py-3 rounded-xl font-bold shadow-lg transition-all transform hover:-translate-y-0.5 bg-red-600 text-white hover:bg-red-700 shadow-red-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
                    >
                        {submitting ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                Sending Alert...
                            </>
                        ) : (
                            <>
                                <AlertTriangle className="w-5 h-5" />
                                Broadcast Alert
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default DisasterHelp;
