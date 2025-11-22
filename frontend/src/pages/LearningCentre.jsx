import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { BookOpen, Award, TrendingUp, Cloud, AlertCircle, ChevronRight, Loader2 } from 'lucide-react';

const LearningCentre = () => {
    const [categories, setCategories] = useState([]);
    const [recommendations, setRecommendations] = useState([]);
    const [weather, setWeather] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [categoriesRes, recommendationsRes] = await Promise.all([
                api.get('/learning/categories'),
                api.get('/learning/recommendations')
            ]);

            setCategories(categoriesRes.data.categories);
            setRecommendations(recommendationsRes.data.recommendations);
            setWeather(recommendationsRes.data.weather);
        } catch (error) {
            console.error('Error fetching learning data:', error);
        } finally {
            setLoading(false);
        }
    };

    const getUrgencyColor = (urgency) => {
        switch (urgency) {
            case 'critical': return 'bg-red-100 border-red-300 text-red-800';
            case 'high': return 'bg-orange-100 border-orange-300 text-orange-800';
            case 'medium': return 'bg-yellow-100 border-yellow-300 text-yellow-800';
            default: return 'bg-blue-100 border-blue-300 text-blue-800';
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
            <header>
                <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
                    <BookOpen className="w-8 h-8 text-eco-600" />
                    Learning Centre
                </h1>
                <p className="text-gray-600 mt-1">
                    Master sustainable farming through interactive lessons and quizzes
                </p>
            </header>

            {/* Weather-Based Recommendations */}
            {recommendations.length > 0 && (
                <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border-2 border-blue-200 rounded-xl p-5">
                    <div className="flex items-start gap-3 mb-4">
                        <Cloud className="w-6 h-6 text-blue-600 mt-1" />
                        <div>
                            <h2 className="text-lg font-bold text-gray-900">Weather-Based Recommendations</h2>
                            {weather && (
                                <p className="text-sm text-gray-600">
                                    Current: {weather.temp}°C, {weather.humidity}% humidity, {weather.weather}
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="space-y-3">
                        {recommendations.map((rec, index) => (
                            <div
                                key={index}
                                className={`${getUrgencyColor(rec.urgency)} border-2 rounded-lg p-4 cursor-pointer hover:shadow-md transition`}
                                onClick={() => navigate(`/learning/${rec.category.toLowerCase().replace(/\s+/g, '-')}`)}
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <AlertCircle className="w-5 h-5" />
                                            <h3 className="font-bold">{rec.moduleTitle}</h3>
                                        </div>
                                        <p className="text-sm opacity-90">{rec.reason}</p>
                                        <p className="text-xs mt-1 opacity-75">Category: {rec.category}</p>
                                    </div>
                                    <ChevronRight className="w-5 h-5 ml-2" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
                <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
                    <div className="flex items-center gap-2">
                        <BookOpen className="w-5 h-5 text-eco-600" />
                        <div>
                            <p className="text-2xl font-bold text-gray-800">
                                {categories.reduce((sum, cat) => sum + cat.moduleCount, 0)}
                            </p>
                            <p className="text-sm text-gray-600">Total Modules</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
                    <div className="flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-blue-600" />
                        <div>
                            <p className="text-2xl font-bold text-gray-800">0</p>
                            <p className="text-sm text-gray-600">Completed</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
                    <div className="flex items-center gap-2">
                        <Award className="w-5 h-5 text-yellow-600" />
                        <div>
                            <p className="text-2xl font-bold text-gray-800">0</p>
                            <p className="text-sm text-gray-600">Badges Earned</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Categories Grid */}
            <div>
                <h2 className="text-xl font-bold text-gray-800 mb-4">Browse Categories</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {categories.map((category) => (
                        <div
                            key={category.id}
                            onClick={() => navigate(`/learning/${category.id}`)}
                            className="bg-white rounded-xl p-5 shadow-md border-2 border-transparent hover:border-eco-500 hover:shadow-lg transition cursor-pointer group"
                        >
                            <div className="text-4xl mb-3">{category.icon}</div>
                            <h3 className="font-bold text-gray-800 mb-1 group-hover:text-eco-600 transition">
                                {category.name}
                            </h3>
                            <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                                {category.description}
                            </p>
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-eco-600">
                                    {category.moduleCount} modules
                                </span>
                                <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-eco-600 transition" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Call to Action */}
            {categories.reduce((sum, cat) => sum + cat.moduleCount, 0) === 0 && (
                <div className="bg-yellow-50 border-2 border-yellow-300 rounded-xl p-6 text-center">
                    <h3 className="font-bold text-yellow-900 mb-2">No Modules Yet</h3>
                    <p className="text-yellow-800 mb-4">
                        Learning modules will be generated automatically. Check back soon!
                    </p>
                    <button
                        onClick={() => navigate('/admin')}
                        className="bg-yellow-600 text-white px-6 py-2 rounded-lg hover:bg-yellow-700 transition"
                    >
                        Go to Admin to Generate Modules
                    </button>
                </div>
            )}
        </div>
    );
};

export default LearningCentre;
