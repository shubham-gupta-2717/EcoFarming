import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { auth } from '../config/firebase';
import { RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";
import { Leaf, Loader2, Smartphone, KeyRound } from 'lucide-react';

const Login = () => {
    const [mobile, setMobile] = useState('');
    const [otp, setOtp] = useState('');
    const [step, setStep] = useState('MOBILE'); // MOBILE or OTP
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [confirmationResult, setConfirmationResult] = useState(null);
    const { login } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        // Initialize Recaptcha
        if (!window.recaptchaVerifier) {
            try {
                window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
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

    const handleSendOtp = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const formattedMobile = mobile.startsWith('+') ? mobile : `+91${mobile}`;

        try {
            const appVerifier = window.recaptchaVerifier;
            const confirmation = await signInWithPhoneNumber(auth, formattedMobile, appVerifier);
            setConfirmationResult(confirmation);
            setStep('OTP');
        } catch (err) {
            console.error("Error sending OTP:", err);
            setError(err.message || 'Failed to send OTP. Check console.');
            // Reset recaptcha on error
            if (window.recaptchaVerifier) {
                window.recaptchaVerifier.clear();
                window.recaptchaVerifier = null;
            }
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            // 1. Verify OTP with Firebase
            const result = await confirmationResult.confirm(otp);
            const user = result.user;
            const idToken = await user.getIdToken();

            // 2. Send ID Token to Backend to create session
            const loginResult = await login(idToken);

            if (loginResult.success) {
                navigate('/');
            } else {
                if (loginResult.isNewUser) {
                    // Redirect to register with state
                    navigate('/register', {
                        state: {
                            mobile: loginResult.debugMobile,
                            idToken
                        }
                    });
                } else {
                    setError(loginResult.message);
                }
            }
        } catch (err) {
            console.error("Error verifying OTP:", err);
            setError('Invalid OTP. Please try again.');
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
                    <h1 className="text-2xl font-bold text-gray-800">Welcome Back</h1>
                    <p className="text-gray-500">Sign in with your mobile number</p>
                </div>

                {error && (
                    <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm">
                        {error}
                    </div>
                )}

                {step === 'MOBILE' ? (
                    <form onSubmit={handleSendOtp} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Mobile Number</label>
                            <div className="relative">
                                <Smartphone className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                                <input
                                    type="tel"
                                    value={mobile}
                                    onChange={(e) => setMobile(e.target.value)}
                                    className="w-full pl-10 p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-eco-500 focus:border-transparent outline-none transition"
                                    placeholder="9876543210"
                                    required
                                />
                            </div>
                            <p className="text-xs text-gray-500 mt-1">We'll send a verification code to this number.</p>
                        </div>

                        <div id="recaptcha-container"></div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-eco-600 text-white py-3 rounded-lg font-semibold hover:bg-eco-700 transition flex justify-center items-center gap-2"
                        >
                            {loading ? <Loader2 className="animate-spin w-5 h-5" /> : 'Send OTP'}
                        </button>
                    </form>
                ) : (
                    <form onSubmit={handleVerifyOtp} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Enter OTP</label>
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
                            {loading ? <Loader2 className="animate-spin w-5 h-5" /> : 'Verify & Login'}
                        </button>

                        <button
                            type="button"
                            onClick={() => {
                                setStep('MOBILE');
                                setOtp('');
                            }}
                            className="w-full text-gray-500 text-sm hover:text-gray-700"
                        >
                            Change Mobile Number
                        </button>
                    </form>
                )}

                <div className="mt-6 text-center text-sm text-gray-500">
                    <p>Use Test Number:</p>
                    <p className="font-mono text-xs mt-1">+91 9876543210 / 123456</p>
                </div>

                <div className="mt-4 text-center text-sm text-gray-600">
                    Don't have an account?{' '}
                    <Link to="/register" className="text-eco-600 font-semibold hover:text-eco-700">
                        Sign Up
                    </Link>
                </div>

                <div className="mt-4 text-center text-sm">
                    <Link to="/admin/login" className="text-gray-400 hover:text-gray-600 transition-colors">
                        Login as Admin
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Login;
