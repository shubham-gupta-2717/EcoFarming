import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, Globe, Users, ShieldCheck } from 'lucide-react';

const InstitutionJoinSection = () => {
    const navigate = useNavigate();

    const features = [
        {
            icon: <Globe className="w-8 h-8 text-green-600" />,
            title: "Global Impact",
            description: "Track and visualize your contribution to global sustainability goals in real-time."
        },
        {
            icon: <Users className="w-8 h-8 text-blue-600" />,
            title: "Community Support",
            description: "Directly connect with and support farming communities through targeted initiatives."
        },
        {
            icon: <ShieldCheck className="w-8 h-8 text-purple-600" />,
            title: "Verified Data",
            description: "Access reliable, verified data on farming practices and environmental impact."
        },
        {
            icon: <Building2 className="w-8 h-8 text-orange-600" />,
            title: "Scalable Solutions",
            description: "Implement scalable agricultural solutions tailored for large organizations."
        }
    ];

    return (
        <section className="py-20 bg-gradient-to-b from-white to-green-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col lg:flex-row items-center gap-16">

                    {/* Left Content */}
                    <div className="lg:w-1/2 space-y-8" data-aos="fade-right">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-100 text-green-800 text-sm font-medium border border-green-200">
                            <Building2 className="w-4 h-4" />
                            <span>For Organizations & Governments</span>
                        </div>

                        <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 leading-tight">
                            Empower Sustainable <span className="text-green-600">Agriculture at Scale</span>
                        </h2>

                        <p className="text-lg text-gray-600 leading-relaxed">
                            Join our network of institutions driving change. Monitor impact, support farmers, and achieve your sustainability goals with our comprehensive platform.
                        </p>

                        <div>
                            <button
                                onClick={() => navigate('/institution-registration')}
                                className="bg-green-600 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-green-700 transition-all duration-300 shadow-lg hover:shadow-green-200 transform hover:-translate-y-1"
                            >
                                Partner with Us
                            </button>
                        </div>
                    </div>

                    {/* Right Content - 4 Blocks Grid */}
                    <div className="lg:w-1/2 grid grid-cols-1 md:grid-cols-2 gap-6">
                        {features.map((feature, index) => (
                            <div
                                key={index}
                                data-aos="fade-up"
                                data-aos-delay={index * 100}
                                className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md hover:border-green-200 transition-all duration-300 group"
                            >
                                <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-green-50 transition-colors">
                                    {feature.icon}
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                                <p className="text-gray-600 text-sm leading-relaxed">
                                    {feature.description}
                                </p>
                            </div>
                        ))}
                    </div>

                </div>
            </div>
        </section>
    );
};

export default InstitutionJoinSection;
