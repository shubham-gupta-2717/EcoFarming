import React from 'react';
import { CheckCircle, Shield } from 'lucide-react';

const ImpactSection = () => {
    return (
        <section className="py-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="bg-gradient-to-r from-green-50 to-white rounded-2xl shadow-sm overflow-hidden">
                    <div className="md:flex">
                        <div className="md:w-1/2 p-8 md:p-12" data-aos="fade-right">
                            <h2 className="text-4xl font-bold text-gray-900 mb-4">Expected Impact</h2>
                            <div className="w-12 h-1 bg-green-400 rounded-full mb-6"></div>
                            <ul className="space-y-5">
                                <li className="flex items-start">
                                    <div className="flex-shrink-0 mt-0.5">
                                        <CheckCircle className="h-6 w-6 text-green-600" />
                                    </div>
                                    <p className="ml-4 text-gray-700 leading-relaxed">
                                        Encourage widespread adoption of eco-friendly farming techniques
                                    </p>
                                </li>
                                <li className="flex items-start">
                                    <div className="flex-shrink-0 mt-0.5">
                                        <CheckCircle className="h-6 w-6 text-green-600" />
                                    </div>
                                    <p className="ml-4 text-gray-700 leading-relaxed">
                                        Build a connected community of farmers sharing best practices
                                    </p>
                                </li>
                                <li className="flex items-start">
                                    <div className="flex-shrink-0 mt-0.5">
                                        <CheckCircle className="h-6 w-6 text-green-600" />
                                    </div>
                                    <p className="ml-4 text-gray-700 leading-relaxed">
                                        Empower rural youth with gamified agricultural learning
                                    </p>
                                </li>
                            </ul>
                        </div>
                        <div className="md:w-1/2 bg-green-600 p-8 md:p-12 text-white" data-aos="fade-left">
                            <div className="max-w-xs mx-auto">
                                <div className="flex items-center mb-6">
                                    <Shield className="h-8 w-8 mr-3" />
                                    <span className="text-xl font-bold">Farmers Association</span>
                                </div>
                                <p className="mb-6">Department of Agriculture Development & Farmers' Welfare</p>
                                <p className="text-green-100">
                                    Supported by the Ministry of Agriculture & Farmers Welfare, Government of India
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default ImpactSection;
