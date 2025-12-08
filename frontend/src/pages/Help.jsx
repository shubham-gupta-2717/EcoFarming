import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, AlertTriangle, ArrowLeft } from 'lucide-react';

const Help = () => {
    const navigate = useNavigate();

    const handleSupportClick = () => {
        navigate('/dashboard/tickets/new');
    };

    const handleEmergencyClick = () => {
        navigate('/dashboard/disaster/new');
    };

    return (
        <div className="bg-green-50/50 min-h-[80vh] flex flex-col justify-center items-center relative rounded-3xl p-6">
            <div className="max-w-4xl w-full mx-auto">
                <div className="text-center mb-12">
                    <h1 className="text-3xl font-bold text-green-800 mb-4">How can we help you today?</h1>
                    <p className="text-gray-600">Choose the type of assistance you need</p>
                </div>

                <div className="flex flex-col md:flex-row gap-8 justify-center items-stretch">

                    {/* Support Tickets Container */}
                    <div className="flex-1 w-full max-w-sm mx-auto">
                        <div
                            onClick={handleSupportClick}
                            className="h-full bg-white border-2 border-blue-100 hover:border-blue-500 hover:shadow-[0_8px_30px_rgba(59,130,246,0.15)] rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-300 group"
                            tabIndex="0"
                            onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && handleSupportClick()}
                        >
                            <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                                <AlertCircle className="w-12 h-12 text-blue-600" />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-800 mb-3 group-hover:text-blue-600 transition-colors">Support Tickets</h2>
                            <p className="text-gray-500 leading-relaxed">
                                Raise a ticket for general queries, technical issues, or feedback about the platform.
                            </p>
                            <div className="mt-8 px-6 py-2 bg-blue-50 text-blue-700 rounded-full text-sm font-medium group-hover:bg-blue-600 group-hover:text-white transition-all">
                                Get Support
                            </div>
                        </div>
                    </div>

                    {/* Emergency Help Container */}
                    <div className="flex-1 w-full max-w-sm mx-auto">
                        <div
                            onClick={handleEmergencyClick}
                            className="h-full bg-white border-2 border-red-100 hover:border-red-500 hover:shadow-[0_8px_30px_rgba(239,68,68,0.15)] rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-300 group"
                            tabIndex="0"
                            onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && handleEmergencyClick()}
                        >
                            <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                                <AlertTriangle className="w-12 h-12 text-red-600" />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-800 mb-3 group-hover:text-red-600 transition-colors">Emergency Help</h2>
                            <p className="text-gray-500 leading-relaxed">
                                Immediate assistance for disasters, crop failure, or urgent farming crises.
                            </p>
                            <div className="mt-8 px-6 py-2 bg-red-50 text-red-700 rounded-full text-sm font-medium group-hover:bg-red-600 group-hover:text-white transition-all">
                                Request Help
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default Help;
