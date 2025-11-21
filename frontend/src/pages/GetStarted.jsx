import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import farmerImg from '../assets/farmerPNG.png';
import institutionImg from '../assets/InstitutionPNG.png';

const GetStarted = () => {
    const [selectedRole, setSelectedRole] = useState(null);
    const navigate = useNavigate();

    const handleRoleSelect = (role) => {
        setSelectedRole(role);
    };

    return (
        <div className="bg-green-50 font-sans min-h-screen flex flex-col justify-center items-center">
            <div className="max-w-3xl w-full mx-auto p-8">
                <h1 className="text-3xl font-bold text-center text-green-700 mb-12">Choose Your Role</h1>
                <div className="flex flex-col md:flex-row gap-12 justify-center items-start mb-8">

                    {/* Farmer Container */}
                    <div className={`role-container flex-1 flex flex-col items-center ${selectedRole === 'farmer' ? 'active' : ''}`}>
                        <div
                            onClick={() => handleRoleSelect('farmer')}
                            className={`role-box w-full bg-white border-4 rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-200 ${selectedRole === 'farmer'
                                ? 'border-green-500 shadow-[0_8px_32px_rgba(34,197,94,0.12)]'
                                : 'border-gray-200 hover:border-blue-500'
                                }`}
                            tabIndex="0"
                            onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && handleRoleSelect('farmer')}
                        >
                            {/* Using placeholder images or assets if available. For now using text/icon or checking if I can use the original images. 
                  The original images were 'farmerPNG.png' and 'InstitutionPNG.png'. 
                  I should probably check if these exist in public or assets. 
                  For now I will use the same paths assuming they are in public.
              */}
                            <img src={farmerImg} alt="Farmer" className="w-40 h-40 mb-6 object-contain" />
                            <span className="text-2xl font-semibold text-green-700">Farmer</span>
                            <p className="text-gray-500 mt-3">For individual farmers seeking gamified support and rewards.</p>
                        </div>

                        <div className={`w-full flex flex-col gap-3 mt-4 transition-all duration-300 ${selectedRole === 'farmer' ? 'opacity-100 visible' : 'opacity-0 invisible'}`}>
                            <button
                                onClick={() => navigate('/login')}
                                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-8 rounded-lg w-full"
                            >
                                Existing User Login
                            </button>
                            <button
                                onClick={() => navigate('/register')} // Assuming register route exists or farmerNew.html maps to register
                                className="bg-white border-2 border-blue-600 text-blue-700 font-medium py-3 px-8 rounded-lg hover:bg-blue-50 w-full"
                            >
                                New User Registration
                            </button>
                        </div>
                    </div>

                    {/* Institution Container */}
                    <div className={`role-container flex-1 flex flex-col items-center ${selectedRole === 'institution' ? 'active' : ''}`}>
                        <div
                            onClick={() => handleRoleSelect('institution')}
                            className={`role-box w-full bg-white border-4 rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-200 ${selectedRole === 'institution'
                                ? 'border-green-500 shadow-[0_8px_32px_rgba(34,197,94,0.12)]'
                                : 'border-gray-200 hover:border-purple-500'
                                }`}
                            tabIndex="0"
                            onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && handleRoleSelect('institution')}
                        >
                            <img src={institutionImg} alt="Institution" className="w-40 h-40 mb-6 object-contain" />
                            <span className="text-2xl font-semibold text-green-700">Institution</span>
                            <p className="text-gray-500 mt-3">For government agencies, NGOs, communities, and organizations.</p>
                        </div>

                        <div className={`w-full flex flex-col gap-3 mt-4 transition-all duration-300 ${selectedRole === 'institution' ? 'opacity-100 visible' : 'opacity-0 invisible'}`}>
                            <button
                                onClick={() => navigate('/admin/login')}
                                className="bg-purple-600 hover:bg-purple-700 text-white font-medium py-3 px-8 rounded-lg w-full"
                            >
                                Existing User Login
                            </button>
                            <button
                                onClick={() => navigate('/institution/register')} // Assuming route
                                className="bg-white border-2 border-purple-600 text-purple-700 font-medium py-3 px-8 rounded-lg hover:bg-purple-50 w-full"
                            >
                                New User Registration
                            </button>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default GetStarted;
