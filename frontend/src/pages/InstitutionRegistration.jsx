import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, User, Mail, Phone, MapPin, Globe, Send, CheckCircle, ArrowLeft, LogIn, Sprout } from 'lucide-react';
import Navbar from '../components/landing/Navbar';
import Footer from '../components/landing/Footer';

const InstitutionRegistration = () => {
    const navigate = useNavigate();
    const [submitted, setSubmitted] = useState(false);
    const [formData, setFormData] = useState({
        institutionName: '',
        type: '',
        registrationId: '',
        contactPerson: '',
        email: '',
        phone: '',
        address: '',
        website: ''
    });

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('http://localhost:5000/api/institutions/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                setSubmitted(true);
                window.scrollTo(0, 0);
            } else {
                alert('Failed to submit registration. Please try again.');
            }
        } catch (error) {
            console.error('Error submitting registration:', error);
            alert('Error connecting to server.');
        }
    };

    if (submitted) {
        return (
            <div className="min-h-screen bg-green-50 flex flex-col font-sans">
                <Navbar />
                <div className="flex-grow flex items-center justify-center px-4 py-20">
                    <div className="max-w-2xl w-full bg-white rounded-3xl shadow-xl p-8 md:p-12 text-center animate-fade-in">
                        <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-8">
                            <CheckCircle className="w-12 h-12 text-green-600" />
                        </div>
                        <h2 className="text-3xl font-bold text-gray-900 mb-4">Thank You for Your Interest!</h2>
                        <p className="text-gray-600 text-lg mb-8 leading-relaxed">
                            We have received your inquiry. Our team will verify your institution details and get back to you shortly at <span className="font-semibold text-gray-900">{formData.email}</span>.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <button
                                onClick={() => navigate('/')}
                                className="px-8 py-3 rounded-xl border-2 border-gray-200 text-gray-600 font-semibold hover:border-green-500 hover:text-green-600 transition-all"
                            >
                                Back to Home
                            </button>
                            <button
                                onClick={() => navigate('/admin/login')}
                                className="px-8 py-3 rounded-xl bg-green-600 text-white font-semibold hover:bg-green-700 shadow-lg hover:shadow-green-200 transition-all flex items-center justify-center gap-2"
                            >
                                <LogIn className="w-5 h-5" />
                                Login to Dashboard
                            </button>
                        </div>
                    </div>
                </div>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
            <Navbar />

            <div className="flex-grow py-12 px-4 sm:px-6 lg:px-8 relative">
                {/* Back Button - Extreme Left */}
                <div className="absolute top-12 left-4 sm:left-8 z-10">
                    <button
                        onClick={() => navigate('/')}
                        className="group flex items-center text-gray-600 bg-white font-medium transition-colors px-6 py-2 rounded-lg hover:bg-gray-50 border border-gray-200 shadow-sm"
                    >
                        Back
                    </button>
                </div>

                <div className="max-w-4xl mx-auto mt-12 sm:mt-0">
                    <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
                        <div className="bg-green-50 px-8 py-12 text-center border-b border-green-100">
                            <div className="w-20 h-20 bg-white rounded-2xl shadow-sm flex items-center justify-center mx-auto mb-6">
                                <Building2 className="w-10 h-10 text-green-600" />
                            </div>
                            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Institution Registration</h1>
                            <p className="text-gray-600 max-w-2xl mx-auto text-lg">
                                Join our network of government bodies, NGOs, and organizations driving agricultural innovation.
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="p-8 md:p-12 space-y-8">
                            {/* Institution Details Section */}
                            <div>
                                <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2 border-b pb-2">
                                    <Building2 className="w-5 h-5 text-green-600" />
                                    Institution Details
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-700">Institution Name *</label>
                                        <input
                                            type="text"
                                            name="institutionName"
                                            required
                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition-all"
                                            placeholder="e.g. Green Earth Foundation"
                                            value={formData.institutionName}
                                            onChange={handleChange}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-700">Institution Type *</label>
                                        <select
                                            name="type"
                                            required
                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition-all bg-white"
                                            value={formData.type}
                                            onChange={handleChange}
                                        >
                                            <option value="">Select Type</option>
                                            <option value="Government Agency">Government Agency</option>
                                            <option value="NGO">NGO</option>
                                            <option value="Community">Community</option>
                                            <option value="Organization">Organization</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-700">Registration ID / License No. *</label>
                                        <input
                                            type="text"
                                            name="registrationId"
                                            required
                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition-all"
                                            placeholder="Official Registration Number"
                                            value={formData.registrationId}
                                            onChange={handleChange}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-700">Website (Optional)</label>
                                        <div className="relative">
                                            <Globe className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
                                            <input
                                                type="url"
                                                name="website"
                                                className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition-all"
                                                placeholder="https://..."
                                                value={formData.website}
                                                onChange={handleChange}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Contact Details Section */}
                            <div>
                                <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2 border-b pb-2">
                                    <User className="w-5 h-5 text-green-600" />
                                    Contact Information
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-700">Contact Person Name *</label>
                                        <input
                                            type="text"
                                            name="contactPerson"
                                            required
                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition-all"
                                            placeholder="Full Name"
                                            value={formData.contactPerson}
                                            onChange={handleChange}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-700">Email Address *</label>
                                        <div className="relative">
                                            <Mail className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
                                            <input
                                                type="email"
                                                name="email"
                                                required
                                                className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition-all"
                                                placeholder="official@institution.com"
                                                value={formData.email}
                                                onChange={handleChange}
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-700">Phone Number *</label>
                                        <div className="relative">
                                            <Phone className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
                                            <input
                                                type="tel"
                                                name="phone"
                                                required
                                                className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition-all"
                                                placeholder="+91 98765 43210"
                                                value={formData.phone}
                                                onChange={handleChange}
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-700">Address *</label>
                                        <div className="relative">
                                            <MapPin className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
                                            <input
                                                type="text"
                                                name="address"
                                                required
                                                className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition-all"
                                                placeholder="Full Address"
                                                value={formData.address}
                                                onChange={handleChange}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-4">
                                <button
                                    type="submit"
                                    className="w-full bg-green-600 text-white font-bold text-lg py-4 rounded-xl hover:bg-green-700 shadow-lg hover:shadow-green-200 transition-all flex items-center justify-center gap-2 transform hover:-translate-y-1"
                                >
                                    Submit Inquiry
                                    <Send className="w-5 h-5" />
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
};

export default InstitutionRegistration;
