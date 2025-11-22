import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ShieldCheck, Loader2, Leaf } from 'lucide-react';

const AdminLogin = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { loginAdmin } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const result = await loginAdmin(email, password);

        if (result.success) {
            navigate('/admin/dashboard');
        } else {
            setError(result.message);
        }
        setLoading(false);
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
                                <ShieldCheck className="w-8 h-8 text-green-600" />
                            </div>
                            <h1 className="text-2xl font-bold text-gray-800">Institution Portal</h1>
                            <p className="text-gray-600 mt-1">Restricted Access</p>
                        </div>

                        {/* Body */}
                        <div className="px-6 pb-8 pt-6">
                            {error && (
                                <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm">
                                    {error}
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                                        placeholder="institution@ecofarming.com"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                                    <input
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                                        placeholder="••••••••"
                                        required
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2 rounded-lg transition flex justify-center items-center gap-2"
                                >
                                    {loading ? <Loader2 className="animate-spin w-5 h-5" /> : 'Login to Dashboard'}
                                </button>
                            </form>
                        </div>

                        {/* Footer */}
                        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 text-center text-sm text-gray-600">
                            <Link
                                to="/login"
                                className="font-medium text-gray-500 hover:text-green-600 transition"
                            >
                                Switch to Farmer Login
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminLogin;
