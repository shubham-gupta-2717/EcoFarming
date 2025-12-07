import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Award, ExternalLink, CheckCircle, Info, ArrowLeft, Plus, Trash2, Loader2, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

const AdminSchemes = () => {
    const navigate = useNavigate();
    const { token, loading: authLoading } = useAuth();
    const [schemes, setSchemes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        category: '',
        description: '',
        eligibility: '',
        benefits: '',
        applyLink: ''
    });
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (!authLoading) {
            fetchSchemes();
        }
    }, [authLoading, token]);

    const fetchSchemes = async () => {
        try {
            const response = await api.get('/schemes/all');
            const data = response.data;
            if (data.success) {
                setSchemes(data.schemes);
            }
        } catch (error) {
            console.error('Error fetching schemes:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this scheme?')) return;

        try {
            const response = await api.delete(`/schemes/${id}`);
            const data = response.data;
            if (data.success) {
                setSchemes(schemes.filter(s => s.id !== id));
            }
        } catch (error) {
            console.error('Error deleting scheme:', error);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            // Process eligibility and benefits into arrays if they are newline separated strings
            const processedData = {
                ...formData,
                eligibility: formData.eligibility.split('\n').filter(item => item.trim() !== ''),
                benefits: formData.benefits.split('\n').filter(item => item.trim() !== '')
            };

            const response = await api.post('/schemes/add', processedData);

            const data = response.data;
            if (data.success) {
                setSchemes([...schemes, data.scheme]);
                setShowAddModal(false);
                setFormData({
                    name: '',
                    category: '',
                    description: '',
                    eligibility: '',
                    benefits: '',
                    applyLink: ''
                });
            }
        } catch (error) {
            console.error('Error adding scheme:', error);
        } finally {
            setSubmitting(false);
        }
    };

    const getCategoryColor = (category) => {
        const colors = {
            'Insurance': 'bg-blue-100 text-blue-700',
            'Income Support': 'bg-green-100 text-green-700',
            'Soil Health': 'bg-yellow-100 text-yellow-700',
            'Organic Farming': 'bg-emerald-100 text-emerald-700',
            'Credit': 'bg-purple-100 text-purple-700',
            'Irrigation': 'bg-cyan-100 text-cyan-700',
            'Marketing': 'bg-orange-100 text-orange-700',
            'Sustainable Agriculture': 'bg-teal-100 text-teal-700',
            'Development': 'bg-indigo-100 text-indigo-700',
            'Dairy': 'bg-pink-100 text-pink-700',
            'Entrepreneurship': 'bg-rose-100 text-rose-700'
        };
        return colors[category] || 'bg-gray-100 text-gray-700';
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6 md:p-8">
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 text-gray-600 hover:text-green-600 font-medium transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        Back to Dashboard
                    </button>
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="flex items-center gap-2 bg-green-600 text-white px-6 py-2.5 rounded-xl font-medium hover:bg-green-700 transition-colors shadow-md"
                    >
                        <Plus className="w-5 h-5" />
                        Add New Scheme
                    </button>
                </div>

                <header className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm mb-8">
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">Manage Government Schemes 🏛️</h1>
                    <p className="text-gray-600 text-lg">Add, view, and remove government schemes visible to farmers.</p>
                </header>

                {loading ? (
                    <div className="flex justify-center py-12">
                        <Loader2 className="w-8 h-8 animate-spin text-green-600" />
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-8">
                        {schemes.length === 0 ? (
                            <div className="text-center py-12 bg-white rounded-2xl border border-gray-100">
                                <p className="text-gray-500">No schemes found. Add one to get started!</p>
                            </div>
                        ) : (
                            schemes.map((scheme) => (
                                <div key={scheme.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300 relative group">
                                    <div className="p-6 md:p-8">
                                        <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-6">
                                            <div className="flex items-start gap-4">
                                                <div className="p-3 bg-green-50 rounded-xl">
                                                    <Award className="w-8 h-8 text-green-600" />
                                                </div>
                                                <div>
                                                    <h3 className="text-xl font-bold text-gray-800 mb-1">{scheme.name}</h3>
                                                    <span className={`inline-block text-xs font-semibold px-3 py-1 rounded-full ${getCategoryColor(scheme.category)}`}>
                                                        {scheme.category}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <a
                                                    href={scheme.applyLink}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-center gap-2 bg-gray-100 text-gray-600 px-4 py-2 rounded-lg font-medium hover:bg-gray-200 transition-colors text-sm"
                                                >
                                                    View Link <ExternalLink className="w-4 h-4" />
                                                </a>
                                                <button
                                                    onClick={() => handleDelete(scheme.id)}
                                                    className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                                                    title="Delete Scheme"
                                                >
                                                    <Trash2 className="w-5 h-5" />
                                                </button>
                                            </div>
                                        </div>

                                        <p className="text-gray-600 mb-8 leading-relaxed">{scheme.description}</p>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            <div className="bg-gray-50 rounded-xl p-6">
                                                <div className="flex items-center gap-2 mb-4">
                                                    <CheckCircle className="w-5 h-5 text-green-600" />
                                                    <h4 className="font-bold text-gray-800">Eligibility Criteria</h4>
                                                </div>
                                                <ul className="space-y-3">
                                                    {Array.isArray(scheme.eligibility) ? scheme.eligibility.map((item, index) => (
                                                        <li key={index} className="flex items-start gap-3 text-sm text-gray-600">
                                                            <span className="w-1.5 h-1.5 bg-green-400 rounded-full mt-1.5 flex-shrink-0"></span>
                                                            {item}
                                                        </li>
                                                    )) : <li className="text-sm text-gray-600">{scheme.eligibility}</li>}
                                                </ul>
                                            </div>

                                            <div className="bg-blue-50/50 rounded-xl p-6">
                                                <div className="flex items-center gap-2 mb-4">
                                                    <Info className="w-5 h-5 text-blue-600" />
                                                    <h4 className="font-bold text-gray-800">Key Benefits</h4>
                                                </div>
                                                <ul className="space-y-3">
                                                    {Array.isArray(scheme.benefits) ? scheme.benefits.map((item, index) => (
                                                        <li key={index} className="flex items-start gap-3 text-sm text-gray-600">
                                                            <span className="w-1.5 h-1.5 bg-blue-400 rounded-full mt-1.5 flex-shrink-0"></span>
                                                            {item}
                                                        </li>
                                                    )) : <li className="text-sm text-gray-600">{scheme.benefits}</li>}
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}

                {/* Add Scheme Modal */}
                {showAddModal && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                            <div className="p-6 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white z-10">
                                <h2 className="text-xl font-bold text-gray-800">Add New Scheme</h2>
                                <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-gray-100 rounded-full">
                                    <X className="w-5 h-5 text-gray-500" />
                                </button>
                            </div>
                            <form onSubmit={handleSubmit} className="p-6 space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Scheme Name</label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                        placeholder="e.g., PM-KISAN"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                                    <select
                                        name="category"
                                        value={formData.category}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                    >
                                        <option value="">Select Category</option>
                                        <option value="Income Support">Income Support</option>
                                        <option value="Insurance">Insurance</option>
                                        <option value="Soil Health">Soil Health</option>
                                        <option value="Organic Farming">Organic Farming</option>
                                        <option value="Credit">Credit</option>
                                        <option value="Irrigation">Irrigation</option>
                                        <option value="Marketing">Marketing</option>
                                        <option value="Sustainable Agriculture">Sustainable Agriculture</option>
                                        <option value="Development">Development</option>
                                        <option value="Dairy">Dairy</option>
                                        <option value="Entrepreneurship">Entrepreneurship</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                    <textarea
                                        name="description"
                                        value={formData.description}
                                        onChange={handleInputChange}
                                        required
                                        rows="3"
                                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                        placeholder="Brief description of the scheme..."
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Eligibility (One per line)</label>
                                    <textarea
                                        name="eligibility"
                                        value={formData.eligibility}
                                        onChange={handleInputChange}
                                        required
                                        rows="3"
                                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                        placeholder="- Requirement 1&#10;- Requirement 2"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Benefits (One per line)</label>
                                    <textarea
                                        name="benefits"
                                        value={formData.benefits}
                                        onChange={handleInputChange}
                                        required
                                        rows="3"
                                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                        placeholder="- Benefit 1&#10;- Benefit 2"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Application Link</label>
                                    <input
                                        type="url"
                                        name="applyLink"
                                        value={formData.applyLink}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                        placeholder="https://..."
                                    />
                                </div>

                                <div className="pt-4 flex justify-end gap-4">
                                    <button
                                        type="button"
                                        onClick={() => setShowAddModal(false)}
                                        className="px-6 py-2 text-gray-600 font-medium hover:bg-gray-100 rounded-lg transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={submitting}
                                        className="px-6 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                    >
                                        {submitting ? (
                                            <>
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                                Adding...
                                            </>
                                        ) : (
                                            'Add Scheme'
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminSchemes;
