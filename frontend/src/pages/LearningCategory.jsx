import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { ArrowLeft, BookOpen, Clock, BarChart3, ChevronRight, Loader2, CheckCircle } from 'lucide-react';

const LearningCategory = () => {
    const { categoryId } = useParams();
    const [modules, setModules] = useState([]);
    const [categoryName, setCategoryName] = useState('');
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    // Map URL slugs to actual category names
    const categoryMap = {
        'soil-health': 'Soil Health & Fertility',
        'water-management': 'Water & Irrigation Management',
        'pest-control': 'Pest & Disease Management',
        'organic-farming': 'Organic & Natural Farming',
        'crop-guides': 'Crop-Specific Guides',
        'weather-tips': 'Weather-Based Tips',
        'success-stories': 'Farmer Success Stories'
    };

    useEffect(() => {
        fetchModules();
    }, [categoryId]);

    const fetchModules = async () => {
        try {
            setLoading(true);
            // Use mapped category name or format the categoryId
            const actualCategoryName = categoryMap[categoryId] || categoryId.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
            setCategoryName(actualCategoryName);

            console.log('Fetching modules for category:', actualCategoryName);
            const response = await api.get(`/learning/modules/${encodeURIComponent(actualCategoryName)}`);
            console.log('Modules received:', response.data.modules);
            setModules(response.data.modules);
        } catch (error) {
            console.error('Error fetching modules:', error);
        } finally {
            setLoading(false);
        }
    };

    const getDifficultyColor = (difficulty) => {
        switch (difficulty) {
            case 'beginner': return 'bg-green-100 text-green-700';
            case 'intermediate': return 'bg-yellow-100 text-yellow-700';
            case 'advanced': return 'bg-red-100 text-red-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="w-8 h-8 animate-spin text-eco-600" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <button
                    onClick={() => navigate('/dashboard/learning')}
                    className="flex items-center gap-2 text-eco-600 hover:text-eco-700 mb-4"
                >
                    <ArrowLeft className="w-5 h-5" />
                    Back to Learning Centre
                </button>

                <h1 className="text-3xl font-bold text-gray-800">{categoryName}</h1>
                <p className="text-gray-600 mt-1">{modules.length} learning modules available</p>
            </div>

            {/* Modules Grid */}
            {modules.length > 0 ? (
                <div className="grid gap-4">
                    {modules.map((module) => (
                        <div
                            key={module.moduleId}
                            onClick={() => navigate(`/dashboard/learning/module/${module.moduleId}`)}
                            className="bg-white rounded-xl shadow-md border-2 border-transparent hover:border-eco-500 hover:shadow-lg transition cursor-pointer p-6"
                        >
                            <div className="flex gap-4">
                                {/* Image */}
                                {module.media?.image && (
                                    <img
                                        src={module.media.image}
                                        alt={module.title}
                                        className="w-32 h-32 object-cover rounded-lg flex-shrink-0"
                                    />
                                )}

                                {/* Content */}
                                <div className="flex-1">
                                    <div className="flex items-start justify-between mb-2">
                                        <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                                            {module.title}
                                            {module.progress?.status === 'completed' && (
                                                <CheckCircle className="w-5 h-5 text-green-600" title="Completed" />
                                            )}
                                        </h3>
                                        <ChevronRight className="w-6 h-6 text-gray-400" />
                                    </div>

                                    <p className="text-gray-600 mb-3 line-clamp-2">
                                        {module.shortDescription}
                                    </p>

                                    <div className="flex items-center gap-4 text-sm">
                                        <span className={`px-3 py-1 rounded-full font-medium ${getDifficultyColor(module.difficulty)}`}>
                                            {module.difficulty || 'beginner'}
                                        </span>

                                        <span className="flex items-center gap-1 text-gray-600">
                                            <Clock className="w-4 h-4" />
                                            {module.estimatedTime || 2} min
                                        </span>

                                        <span className="flex items-center gap-1 text-gray-600">
                                            <BookOpen className="w-4 h-4" />
                                            {module.quiz?.length || 3} quiz questions
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl p-12 text-center">
                    <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-bold text-gray-600 mb-2">No Modules Yet</h3>
                    <p className="text-gray-500 mb-4">
                        Modules for this category haven't been created yet.
                    </p>
                    <button
                        onClick={() => navigate('/dashboard/learning')}
                        className="text-eco-600 hover:text-eco-700 font-medium"
                    >
                        Browse Other Categories
                    </button>
                </div>
            )}
        </div>
    );
};

export default LearningCategory;
