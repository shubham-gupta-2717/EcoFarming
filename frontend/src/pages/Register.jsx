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
        location: ''
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
                role: 'farmer',
                idToken: idToken // Send token to verify identity
            });

            // Auto-login (set session)
            const { token, user: backendUser } = response.data;
            setSession(token, backendUser);

            navigate('/');

        } catch (err) {
            console.error("Registration failed:", err);
            setError(err.response?.data?.message || err.message || 'Registration failed.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-eco-50 flex items-center justify-center p-4">
            <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-eco-100">
                <div className="flex flex-col items-center mb-8">
                    <div className="bg-eco-100 p-3 rounded-full mb-4">
                        <Leaf className="w-8 h-8 text-eco-600" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-800">Join EcoFarming</h1>
                    <p className="text-gray-500">Start your sustainable farming journey</p>
                </div>

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
                                className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-eco-500 focus:border-transparent outline-none transition"
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
                                    className="w-full pl-10 p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-eco-500 focus:border-transparent outline-none transition"
                                    placeholder="9876543210"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                            <input
                                type="text"
                                name="location"
                                value={formData.location}
                                onChange={handleChange}
                                className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-eco-500 focus:border-transparent outline-none transition"
                                placeholder="Punjab"
                                required
                            />
                        </div>

                        <div id="recaptcha-container-reg"></div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-eco-600 text-white py-3 rounded-lg font-semibold hover:bg-eco-700 transition flex justify-center items-center gap-2"
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
                                    className="w-full pl-10 p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-eco-500 focus:border-transparent outline-none transition"
                                    placeholder="123456"
                                    required
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-eco-600 text-white py-3 rounded-lg font-semibold hover:bg-eco-700 transition flex justify-center items-center gap-2"
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

                <div className="mt-6 text-center text-sm text-gray-600">
                    Already have an account?{' '}
                    <Link to="/login" className="text-eco-600 font-semibold hover:text-eco-700">
                        Sign In
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Register;
