import React, { useState, useEffect } from 'react';
import { Sprout, ChevronRight, Plus, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const CropSelector = ({ onCropSelect, selectedCrop, loading }) => {
    const [crops, setCrops] = useState([]);
    const [fetchingCrops, setFetchingCrops] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        fetchCrops();
    }, []);

    const fetchCrops = async () => {
        try {
            const response = await api.get('/user/crops');
            const fetchedCrops = response.data.crops || [];
            setCrops(fetchedCrops);
        } catch (error) {
            console.error('Error fetching crops:', error);
            setCrops([]);
        } finally {
            setFetchingCrops(false);
        }
    };

    if (fetchingCrops) {
        return (
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <div className="flex justify-center items-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-eco-600" />
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="mb-4">
                <h3 className="font-semibold text-lg text-gray-800">Select Crop for Mission</h3>
                <p className="text-sm text-gray-600">Choose which crop you want to generate a task for</p>
            </div>

            {crops.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                    <Sprout className="w-16 h-16 mx-auto mb-3 text-gray-300" />
                    <p className="font-medium">No crops found</p>
                    <p className="text-sm mt-1">Add crops to your profile to get started</p>
                    <button
                        onClick={() => navigate('/dashboard/profile')}
                        className="mt-4 flex items-center gap-2 mx-auto px-4 py-2 bg-eco-600 text-white rounded-lg hover:bg-eco-700 transition"
                    >
                        <Plus className="w-4 h-4" />
                        Add Crop
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {crops.map((crop, idx) => (
                        <button
                            key={idx}
                            onClick={() => onCropSelect(crop.cropName)}
                            disabled={loading}
                            className={`flex items-center justify-between p-4 border-2 rounded-lg transition disabled:opacity-50 ${selectedCrop === crop.cropName
                                ? 'border-eco-500 bg-eco-50'
                                : 'border-gray-200 hover:border-eco-300 hover:bg-gray-50'
                                }`}
                        >
                            <div className="text-left">
                                <div className="flex items-center gap-2">
                                    <Sprout className={`w-5 h-5 ${selectedCrop === crop.cropName ? 'text-eco-600' : 'text-gray-400'}`} />
                                    <p className="font-semibold text-gray-800">{crop.cropName}</p>
                                </div>
                                <p className="text-sm text-gray-600 mt-1">{crop.stage}</p>
                                <p className="text-xs text-gray-500 mt-0.5">{crop.landSize} hectares</p>
                            </div>
                            {selectedCrop === crop.cropName && (
                                <div className="w-6 h-6 rounded-full bg-eco-600 flex items-center justify-center">
                                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                </div>
                            )}
                            {!selectedCrop && (
                                <ChevronRight className="w-5 h-5 text-gray-400" />
                            )}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

export default CropSelector;
