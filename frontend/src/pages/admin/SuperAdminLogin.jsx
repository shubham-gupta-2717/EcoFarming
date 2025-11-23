import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Leaf, Lock, Mail, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/landing/Navbar';
import Footer from '../../components/landing/Footer';

const SuperAdminLogin = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
        setError('');
    };

    const { setSession } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await fetch('http://localhost:5000/api/admin/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (response.ok) {
                // Update global auth state
                const user = { email: formData.email, role: 'superadmin' };
                setSession(data.token, user);

                // Also keep the specific admin keys if needed for other components, 
                // but AuthContext is the primary source of truth now.
                localStorage.setItem('adminToken', data.token);
                localStorage.setItem('adminRole', 'superadmin');

                navigate('/super-admin/dashboard');
            } else {
                setError(data.message || 'Login failed');
            }
        } catch (err) {
            setError('Failed to connect to server');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
            <Navbar />

            <div className="flex-grow flex items-center justify-center px-4 py-12">
                <div className="max-w-md w-full bg-white rounded-3xl shadow-xl overflow-hidden">
                    <div className="bg-green-600 px-8 py-10 text-center relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-full bg-green-700 opacity-20 transform -skew-y-6 origin-top-left"></div>
                        <div className="relative z-10">
                            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                                <Leaf className="w-8 h-8 text-green-600" />
                            </div>
                            <h2 className="text-3xl font-bold text-white">Super Admin</h2>
                            <p className="text-green-100 mt-2">Secure Access Portal</p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="p-8 space-y-6">
                        {error && (
                            <div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl text-sm font-medium border border-red-100">
                                {error}
                            </div>
                        )}

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 ml-1">Email Address</label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
                                <input
                                    type="email"
                                    name="email"
                                    required
                                    className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition-all"
                                    placeholder="admin@ecofarming.in"
                                    value={formData.email}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 ml-1">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
                                <input
                                    type="password"
                                    name="password"
                                    required
                                    className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition-all"
                                    placeholder="••••••••"
                                    value={formData.password}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-green-600 text-white font-bold text-lg py-3.5 rounded-xl hover:bg-green-700 shadow-lg hover:shadow-green-200 transition-all flex items-center justify-center gap-2 transform hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Authenticating...' : 'Login to Dashboard'}
                            {!loading && <ArrowRight className="w-5 h-5" />}
                        </button>
                    </form>
                </div>
            </div>

            <Footer />
        </div>
    );
};

export default SuperAdminLogin;
