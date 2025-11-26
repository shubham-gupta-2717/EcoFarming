import React, { useState, useEffect } from 'react';
import { Sprout, Upload, Camera, MapPin, Plus, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';

const QuizSetup = ({ onStart }) => {
    const { user } = useAuth();
    const { language } = useLanguage();
    const navigate = useNavigate();
    const [crop, setCrop] = useState('');
    const [soilType, setSoilType] = useState('');
    const [image, setImage] = useState(null);
    const [userCrops, setUserCrops] = useState([]);
    const [loadingCrops, setLoadingCrops] = useState(true);

    const soilTypes = [
        'Loamy Soil',
        'Clay Soil',
        'Sandy Soil',
        'Silt Soil',
        'Peat Soil',
        'Chalky Soil',
        'Black Soil',
        'Red Soil'
    ];

    useEffect(() => {
        const fetchCrops = async () => {
            try {
                const response = await api.get('/user/crops');
                const crops = response.data.crops || [];
                setUserCrops(crops);
                if (crops.length > 0) {
                    setCrop(crops[0].cropName); // Default to first crop
                }
            } catch (error) {
                console.error('Error fetching crops:', error);
            } finally {
                setLoadingCrops(false);
            }
        };

        fetchCrops();
    }, []);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!crop || !soilType) {
            alert('Please select crop and soil type');
            return;
        }

        // Pass location from user profile or default
        const location = user?.location || 'India';

        // Find selected crop stage
        const selectedCropObj = userCrops.find(c => c.cropName === crop);
        const stage = selectedCropObj ? selectedCropObj.stage : 'General';

        onStart({ crop, soilType, location, stage, language });
    };

    return (
        <div className="max-w-3xl mx-auto pt-8">
            <form onSubmit={handleSubmit} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Crop Selection */}
                    <div className="space-y-2">
                        <label className="block text-sm font-bold text-gray-800 tracking-wide">Select Crop</label>
                        {loadingCrops ? (
                            <div className="animate-pulse h-14 bg-gray-100 rounded-2xl"></div>
                        ) : userCrops.length > 0 ? (
                            <div className="relative group">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-eco-50 rounded-xl flex items-center justify-center text-eco-600 transition-colors group-hover:bg-eco-100 pointer-events-none z-10">
                                    <Sprout className="w-5 h-5" />
                                </div>
                                <select
                                    value={crop}
                                    onChange={(e) => setCrop(e.target.value)}
                                    className="w-full pl-16 pr-10 py-4 bg-white border-2 border-gray-100 rounded-2xl text-gray-700 font-medium focus:border-eco-500 focus:ring-4 focus:ring-eco-500/10 outline-none transition-all duration-200 appearance-none cursor-pointer hover:border-eco-200"
                                    required
                                >
                                    <option value="" disabled>Choose your crop...</option>
                                    {userCrops.map((c, idx) => (
                                        <option key={idx} value={c.cropName}>
                                            {c.cropName} ({c.stage})
                                        </option>
                                    ))}
                                </select>
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                </div>
                            </div>
                        ) : (
                            <div
                                onClick={() => navigate('/dashboard/profile')}
                                className="flex items-center justify-center gap-3 p-4 border-2 border-dashed border-gray-200 rounded-2xl bg-gray-50/50 hover:bg-eco-50 hover:border-eco-300 transition-all cursor-pointer group"
                            >
                                <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                                    <Plus className="w-4 h-4 text-eco-600" />
                                </div>
                                <span className="text-sm font-bold text-gray-500 group-hover:text-eco-700">Add your first crop</span>
                            </div>
                        )}
                    </div>

                    {/* Soil Selection */}
                    <div className="space-y-2">
                        <label className="block text-sm font-bold text-gray-800 tracking-wide">Soil Type</label>
                        <div className="relative group">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center text-amber-600 transition-colors group-hover:bg-amber-100 pointer-events-none z-10">
                                <span className="text-lg">🌱</span>
                            </div>
                            <select
                                value={soilType}
                                onChange={(e) => setSoilType(e.target.value)}
                                className="w-full pl-16 pr-10 py-4 bg-white border-2 border-gray-100 rounded-2xl text-gray-700 font-medium focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 outline-none transition-all duration-200 appearance-none cursor-pointer hover:border-amber-200"
                                required
                            >
                                <option value="" disabled>Select soil type...</option>
                                {soilTypes.map((type) => (
                                    <option key={type} value={type}>{type}</option>
                                ))}
                            </select>
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Location Display */}
                <div className="space-y-2">
                    <label className="block text-sm font-bold text-gray-800 tracking-wide">Location Context</label>
                    <div className="relative">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-500 pointer-events-none">
                            <MapPin className="w-5 h-5" />
                        </div>
                        <input
                            type="text"
                            value={user?.location || 'Detecting...'}
                            readOnly
                            className="w-full pl-16 pr-4 py-4 bg-white border-2 border-gray-200 rounded-2xl text-gray-700 font-medium outline-none cursor-default"
                        />
                        <div className="absolute right-4 top-1/2 -translate-y-1/2">
                            <span className="text-xs font-bold text-blue-600 bg-blue-100 px-2 py-1 rounded-md">Auto-detected</span>
                        </div>
                    </div>
                </div>

                {/* Image Upload */}
                <div className="space-y-2">
                    <label className="block text-sm font-bold text-gray-800 tracking-wide">
                        Soil Photo/Video <span className="text-gray-400 font-normal ml-1">(Optional)</span>
                    </label>

                    {image ? (
                        <div className="flex items-center justify-between p-3 pl-4 border-2 border-eco-100 bg-eco-50/30 rounded-2xl group hover:border-eco-200 transition-all">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-eco-600 shadow-sm ring-1 ring-black/5">
                                    <Camera className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-gray-800 truncate max-w-[200px]">{image.name}</p>
                                    <p className="text-xs text-eco-600 font-medium">Ready to analyze</p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setImage(null)}
                                className="p-2 mr-1 hover:bg-white text-gray-400 hover:text-red-500 rounded-xl transition-all hover:shadow-sm"
                                title="Remove image"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                    ) : (
                        <div className="relative overflow-hidden border-2 border-dashed border-gray-200 rounded-2xl p-8 text-center bg-white hover:bg-gray-50 hover:border-eco-300 transition-all duration-300 cursor-pointer group">
                            <input
                                type="file"
                                accept="image/*,video/*"
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                                onChange={(e) => {
                                    const file = e.target.files[0];
                                    if (file) setImage(file);
                                }}
                            />

                            <div className="relative z-10 flex flex-col items-center gap-3">
                                <div className="flex items-center gap-4 mb-2">
                                    <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform duration-300">
                                        <Camera className="w-6 h-6" />
                                    </div>
                                    <div className="w-12 h-12 rounded-2xl bg-purple-50 flex items-center justify-center text-purple-500 group-hover:scale-110 transition-transform duration-300 delay-75">
                                        <Upload className="w-6 h-6" />
                                    </div>
                                </div>
                                <p className="text-sm font-bold text-gray-600 group-hover:text-gray-800 transition-colors">
                                    Drop a photo or video here
                                </p>
                                <p className="text-xs text-gray-400">
                                    AI will analyze soil texture & health
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                <div className="pt-4">
                    <button
                        type="submit"
                        disabled={userCrops.length === 0}
                        className={`w-full relative overflow-hidden font-bold text-lg py-4 rounded-2xl transition-all duration-300 transform ${userCrops.length === 0
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : 'bg-gradient-to-r from-eco-600 to-eco-500 text-white shadow-lg hover:shadow-xl hover:shadow-eco-500/20 hover:-translate-y-0.5 active:translate-y-0'
                            }`}
                    >
                        <span className="relative z-10 flex items-center justify-center gap-2">
                            Start Learning Quiz
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6"></path></svg>
                        </span>
                    </button>
                </div>
            </form>
        </div>
    );
};

export default QuizSetup;
