import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Trophy, Medal, MapPin } from 'lucide-react';

const Leaderboard = () => {
    const [leaders, setLeaders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('panchayat');

    useEffect(() => {
        fetchLeaderboard();
    }, [activeTab]);

    const fetchLeaderboard = async () => {
        setLoading(true);
        try {
            const response = await api.get(`/gamification/leaderboard/${activeTab}`);
            setLeaders(response.data.leaderboard);
        } catch (error) {
            console.error("Failed to fetch leaderboard", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <header>
                <h1 className="text-2xl font-bold text-gray-800">Leaderboard 🏆</h1>
                <p className="text-gray-600">See top performing farmers in your area and beyond.</p>
            </header>

            {/* Tabs */}
            <div className="flex space-x-4 border-b border-gray-200">
                <button
                    className={`pb-2 px-4 font-medium transition ${activeTab === 'village' ? 'text-eco-600 border-b-2 border-eco-600' : 'text-gray-500 hover:text-gray-700'}`}
                    onClick={() => setActiveTab('village')}
                >
                    Village
                </button>
                <button
                    className={`pb-2 px-4 font-medium transition ${activeTab === 'panchayat' ? 'text-eco-600 border-b-2 border-eco-600' : 'text-gray-500 hover:text-gray-700'}`}
                    onClick={() => setActiveTab('panchayat')}
                >
                    Panchayat
                </button>
                <button
                    className={`pb-2 px-4 font-medium transition ${activeTab === 'global' ? 'text-eco-600 border-b-2 border-eco-600' : 'text-gray-500 hover:text-gray-700'}`}
                    onClick={() => setActiveTab('global')}
                >
                    Global
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-eco-50 text-eco-800">
                            <tr>
                                <th className="p-4 font-semibold">Rank</th>
                                <th className="p-4 font-semibold">Farmer</th>
                                <th className="p-4 font-semibold">Location</th>
                                <th className="p-4 font-semibold text-right">EcoScore</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {leaders.map((leader, index) => (
                                <tr key={leader.id} className="hover:bg-gray-50 transition">
                                    <td className="p-4">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${index === 0 ? 'bg-yellow-100 text-yellow-700' :
                                            index === 1 ? 'bg-gray-100 text-gray-700' :
                                                index === 2 ? 'bg-orange-100 text-orange-700' :
                                                    'text-gray-500'
                                            }`}>
                                            {index + 1}
                                        </div>
                                    </td>
                                    <td className="p-4 font-medium text-gray-800">{leader.name}</td>
                                    <td className="p-4 text-gray-500 flex items-center gap-1">
                                        <MapPin className="w-4 h-4" />
                                        {leader.location || leader.panchayat}
                                    </td>
                                    <td className="p-4 text-right font-bold text-eco-600">{leader.ecoScore}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {loading && <div className="p-8 text-center text-gray-500">Loading leaderboard...</div>}
            </div>
        </div>
    );
};

export default Leaderboard;
