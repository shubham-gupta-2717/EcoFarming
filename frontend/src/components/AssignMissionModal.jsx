import { useState } from 'react';
import { X } from 'lucide-react';

const AssignMissionModal = ({ farmers, onClose, onSuccess }) => {
    const [formData, setFormData] = useState({
        farmerIds: [],
        task: '',
        description: '',
        steps: ['', '', ''],
        benefits: '',
        verification: 'Upload proof of completion',
        credits: 20,
        difficulty: 'Medium',
        ecoScoreImpact: 5,
        cropTarget: '',
        behaviorCategory: 'General'
    });

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validate
        if (formData.farmerIds.length === 0) {
            alert('Please select at least one farmer');
            return;
        }
        if (!formData.task) {
            alert('Please enter a mission task');
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:5000/api/institute/missions/assign', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    farmerIds: formData.farmerIds,
                    mission: {
                        task: formData.task,
                        description: formData.description,
                        steps: formData.steps.filter(s => s.trim() !== ''),
                        benefits: formData.benefits,
                        verification: formData.verification,
                        credits: parseInt(formData.credits),
                        difficulty: formData.difficulty,
                        ecoScoreImpact: parseInt(formData.ecoScoreImpact),
                        cropTarget: formData.cropTarget,
                        behaviorCategory: formData.behaviorCategory
                    }
                })
            });

            const data = await response.json();
            if (data.success) {
                alert(`Mission assigned to ${data.assignedCount} farmer(s)`);
                onSuccess();
            } else {
                alert('Failed to assign mission: ' + data.message);
            }
        } catch (error) {
            console.error('Error assigning mission:', error);
            alert('Error assigning mission');
        }
    };

    const handleFarmerToggle = (farmerId) => {
        setFormData(prev => ({
            ...prev,
            farmerIds: prev.farmerIds.includes(farmerId)
                ? prev.farmerIds.filter(id => id !== farmerId)
                : [...prev.farmerIds, farmerId]
        }));
    };

    const handleStepChange = (index, value) => {
        const newSteps = [...formData.steps];
        newSteps[index] = value;
        setFormData({ ...formData, steps: newSteps });
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
                    <h2 className="text-2xl font-bold text-gray-800">Assign Custom Mission</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {/* Farmer Selection */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Select Farmers *
                        </label>
                        <div className="border border-gray-300 rounded-lg p-3 max-h-40 overflow-y-auto">
                            {farmers.map(farmer => (
                                <label key={farmer.id} className="flex items-center gap-2 py-1 hover:bg-gray-50 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={formData.farmerIds.includes(farmer.id)}
                                        onChange={() => handleFarmerToggle(farmer.id)}
                                        className="rounded"
                                    />
                                    <span className="text-sm">{farmer.name} ({farmer.email})</span>
                                </label>
                            ))}
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                            {formData.farmerIds.length} farmer(s) selected
                        </p>
                    </div>

                    {/* Mission Task */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Mission Task *
                        </label>
                        <input
                            type="text"
                            value={formData.task}
                            onChange={(e) => setFormData({ ...formData, task: e.target.value })}
                            placeholder="e.g., Apply organic fertilizer to wheat field"
                            className="w-full border border-gray-300 rounded-lg px-3 py-2"
                            required
                        />
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Description
                        </label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            placeholder="Brief description of the mission"
                            className="w-full border border-gray-300 rounded-lg px-3 py-2"
                            rows="2"
                        />
                    </div>

                    {/* Steps */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Steps to Complete
                        </label>
                        {formData.steps.map((step, index) => (
                            <input
                                key={index}
                                type="text"
                                value={step}
                                onChange={(e) => handleStepChange(index, e.target.value)}
                                placeholder={`Step ${index + 1}`}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 mb-2"
                            />
                        ))}
                    </div>

                    {/* Benefits */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Benefits
                        </label>
                        <textarea
                            value={formData.benefits}
                            onChange={(e) => setFormData({ ...formData, benefits: e.target.value })}
                            placeholder="Why this mission is beneficial"
                            className="w-full border border-gray-300 rounded-lg px-3 py-2"
                            rows="2"
                        />
                    </div>

                    {/* Grid for smaller fields */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Crop Target
                            </label>
                            <input
                                type="text"
                                value={formData.cropTarget}
                                onChange={(e) => setFormData({ ...formData, cropTarget: e.target.value })}
                                placeholder="e.g., Wheat"
                                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Category
                            </label>
                            <select
                                value={formData.behaviorCategory}
                                onChange={(e) => setFormData({ ...formData, behaviorCategory: e.target.value })}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                            >
                                <option value="General">General</option>
                                <option value="Soil Management">Soil Management</option>
                                <option value="Water Conservation">Water Conservation</option>
                                <option value="Pest Management">Pest Management</option>
                                <option value="Organic Farming">Organic Farming</option>
                                <option value="Crop Diversity">Crop Diversity</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Difficulty
                            </label>
                            <select
                                value={formData.difficulty}
                                onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                            >
                                <option value="Easy">Easy</option>
                                <option value="Medium">Medium</option>
                                <option value="Hard">Hard</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Credits
                            </label>
                            <input
                                type="number"
                                value={formData.credits}
                                onChange={(e) => setFormData({ ...formData, credits: e.target.value })}
                                min="1"
                                max="100"
                                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                EcoScore Impact
                            </label>
                            <input
                                type="number"
                                value={formData.ecoScoreImpact}
                                onChange={(e) => setFormData({ ...formData, ecoScoreImpact: e.target.value })}
                                min="1"
                                max="20"
                                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                            />
                        </div>
                    </div>

                    {/* Buttons */}
                    <div className="flex gap-3 pt-4">
                        <button
                            type="submit"
                            className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
                        >
                            Assign Mission
                        </button>
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AssignMissionModal;
