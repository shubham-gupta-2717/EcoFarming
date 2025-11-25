import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, UserCheck, UserPlus } from 'lucide-react';
import farmerImg from '../assets/farmerPNG.png';
import institutionImg from '../assets/InstitutionPNG.png';

const GetStarted = () => {
    const [showFarmerModal, setShowFarmerModal] = useState(false);
    const navigate = useNavigate();

    const handleInstitutionClick = () => {
        navigate('/admin/login');
    };

    const handleFarmerClick = () => {
        setShowFarmerModal(true);
    };

    return (
        <div className="bg-green-50 font-sans min-h-screen flex flex-col justify-center items-center relative">
            <button
                onClick={() => navigate(-1)}
                className="absolute top-6 left-6 px-6 py-2 bg-white text-green-700 font-medium rounded-full shadow-sm hover:bg-green-50 transition-colors border border-green-100"
            >
                Back
            </button>
            <div className="max-w-3xl w-full mx-auto p-8">
                <h1 className="text-3xl font-bold text-center text-green-700 mb-12">Choose Your Role</h1>
                <div className="flex flex-col md:flex-row gap-12 justify-center items-start mb-8">

                    {/* Farmer Container */}
                    <div className="role-container flex-1 flex flex-col items-center w-full">
                        <div
                            onClick={handleFarmerClick}
                            className="role-box w-full bg-white border-4 border-gray-200 hover:border-green-500 hover:shadow-[0_8px_32px_rgba(34,197,94,0.12)] rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-200"
                            tabIndex="0"
                            onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && handleFarmerClick()}
                        >
                            <img src={farmerImg} alt="Farmer" className="w-48 h-48 mb-6 object-contain" />
                            <span className="text-2xl font-semibold text-green-700">Farmer</span>
                            <p className="text-gray-500 mt-3">For individual farmers seeking gamified support and rewards.</p>
                        </div>
                    </div>

                    {/* Institution Container */}
                    <div className="role-container flex-1 flex flex-col items-center w-full">
                        <div
                            onClick={handleInstitutionClick}
                            className="role-box w-full bg-white border-4 border-gray-200 hover:border-green-500 hover:shadow-[0_8px_32px_rgba(34,197,94,0.12)] rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-200"
                            tabIndex="0"
                            onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && handleInstitutionClick()}
                        >
                            <img src={institutionImg} alt="Institution" className="w-48 h-48 mb-6 object-contain" />
                            <span className="text-2xl font-semibold text-green-700">Institution</span>
                            <p className="text-gray-500 mt-3">For government agencies, NGOs, communities, and organizations.</p>
                        </div>
                    </div>

                </div>
            </div>

            {/* Farmer Modal */}
            {showFarmerModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all animate-scale-in">
                        <div className="relative p-6 border-b border-gray-100">
                            <h2 className="text-2xl font-bold text-center text-gray-800">Welcome Farmer</h2>
                            <button
                                onClick={() => setShowFarmerModal(false)}
                                className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="p-8 space-y-4">
                            <button
                                onClick={() => navigate('/login')}
                                className="w-full flex items-center justify-center gap-3 p-4 rounded-xl border-2 border-green-100 hover:border-green-500 hover:bg-green-50 transition-all group"
                            >
                                <div className="bg-green-100 p-3 rounded-full group-hover:bg-green-200 transition-colors">
                                    <UserCheck className="w-6 h-6 text-green-600" />
                                </div>
                                <div className="text-left">
                                    <div className="font-semibold text-gray-800">Existing User</div>
                                    <div className="text-sm text-gray-500">Login to your account</div>
                                </div>
                            </button>

                            <button
                                onClick={() => navigate('/register')}
                                className="w-full flex items-center justify-center gap-3 p-4 rounded-xl border-2 border-blue-100 hover:border-blue-500 hover:bg-blue-50 transition-all group"
                            >
                                <div className="bg-blue-100 p-3 rounded-full group-hover:bg-blue-200 transition-colors">
                                    <UserPlus className="w-6 h-6 text-blue-600" />
                                </div>
                                <div className="text-left">
                                    <div className="font-semibold text-gray-800">New User</div>
                                    <div className="text-sm text-gray-500">Create a new account</div>
                                </div>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default GetStarted;
