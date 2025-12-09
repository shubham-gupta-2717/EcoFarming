import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Award, ExternalLink, CheckCircle, Info, ArrowLeft, Loader2, Youtube } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const Schemes = () => {
    const navigate = useNavigate();
    const { token, loading: authLoading } = useAuth();
    const [schemes, setSchemes] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!authLoading) {
            fetchSchemes();
        }
    }, [authLoading, token]);

    const fetchSchemes = async () => {
        try {
            // Using the recommend endpoint without params returns all schemes
            const response = await api.get('/schemes/recommend');
            const data = response.data;
            if (data.success) {
                setSchemes(data.schemes);
            }
        } catch (error) {
            console.error('Error fetching schemes:', error);
            setSchemes([]);
        } finally {
            setLoading(false);
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
        <div className="space-y-8 pb-10">
            <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 text-gray-600 hover:text-green-600 font-medium transition-colors mb-4"
            >
                <ArrowLeft className="w-5 h-5" />
                Back
            </button>
            <header className="bg-gradient-to-r from-green-50 to-emerald-50 p-8 rounded-3xl border border-green-100">
                <h1 className="text-3xl font-bold text-gray-800 mb-2">Government Schemes 🏛️</h1>
                <p className="text-gray-600 text-lg">Access real-world benefits, financial support, and subsidies designed for you.</p>
            </header>

            {loading ? (
                <div className="flex justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-green-600" />
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-8">
                    {schemes.length === 0 ? (
                        <div className="text-center py-12 bg-white rounded-2xl border border-gray-100">
                            <p className="text-gray-500">No schemes found at the moment.</p>
                        </div>
                    ) : (
                        schemes.map((scheme) => (
                            <div key={scheme.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300">
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
                                        <div className="flex flex-wrap gap-2">
                                            {scheme.youtubeLink && (
                                                <a
                                                    href={scheme.youtubeLink}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-center gap-2 bg-red-600 text-white px-6 py-2.5 rounded-xl font-medium hover:bg-red-700 transition-colors shadow-md hover:shadow-red-200"
                                                >
                                                    <Youtube className="w-5 h-5" />
                                                    Watch Video
                                                </a>
                                            )}
                                            <a
                                                href={scheme.applyLink}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-2 bg-green-600 text-white px-6 py-2.5 rounded-xl font-medium hover:bg-green-700 transition-colors shadow-md hover:shadow-green-200"
                                            >
                                                Apply Now <ExternalLink className="w-4 h-4" />
                                            </a>
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
        </div>
    );
};

export default Schemes;
