import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Award, ExternalLink, Loader2 } from 'lucide-react';

const Schemes = () => {
    const [schemes, setSchemes] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchSchemes();
    }, []);

    const fetchSchemes = async () => {
        try {
            const response = await api.get('/schemes/recommend?crop=wheat&location=Punjab');
            setSchemes(response.data.schemes);
        } catch (error) {
            console.error("Failed to fetch schemes", error);
        } finally {
            setLoading(false);
        }
    };

    const getCategoryColor = (category) => {
        const colors = {
            'Insurance': 'bg-blue-100 text-blue-700',
            'Income Support': 'bg-green-100 text-green-700',
            'Soil Health': 'bg-yellow-100 text-yellow-700',
            'Organic Farming': 'bg-eco-100 text-eco-700',
            'Credit': 'bg-purple-100 text-purple-700'
        };
        return colors[category] || 'bg-gray-100 text-gray-700';
    };

    return (
        <div className="space-y-6">
            <header>
                <h1 className="text-2xl font-bold text-gray-800">Government Schemes 🏛️</h1>
                <p className="text-gray-600">Financial support and benefits for farmers</p>
            </header>

            {loading ? (
                <div className="flex justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-eco-600" />
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {schemes.map((scheme) => (
                        <div key={scheme.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition">
                            <div className="flex justify-between items-start mb-3">
                                <div className="flex items-center gap-2">
                                    <Award className="w-5 h-5 text-eco-600" />
                                    <h3 className="font-bold text-gray-800">{scheme.name}</h3>
                                </div>
                                <span className={`text-xs px-2 py-1 rounded ${getCategoryColor(scheme.category)}`}>
                                    {scheme.category}
                                </span>
                            </div>

                            <p className="text-sm text-gray-600 mb-3">{scheme.description}</p>

                            <div className="space-y-2 mb-4">
                                <div>
                                    <p className="text-xs font-semibold text-gray-500">Eligibility:</p>
                                    <p className="text-sm text-gray-700">{scheme.eligibility}</p>
                                </div>
                                <div>
                                    <p className="text-xs font-semibold text-gray-500">Benefits:</p>
                                    <p className="text-sm text-gray-700">{scheme.benefits}</p>
                                </div>
                            </div>

                            <a
                                href={scheme.applyLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 text-eco-600 hover:text-eco-700 font-semibold text-sm"
                            >
                                Apply Now <ExternalLink className="w-4 h-4" />
                            </a>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Schemes;
