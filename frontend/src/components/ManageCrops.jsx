import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Loader2, Save, X } from 'lucide-react';
import api from '../services/api';

const ManageCrops = () => {
    const [crops, setCrops] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddForm, setShowAddForm] = useState(false);
    const [editingCrop, setEditingCrop] = useState(null);
    const [formData, setFormData] = useState({
        cropName: '',
        stage: '',
        landSize: ''
    });

    const stages = ['Seedling', 'Vegetative', 'Flowering', 'Fruiting', 'Harvesting', 'Early Growth', 'Growing'];

    useEffect(() => {
        fetchCrops();
    }, []);

    const fetchCrops = async () => {
        try {
            const response = await api.get('/user/crops');
            setCrops(response.data.crops || []);
        } catch (error) {
            console.error('Error fetching crops:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAdd = async (e) => {
        e.preventDefault();
        try {
            const response = await api.post('/user/crops', formData);
            setCrops(response.data.crops);
            setFormData({ cropName: '', stage: '', landSize: '' });
            setShowAddForm(false);
            alert('Crop added successfully!');
        } catch (error) {
            alert(error.response?.data?.message || 'Error adding crop');
        }
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        try {
            const response = await api.put(`/user/crops/${editingCrop}`, formData);
            setCrops(response.data.crops);
            setFormData({ cropName: '', stage: '', landSize: '' });
            setEditingCrop(null);
            alert('Crop updated successfully!');
        } catch (error) {
            alert(error.response?.data?.message || 'Error updating crop');
        }
    };

    const handleDelete = async (cropName) => {
        if (!confirm(`Are you sure you want to delete ${cropName}?`)) return;

        try {
            const response = await api.delete(`/user/crops/${cropName}`);
            setCrops(response.data.crops);
            alert('Crop deleted successfully!');
        } catch (error) {
            alert(error.response?.data?.message || 'Error deleting crop');
        }
    };

    const startEdit = (crop) => {
        setEditingCrop(crop.cropName);
        setFormData({
            cropName: crop.cropName,
            stage: crop.stage,
            landSize: crop.landSize.toString()
        });
        setShowAddForm(false);
    };

    const cancelEdit = () => {
        setEditingCrop(null);
        setFormData({ cropName: '', stage: '', landSize: '' });
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
                        setShowAddForm(!showAddForm);
                        setEditingCrop(null);
                        setFormData({ cropName: '', stage: '', landSize: '' });
                    }}
                    className="flex items-center gap-2 bg-eco-600 text-white px-4 py-2 rounded-lg hover:bg-eco-700 transition"
                >
                    {showAddForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                    {showAddForm ? 'Cancel' : 'Add Crop'}
                </button>
            </div>

            {/* Add/Edit Form */}
            {(showAddForm || editingCrop) && (
                <form onSubmit={editingCrop ? handleUpdate : handleAdd} className="mb-6 bg-eco-50 p-4 rounded-lg border border-eco-100">
                    <h4 className="font-medium text-gray-800 mb-4">{editingCrop ? 'Edit Crop' : 'Add New Crop'}</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Crop Name</label>
                            <input
                                type="text"
                                value={formData.cropName}
                                onChange={(e) => setFormData({ ...formData, cropName: e.target.value })}
                                placeholder="e.g., Tomato"
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-eco-500 focus:outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Growth Stage</label>
                            <select
                                value={formData.stage}
                                onChange={(e) => setFormData({ ...formData, stage: e.target.value })}
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-eco-500 focus:outline-none"
                            >
                                <option value="">Select stage</option>
                                {stages.map(stage => (
                                    <option key={stage} value={stage}>{stage}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Land Size (hectares)</label>
                            <input
                                type="number"
                                step="0.1"
                                min="0.1"
                                value={formData.landSize}
                                onChange={(e) => setFormData({ ...formData, landSize: e.target.value })}
                                placeholder="e.g., 0.5"
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-eco-500 focus:outline-none"
                            />
                        </div>
                    </div>
                    <div className="flex gap-2 mt-4">
                        <button
                            type="submit"
                            className="flex items-center gap-2 bg-eco-600 text-white px-4 py-2 rounded-lg hover:bg-eco-700 transition"
                        >
                            <Save className="w-4 h-4" />
                            {editingCrop ? 'Update' : 'Add'} Crop
                        </button>
                        {editingCrop && (
                            <button
                                type="button"
                                onClick={cancelEdit}
                                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                            >
                                Cancel
                            </button>
                        )}
                    </div>
                </form>
            )}

            {/* Crops List */}
            {crops.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                    <p>No crops added yet. Click "Add Crop" to get started!</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {crops.map((crop, idx) => (
                        <div
                            key={idx}
                            className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-eco-300 transition"
                        >
                            <div>
                                <h4 className="font-semibold text-gray-800">{crop.cropName}</h4>
                                <p className="text-sm text-gray-600">{crop.stage} • {crop.landSize} hectares</p>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => startEdit(crop)}
                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                                    title="Edit crop"
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
