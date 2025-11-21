import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { auth } from '../config/firebase';
import { RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";
import { Loader2, Leaf, Sun } from 'lucide-react';

const Login = () => {
    const [mobile, setMobile] = useState('');
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [step, setStep] = useState('MOBILE'); // MOBILE or OTP
    const [loginMethod, setLoginMethod] = useState('MOBILE'); // MOBILE or GOOGLE
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [confirmationResult, setConfirmationResult] = useState(null);
    const { login } = useAuth();
    const navigate = useNavigate();
    const otpInputRefs = useRef([]);

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
            if (window.recaptchaVerifier) {
                window.recaptchaVerifier.clear();
                window.recaptchaVerifier = null;
            }
        } finally {
            setLoading(false);
        }
    };

    const handleOtpChange = (index, value) => {
        if (isNaN(value)) return;
        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        // Auto-focus next input
        if (value !== '' && index < 5) {
            otpInputRefs.current[index + 1].focus();
        }
    };

    const handleOtpKeyDown = (index, e) => {
        // Backspace navigation
        if (e.key === 'Backspace' && otp[index] === '' && index > 0) {
            otpInputRefs.current[index - 1].focus();
        }
    };

    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const otpString = otp.join('');
        if (otpString.length !== 6) {
            setError('Please enter all 6 digits of the OTP.');
            setLoading(false);
            return;
        }

        try {
            // 1. Verify OTP with Firebase
            const result = await confirmationResult.confirm(otpString);
            const user = result.user;
            const idToken = await user.getIdToken();

            // 2. Send ID Token to Backend to create session
            const loginResult = await login(idToken);

            if (loginResult.success) {
                navigate('/dashboard');
            } else {
                if (loginResult.isNewUser) {
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

    const handleGoogleLogin = () => {
        // Simulate Google Login redirect or functionality
        navigate('/register'); // As per login.html behavior hint: "Google authentication will redirect you to registration page"
    };

    return (
        <div className="bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 font-sans min-h-screen flex flex-col">
            {/* Navigation */}
            <nav className="bg-white shadow-sm sticky top-0 z-50 border-b border-green-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16 items-center">
                        <div className="flex items-center">
                            <Link to="/" className="flex-shrink-0 flex items-center">
                                <Sun className="text-green-600 h-6 w-6" />
                                <span className="ml-2 text-xl font-bold text-green-700">EcoFarming</span>
                            </Link>
                        </div>
                        <div className="flex items-center space-x-4">
                            <Link to="/get-started" className="text-gray-600 hover:text-green-600 font-medium">← Back</Link>
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
                            <h1 className="text-2xl font-bold text-gray-800">Welcome Back</h1>
                            <p className="text-gray-600 mt-1">Sign in with your mobile number</p>
                        </div>

                        {/* Body */}
                        <div className="px-6 pb-8 pt-6">
                            {/* Tab selector */}
                            <div className="flex gap-4 mb-6">
                                <button
                                    onClick={() => setLoginMethod('MOBILE')}
                                    className={`flex-1 pb-3 font-medium border-b-2 transition-colors ${loginMethod === 'MOBILE' ? 'text-green-600 border-green-600' : 'text-gray-500 border-transparent hover:text-green-600'}`}
                                >
                                    Mobile Login
                                </button>
                                <button
                                    onClick={() => setLoginMethod('GOOGLE')}
                                    className={`flex-1 pb-3 font-medium border-b-2 transition-colors ${loginMethod === 'GOOGLE' ? 'text-green-600 border-green-600' : 'text-gray-500 border-transparent hover:text-green-600'}`}
                                >
                                    Google Login
                                </button>
                            </div>

                            {error && (
                                <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm">
                                    {error}
                                </div>
                            )}

                            {loginMethod === 'MOBILE' ? (
                                <form onSubmit={step === 'MOBILE' ? handleSendOtp : handleVerifyOtp} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Mobile Number</label>
                                        <div className="flex gap-2">
                                            <span className="flex items-center px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg text-sm font-medium text-gray-700">+91</span>
                                            <input
                                                type="tel"
                                                value={mobile}
                                                onChange={(e) => setMobile(e.target.value)}
                                                className={`flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none ${step === 'OTP' ? 'bg-gray-50 text-gray-500' : ''}`}
                                                placeholder="Enter your mobile number"
                                                maxLength="10"
                                                required
                                                disabled={step === 'OTP'}
                                            />
                                        </div>
                                        {step === 'MOBILE' && <p className="text-xs text-gray-500 mt-1">10 digit mobile number required</p>}
                                    </div>

                                    {step === 'OTP' && (
                                        <div className="animate-fade-in-down">
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Enter OTP</label>
                                            <div className="flex gap-1 justify-between mb-2">
                                                {otp.map((digit, index) => (
                                                    <input
                                                        key={index}
                                                        ref={(el) => (otpInputRefs.current[index] = el)}
                                                        type="text"
                                                        maxLength="1"
                                                        value={digit}
                                                        onChange={(e) => handleOtpChange(index, e.target.value)}
                                                        onKeyDown={(e) => handleOtpKeyDown(index, e)}
                                                        className="w-full px-2 py-2 text-center text-xl border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                                                    />
                                                ))}
                                            </div>
                                            <div className="flex justify-between items-center mt-2">
                                                <p className="text-xs text-gray-500">OTP sent to +91 {mobile}</p>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setStep('MOBILE');
                                                        setOtp(['', '', '', '', '', '']);
                                                    }}
                                                    className="text-xs text-green-600 hover:text-green-700 font-medium"
                                                >
                                                    Change Number
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    <div id="recaptcha-container"></div>

                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2 rounded-lg transition flex justify-center items-center gap-2 mt-6"
                                    >
                                        {loading ? <Loader2 className="animate-spin w-5 h-5" /> : (step === 'MOBILE' ? 'Send OTP' : 'Verify & Login')}
                                    </button>
                                </form>
                            ) : (
                                <div className="space-y-4">
                                    <button
                                        type="button"
                                        onClick={handleGoogleLogin}
                                        className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                                    >
                                        <svg className="h-5 w-5" viewBox="0 0 24 24">
                                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                        </svg>
                                        <span className="font-medium text-gray-700">Sign in with Google</span>
                                    </button>
                                    <p className="text-xs text-center text-gray-500 mt-4">Google authentication will redirect you to registration page</p>
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 text-center text-sm text-gray-600">
                            <div className="mb-2">
                                Don't have an account? <Link to="/register" className="font-medium text-green-600 hover:text-green-700">Sign up here</Link>
                            </div>
                            <div>
                                <Link to="/admin/login" className="text-gray-400 hover:text-gray-600 transition-colors">
                                    Login as Institution
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
