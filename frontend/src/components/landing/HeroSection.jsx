import React from 'react';
import { Link } from 'react-router-dom';
import { Award, Target, BarChart2 } from 'lucide-react';

const HeroSection = () => {
    return (
        <section className="bg-green-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
                <div className="md:flex md:items-center md:justify-between">
                    <div className="md:w-1/2 mb-12 md:mb-0" data-aos="fade-right">
                        <h1 className="text-4xl md:text-5xl font-bold leading-tight text-gray-900 mb-6">
                            Gamified Platform to Promote <span className="text-green-600">Sustainable Farming</span> Practices
                        </h1>
                        <p className="text-lg text-gray-600 mb-8">
                            Educate and motivate farmers to adopt eco-friendly farming techniques through interactive
                            challenges, personalized quests, progress tracking, and rewards.
                        </p>
                        <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 mb-12">
                            <Link
                                to="/get-started"
                                className="inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-lg shadow-md text-white bg-green-600 hover:bg-green-700 hover:shadow-lg transition-all duration-200 transform hover:scale-105"
                            >
                                Get Started
                            </Link>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="flex items-start">
                                <div className="flex-shrink-0 bg-green-100 p-2 rounded-lg">
                                    <Award className="h-5 w-5 text-green-600" />
                                </div>
                                <div className="ml-3">
                                    <p className="text-sm font-medium text-gray-900">Interactive Challenges</p>
                                    <p className="text-xs text-gray-500">Engage farmers with missions and tasks</p>
                                </div>
                            </div>
                            <div className="flex items-start">
                                <div className="flex-shrink-0 bg-green-100 p-2 rounded-lg">
                                    <Target className="h-5 w-5 text-green-600" />
                                </div>
                                <div className="ml-3">
                                    <p className="text-sm font-medium text-gray-900">Personalized Quests</p>
                                    <p className="text-xs text-gray-500">Tailored tasks based on your farm</p>
                                </div>
                            </div>
                            <div className="flex items-start">
                                <div className="flex-shrink-0 bg-green-100 p-2 rounded-lg">
                                    <BarChart2 className="h-5 w-5 text-green-600" />
                                </div>
                                <div className="ml-3">
                                    <p className="text-sm font-medium text-gray-900">Progress Tracker</p>
                                    <p className="text-xs text-gray-500">Dashboards, scores, and badges</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="md:w-1/2 flex justify-center items-start pt-4" data-aos="fade-left">
                        <img
                            src="http://static.photos/agriculture/1024x576/1"
                            alt="Farmer using tablet"
                            className="rounded-lg shadow-xl w-full max-w-md"
                        />
                    </div>
                </div>
            </div>
        </section>
    );
};

export default HeroSection;
