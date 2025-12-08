import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Loader2, Save, X, Calendar, Droplets, Sprout } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const ManageCrops = () => {
    const [crops, setCrops] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddForm, setShowAddForm] = useState(false);
    const [editingCrop, setEditingCrop] = useState(null);
    // Fetches pipeline data when crop name changes
    const [pipelineStages, setPipelineStages] = useState([]);

    const [formData, setFormData] = useState({
        cropName: '',
        cropVariety: '',
        sowingDate: '',
        area: '',
        irrigationType: 'Rainfed',
        farmingType: 'Conventional',
        notes: '',
        startingStage: '1'
    });

    useEffect(() => {
        if (formData.cropName) {
            fetchPipeline(formData.cropName);
        }
    }, [formData.cropName]);

    const fetchPipeline = async (crop) => {
        // In real app, we might fetch this from backend. 
        // For now, we can hardcode small lookup or fetch from a new endpoint.
        // Let's assume we fetch from backend or just show generic 1-10 if not found.
        try {
            // We'll implemented a quick endpoint for this or just use a local map for MVP
            // To keep it robust, let's fetch from a new 'pipelines' endpoint or just use hardcoded list here for UI 
            // until backend endpoint is ready. 
            // Ideally: const res = await api.get(`/crops/pipeline/${crop}`);
            // setPipelineStages(res.data);
        } catch (e) {
            console.log("No pipeline found");
        }
    };

    // [UI ADDITION] In the form, after Crop Name

    const renderStartingStage = () => (
        <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Current Status / Starting Point</label>
            <select
                value={formData.startingStage || 1}
                onChange={(e) => setFormData({ ...formData, startingStage: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-eco-500 focus:outline-none"
            >
                <option value="1">Stage 1: Beginning of Season</option>
                <option value="2">Stage 2: Mid-Preparation</option>
                <option value="3">Stage 3: Sowing / Planting</option>
                <option value="4">Stage 4: Early Growth</option>
                <option value="5">Stage 5: Mid Growth</option>
            </select>
            <p className="text-xs text-gray-500 mt-1">Select where you are currently in the lifecycle.</p>
        </div>
    );
    const irrigationTypes = ['Rainfed', 'Canal', 'Tube Well', 'Drip', 'Sprinkler'];
    const farmingTypes = ['Organic', 'Mixed', 'Conventional'];
    const cropNames = ['Wheat', 'Rice', 'Cotton', 'Sugarcane', 'Maize', 'Soybean', 'Mustard', 'Tomato', 'Potato', 'Onion'];

    useEffect(() => {
        fetchCrops();
    }, []);

    const fetchCrops = async () => {
        try {
            const response = await api.get('/user/crops');
            const fetchedCrops = response.data.crops || [];
            setCrops(fetchedCrops);
            updateContextCrops(fetchedCrops);
        } catch (error) {
            console.error('Error fetching crops:', error);
        } finally {
            setLoading(false);
        }
    };

    const { updateUser } = useAuth();

    const updateContextCrops = (newCrops) => {
        const cropString = newCrops.map(c => c.cropName).join(', ');
        updateUser({ crop: cropString });
    };

    const handleAdd = async (e) => {
        e.preventDefault();
        try {
            const response = await api.post('/user/crops', formData);
            const newCrops = response.data.crops;
            setCrops(newCrops);
            updateContextCrops(newCrops);
            resetForm();
            alert('Crop added successfully!');
        } catch (error) {
            alert(error.response?.data?.message || 'Error adding crop');
        }
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        try {
            const response = await api.put(`/user/crops/${editingCrop}`, formData);
            const newCrops = response.data.crops;
            setCrops(newCrops);
            updateContextCrops(newCrops);
            resetForm();
            alert('Crop updated successfully!');
        } catch (error) {
            alert(error.response?.data?.message || 'Error updating crop');
        }
    };

    const handleDelete = async (cropName) => {
        if (!confirm(`Are you sure you want to delete ${cropName}?`)) return;

        try {
            const encodedName = encodeURIComponent(cropName);
            const response = await api.delete(`/user/crops/${encodedName}`);
            const newCrops = response.data.crops;
            setCrops(newCrops);
            updateContextCrops(newCrops);
            alert('Crop deleted successfully!');
        } catch (error) {
            console.error('Delete error:', error);
            alert(error.response?.data?.message || 'Error deleting crop');
        }
    };

    const startEdit = (crop) => {
        setEditingCrop(crop.cropName);
        setFormData({
            cropName: crop.cropName,
            cropVariety: crop.cropVariety || '',
            sowingDate: crop.sowingDate || '',
            area: crop.area || crop.landSize || '',
            irrigationType: crop.irrigationType || 'Rainfed',
            farmingType: crop.farmingType || 'Conventional',
            notes: crop.notes || ''
        });
        setShowAddForm(false);
    };

    const resetForm = () => {
        setEditingCrop(null);
        setFormData({
            cropName: '',
            cropVariety: '',
            sowingDate: '',
            area: '',
            irrigationType: 'Rainfed',
            farmingType: 'Conventional',
            notes: ''
        });
        setShowAddForm(false);
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-eco-600" />
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h3 className="text-lg font-semibold text-gray-800">My Crops</h3>
                    <p className="text-sm text-gray-600">Manage your crop portfolio</p>
                </div>
                <button
                    onClick={() => {
                        if (showAddForm) {
                            resetForm();
                        } else {
                            setEditingCrop(null);
                            setFormData({
                                cropName: '',
                                cropVariety: '',
                                sowingDate: '',
                                area: '',
                                irrigationType: 'Rainfed',
                                farmingType: 'Conventional',
                                notes: ''
                            });
                            setShowAddForm(true);
                        }
                    }}
                    className="flex items-center gap-2 bg-eco-600 text-white px-4 py-2 rounded-lg hover:bg-eco-700 transition"
                >
                    {showAddForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                    {showAddForm ? 'Cancel' : 'Add Crop'}
                </button>
            </div>

            {/* Add/Edit Form */}
            {(showAddForm || editingCrop) && (
                <form onSubmit={editingCrop ? handleUpdate : handleAdd} className="mb-6 bg-eco-50 p-6 rounded-lg border border-eco-100">
                    <h4 className="font-bold text-gray-800 mb-4 text-lg border-b border-eco-200 pb-2">{editingCrop ? 'Edit Crop Details' : 'Add New Crop'}</h4>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Crop Name */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Crop Name</label>
                            {editingCrop ? (
                                <input
                                    type="text"
                                    value={formData.cropName}
                                    disabled
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-500 cursor-not-allowed"
                                />
                            ) : (
                                <div className="relative">
                                    <Sprout className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                                    <input
                                        type="text"
                                        list="cropOptions"
                                        value={formData.cropName}
                                        onChange={(e) => setFormData({ ...formData, cropName: e.target.value })}
                                        placeholder="Select or type crop name"
                                        required
                                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-eco-500 focus:outline-none"
                                    />
                                    <datalist id="cropOptions">
                                        {cropNames.map(name => <option key={name} value={name} />)}
                                    </datalist>
                                </div>
                            )}
                        </div>

                        {/* Starting Stage Selector */}
                        {!editingCrop && renderStartingStage()}

                        {/* Variety */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Variety (Optional)</label>
                            <input
                                type="text"
                                value={formData.cropVariety}
                                onChange={(e) => setFormData({ ...formData, cropVariety: e.target.value })}
                                placeholder="e.g., Sharbati, Basmati"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-eco-500 focus:outline-none"
                            />
                        </div>

                        {/* Sowing Date */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Sowing Date</label>
                            <div className="relative">
                                <Calendar className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                                <input
                                    type="date"
                                    value={formData.sowingDate}
                                    onChange={(e) => setFormData({ ...formData, sowingDate: e.target.value })}
                                    required
                                    max={new Date().toISOString().split('T')[0]}
                                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-eco-500 focus:outline-none"
                                />
                            </div>
                        </div>

                        {/* Area */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Area (Acres/Hectares)</label>
                            <input
                                type="number"
                                step="0.1"
                                min="0.1"
                                value={formData.area}
                                onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                                placeholder="e.g., 2.5"
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-eco-500 focus:outline-none"
                            />
                        </div>

                        {/* Irrigation */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Irrigation Type</label>
                            <div className="relative">
                                <Droplets className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                                <select
                                    value={formData.irrigationType}
                                    onChange={(e) => setFormData({ ...formData, irrigationType: e.target.value })}
                                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-eco-500 focus:outline-none"
                                >
                                    {irrigationTypes.map(type => <option key={type} value={type}>{type}</option>)}
                                </select>
                            </div>
                        </div>

                        {/* Farming Type */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Farming Type</label>
                            <select
                                value={formData.farmingType}
                                onChange={(e) => setFormData({ ...formData, farmingType: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-eco-500 focus:outline-none"
                            >
                                {farmingTypes.map(type => <option key={type} value={type}>{type}</option>)}
                            </select>
                        </div>
                    </div>

                    {/* Notes */}
                    <div className="mt-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Notes (Optional)</label>
                        <textarea
                            value={formData.notes}
                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                            placeholder="Any specific observations? e.g. 'Nursery done', 'Planning to harvest soon'"
                            rows="2"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-eco-500 focus:outline-none"
                        ></textarea>
                    </div>

                    <div className="flex gap-3 mt-6">
                        <button
                            type="submit"
                            className="flex-1 flex justify-center items-center gap-2 bg-eco-600 text-white px-4 py-2.5 rounded-lg hover:bg-eco-700 transition font-medium shadow-sm"
                        >
                            <Save className="w-4 h-4" />
                            {editingCrop ? 'Update Details' : 'Save Crop'}
                        </button>
                        <button
                            type="button"
                            onClick={resetForm}
                            className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition text-gray-700 font-medium"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            )}

            {/* Crops List */}
            {crops.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                    <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Sprout className="w-8 h-8 text-gray-400" />
                    </div>
                    <p>No crops added yet.</p>
                    <p className="text-sm">Click "Add Crop" to get AI-powered missions!</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {crops.map((crop, idx) => (
                        <div
                            key={idx}
                            className="flex flex-col md:flex-row md:items-center justify-between p-5 border border-gray-200 rounded-xl hover:border-eco-300 transition bg-white shadow-sm hover:shadow-md group"
                        >
                            <div className="flex items-start gap-4">
                                <div className="p-3 bg-eco-50 rounded-lg text-eco-600 mt-1">
                                    <Sprout className="w-6 h-6" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-gray-800 text-lg">{crop.cropName}</h4>
                                    <p className="text-sm text-gray-500 mb-1">
                                        Sown on: <span className="font-medium text-gray-700">{crop.sowingDate}</span>
                                        {crop.cropVariety && <span> • {crop.cropVariety}</span>}
                                    </p>
                                    <div className="flex flex-wrap gap-2 mt-2">
                                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded border border-gray-200">
                                            {crop.area || crop.landSize} Acres
                                        </span>
                                        <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded border border-blue-100">
                                            {crop.irrigationType}
                                        </span>
                                        <span className="text-xs bg-green-50 text-green-600 px-2 py-0.5 rounded border border-green-100">
                                            {crop.farmingType}
                                        </span>
                                    </div>
                                    <div className="mt-2 text-xs text-eco-700 font-medium italic">
                                        Stage will be detected by AI
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-2 mt-4 md:mt-0 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                    onClick={() => startEdit(crop)}
                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                                    title="Edit details"
                                >
                                    <Edit2 className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => handleDelete(crop.cropName)}
                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                                    title="Delete crop"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ManageCrops;
