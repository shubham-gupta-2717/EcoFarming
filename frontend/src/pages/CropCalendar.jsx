import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Calendar, Loader2 } from 'lucide-react';

const CropCalendar = () => {
    const [calendar, setCalendar] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedCrop, setSelectedCrop] = useState('wheat');

    useEffect(() => {
        fetchCalendar(selectedCrop);
    }, [selectedCrop]);

    const fetchCalendar = async (crop) => {
        setLoading(true);
        try {
            const response = await api.get(`/crop/calendar?crop=${crop}`);
            setCalendar(response.data.calendar);
        } catch (error) {
            console.error("Failed to fetch calendar", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <header className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Crop Calendar 📅</h1>
                    <p className="text-gray-600">Track your crop lifecycle stages</p>
                </div>

                <select
                    value={selectedCrop}
                    onChange={(e) => setSelectedCrop(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-eco-500 outline-none"
                >
                    <option value="wheat">Wheat</option>
                    <option value="rice">Rice</option>
                </select>
            </header>

            {loading ? (
                <div className="flex justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-eco-600" />
                </div>
            ) : calendar ? (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <div className="mb-6">
                        <h2 className="text-xl font-bold text-gray-800">{calendar.crop}</h2>
                        <p className="text-sm text-gray-500">Season: {calendar.season}</p>
                    </div>

                    <div className="space-y-4">
                        {calendar.stages.map((stage, index) => (
                            <div key={index} className="border-l-4 border-eco-500 pl-4 py-2">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="font-semibold text-gray-800">{stage.stage}</h3>
                                        <p className="text-sm text-gray-500">{stage.month} ({stage.days})</p>
                                    </div>
                                    <Calendar className="w-5 h-5 text-eco-600" />
                                </div>
                                <ul className="mt-2 space-y-1">
                                    {stage.tasks.map((task, i) => (
                                        <li key={i} className="text-sm text-gray-600 flex items-center gap-2">
                                            <span className="w-1.5 h-1.5 bg-eco-500 rounded-full"></span>
                                            {task}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </div>
            ) : (
                <div className="text-center py-12 text-gray-500">
                    No calendar data available
                </div>
            )}
        </div>
    );
};

export default CropCalendar;
