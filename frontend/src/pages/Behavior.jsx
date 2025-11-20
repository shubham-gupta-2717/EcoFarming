import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Droplets, Leaf, Sprout, TrendingUp, Calendar, ArrowRight } from 'lucide-react';

const Behavior = () => {
    const [report, setReport] = useState(null);
    const [timeline, setTimeline] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [reportRes, timelineRes] = await Promise.all([
                    api.get('/behavior/report'),
                    api.get('/behavior/timeline')
                ]);
                setReport(reportRes.data.report);
                setTimeline(timelineRes.data.timeline);
            } catch (error) {
                console.error("Failed to fetch behavior data", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) {
        return <div className="p-8 text-center text-gray-500">Loading impact data...</div>;
    }

    return (
        <div className="space-y-8">
            <header>
                <h1 className="text-2xl font-bold text-gray-800">My Impact & Journey 🌍</h1>
                <p className="text-gray-600">Track your contribution to sustainable farming.</p>
            </header>

            {/* Impact Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-blue-50 p-6 rounded-xl border border-blue-100">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="bg-blue-100 p-2 rounded-lg">
                            <Droplets className="w-6 h-6 text-blue-600" />
                        </div>
                        <span className="text-sm font-semibold text-blue-800">Water Saved</span>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-800">{report?.totalWaterSaved}</h3>
                </div>

                <div className="bg-green-50 p-6 rounded-xl border border-green-100">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="bg-green-100 p-2 rounded-lg">
                            <Leaf className="w-6 h-6 text-green-600" />
                        </div>
                        <span className="text-sm font-semibold text-green-800">Carbon Offset</span>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-800">{report?.carbonOffset}</h3>
                </div>

                <div className="bg-amber-50 p-6 rounded-xl border border-amber-100">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="bg-amber-100 p-2 rounded-lg">
                            <Sprout className="w-6 h-6 text-amber-600" />
                        </div>
                        <span className="text-sm font-semibold text-amber-800">Soil Health</span>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-800">{report?.soilHealthScore}</h3>
                </div>

                <div className="bg-purple-50 p-6 rounded-xl border border-purple-100">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="bg-purple-100 p-2 rounded-lg">
                            <TrendingUp className="w-6 h-6 text-purple-600" />
                        </div>
                        <span className="text-sm font-semibold text-purple-800">Money Saved</span>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-800">{report?.moneySaved}</h3>
                </div>
            </div>

            {/* Timeline */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h2 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-gray-500" />
                    Sustainability Journey
                </h2>
                <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-gray-200 before:to-transparent">
                    {timeline.map((item) => (
                        <div key={item.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                            {/* Icon */}
                            <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white bg-gray-100 group-[.is-active]:bg-eco-500 group-[.is-active]:text-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                                <Leaf className="w-5 h-5" />
                            </div>

                            {/* Card */}
                            <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                                <div className="flex items-center justify-between space-x-2 mb-1">
                                    <div className="font-bold text-gray-800">{item.action}</div>
                                    <time className="font-caveat font-medium text-indigo-500 text-sm">{item.date}</time>
                                </div>
                                <div className="text-gray-500 text-sm">{item.impact}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Behavior;
