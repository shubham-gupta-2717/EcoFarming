import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { auth } from '../config/firebase';
import { RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";
import { Leaf, Loader2, Smartphone, KeyRound } from 'lucide-react';
import api from '../services/api';

const Register = () => {
    const [formData, setFormData] = useState({
        name: '',
        mobile: '',
        location: '',
        crop: ''
    });
    const [otp, setOtp] = useState('');
    const [step, setStep] = useState('DETAILS'); // DETAILS, OTP
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [confirmationResult, setConfirmationResult] = useState(null);
    const { setSession } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        // Initialize Recaptcha
        if (!window.recaptchaVerifier) {
            try {
                window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container-reg', {
                    'size': 'invisible',
                    'callback': (response) => {
                        // reCAPTCHA solved
                    },
                    'expired-callback': () => {
                        // Response expired
                    }
                });
            } catch (e) {
                console.error("Recaptcha init error:", e);
            }
        }

        // Cleanup on unmount
        return () => {
            if (window.recaptchaVerifier) {
                try {
                    window.recaptchaVerifier.clear();
                    window.recaptchaVerifier = null;
                } catch (e) {
                    console.error("Recaptcha cleanup error:", e);
                }
            }
        };
    }, []);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSendOtp = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const formattedMobile = formData.mobile.startsWith('+') ? formData.mobile : `+91${formData.mobile}`;

        try {
            const appVerifier = window.recaptchaVerifier;
            const confirmation = await signInWithPhoneNumber(auth, formattedMobile, appVerifier);
            setConfirmationResult(confirmation);
            setStep('OTP');
        } catch (err) {
            console.error("Error sending OTP:", err);
            setError(err.message || 'Failed to send OTP. Check console.');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyAndRegister = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            // 1. Verify OTP with Firebase
            const result = await confirmationResult.confirm(otp);
            const user = result.user;
            const idToken = await user.getIdToken();

            // 2. Register user on Backend with ID Token
            const response = await api.post('/auth/register', {
                name: formData.name,
                mobile: formData.mobile,
                location: formData.location,
                crop: formData.crop,
                role: 'farmer',
                idToken: idToken // Send token to verify identity
            });

            // Auto-login (set session)
            const { token, user: backendUser } = response.data;
            setSession(token, backendUser);

            navigate('/dashboard');

        } catch (err) {
            console.error("Registration failed:", err);
            setError(err.response?.data?.message || err.message || 'Registration failed.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 font-sans min-h-screen flex flex-col">
            {/* Navigation */}
            <nav className="bg-white shadow-sm sticky top-0 z-50 border-b border-green-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16 items-center">
                        <div className="flex items-center">
                            <Link to="/" className="flex-shrink-0 flex items-center">
                                <Leaf className="text-green-600 h-6 w-6" />
                                <span className="ml-2 text-xl font-bold text-green-700">EcoFarming</span>
                            </Link>
                        </div>
                        <div className="flex items-center space-x-4">
                            <Link to="/get-started" className="text-gray-600 hover:text-green-600 font-medium px-4 py-2 rounded-lg border border-gray-200 hover:border-green-200 hover:bg-green-50 transition-all">
                                Back
                            </Link>
                        </div>
                    </div>
                </div>
            </nav>

            <div className="flex-grow flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
                <div className="w-full max-w-md">
                    <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-green-100">

                        {/* Header */}
                        <div className="flex flex-col items-center pt-8 pb-6 px-6 bg-gradient-to-r from-green-50 to-emerald-50 border-b border-green-100">
                            <div className="bg-white p-3 rounded-full mb-4 shadow-sm">
                                <Leaf className="w-8 h-8 text-green-600" />
                            </div>
                            <h1 className="text-2xl font-bold text-gray-800">Join EcoFarming</h1>
                            <p className="text-gray-600 mt-1">Start your sustainable farming journey</p>
                        </div>

                        {/* Body */}
                        <div className="px-6 pb-8 pt-6">
                            {error && (
                                <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm">
                                    {error}
                                </div>
                            )}

                            {step === 'DETAILS' ? (
                                <form onSubmit={handleSendOtp} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                                        <input
                                            type="text"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition"
                                            placeholder="Ramesh Kumar"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Mobile Number</label>
                                        <div className="relative">
                                            <Smartphone className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                                            <input
                                                type="tel"
                                                name="mobile"
                                                value={formData.mobile}
                                                onChange={handleChange}
                                                className="w-full pl-10 p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition"
                                                placeholder="9876543210"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                                            <input
                                                type="text"
                                                name="location"
                                                value={formData.location}
                                                onChange={handleChange}
                                                className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition"
                                                placeholder="Punjab"
                                                required
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Main Crop</label>
                                            <input
                                                type="text"
                                                name="crop"
                                                value={formData.crop}
                                                onChange={handleChange}
                                                className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition"
                                                placeholder="Wheat"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div id="recaptcha-container-reg"></div>

                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition flex justify-center items-center gap-2"
                                    >
                                        {loading ? <Loader2 className="animate-spin w-5 h-5" /> : 'Verify Mobile'}
                                    </button>
                                </form>
                            ) : (
                                <form onSubmit={handleVerifyAndRegister} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Enter Verification Code</label>
                                        <div className="relative">
                                            <KeyRound className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                                            <input
                                                type="text"
                                                value={otp}
                                                onChange={(e) => setOtp(e.target.value)}
                                                className="w-full pl-10 p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition"
                                                placeholder="123456"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition flex justify-center items-center gap-2"
                                    >
                                        {loading ? <Loader2 className="animate-spin w-5 h-5" /> : 'Complete Registration'}
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => setStep('DETAILS')}
                                        className="w-full text-gray-500 text-sm hover:text-gray-700"
                                    >
                                        Back to Details
                                    </button>
                                </form>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 text-center text-sm text-gray-600">
                            Already have an account?{' '}
                            <Link to="/login" className="text-green-600 font-semibold hover:text-green-700">
                                Sign In
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;
