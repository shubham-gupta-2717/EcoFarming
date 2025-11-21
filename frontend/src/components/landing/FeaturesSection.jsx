import React from 'react';
import { Play, Users, Gift } from 'lucide-react';

const FeaturesSection = () => {
    return (
        <section className="bg-gray-50 py-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h2 className="text-4xl font-bold text-gray-900 mb-3">How It Works</h2>
                    <div className="w-16 h-1 bg-green-500 mx-auto mb-4 rounded-full"></div>
                    <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
                        Transforming sustainable farming into an engaging experience
                    </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div
                        className="feature-card bg-white p-8 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 hover:translate-y-[-4px] border border-gray-100 hover:border-green-200"
                        data-aos="fade-up"
                        data-aos-delay="100"
                    >
                        <div className="bg-gradient-to-br from-green-100 to-green-50 w-14 h-14 rounded-lg flex items-center justify-center mb-6">
                            <Play className="h-7 w-7 text-green-600" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-3">Learning Through Play</h3>
                        <p className="text-gray-600 leading-relaxed">
                            Turn best practices into engaging missions that educate while entertaining.
                        </p>
                    </div>
                    <div
                        className="feature-card bg-white p-8 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 hover:translate-y-[-4px] border border-gray-100 hover:border-green-200"
                        data-aos="fade-up"
                        data-aos-delay="200"
                    >
                        <div className="bg-gradient-to-br from-green-100 to-green-50 w-14 h-14 rounded-lg flex items-center justify-center mb-6">
                            <Users className="h-7 w-7 text-green-600" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-3">Community & Leaderboards</h3>
                        <p className="text-gray-600 leading-relaxed">
                            Local recognition, peer sharing, and panchayat-level competition to motivate.
                        </p>
                    </div>
                    <div
                        className="feature-card bg-white p-8 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 hover:translate-y-[-4px] border border-gray-100 hover:border-green-200"
                        data-aos="fade-up"
                        data-aos-delay="300"
                    >
                        <div className="bg-gradient-to-br from-green-100 to-green-50 w-14 h-14 rounded-lg flex items-center justify-center mb-6">
                            <Gift className="h-7 w-7 text-green-600" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-3">Incentives & Rewards</h3>
                        <p className="text-gray-600 leading-relaxed">
                            Earn real-world benefits like training credits and government scheme points.
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default FeaturesSection;
