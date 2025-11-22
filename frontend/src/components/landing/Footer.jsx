import React from 'react';
import { Leaf } from 'lucide-react';

const Footer = () => {
    return (
        <footer className="bg-white border-t border-green-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="md:flex md:items-center md:justify-between">
                    <div className="flex items-center">
                        <Leaf className="h-6 w-6 text-green-600" />
                        <span className="ml-2 text-lg font-bold text-green-700">EcoFarming</span>
                    </div>
                    <div className="mt-6 md:mt-0">
                        <p className="text-sm text-gray-500">© 2025 EcoFarming • Built for SIH</p>
                    </div>
                    <div className="mt-6 md:mt-0">
                        <p className="text-sm font-medium text-gray-900">
                            Theme: Agriculture, FoodTech & Rural Development
                        </p>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
