import React, { useState } from 'react';
import { Link, useLocation, Outlet, useNavigate } from 'react-router-dom';
import { Home, ListTodo, Trophy, User, Leaf, Users, BookOpen, Sprout, RefreshCw, ShoppingBag, X, ArrowUpRight, ArrowDownLeft, Briefcase, Brain, AlertCircle, AlertTriangle, Landmark } from 'lucide-react';
import GoogleTranslate from './GoogleTranslate';
import { useAuth } from '../context/AuthContext';
import useEcoStore from '../store/useEcoStore';

const Layout = ({ children }) => {
    const location = useLocation();
    const navigate = useNavigate(); // Added useNavigate
    const { user } = useAuth();
    const { userProfile } = useEcoStore();
    // Removed showTransactions state

    // Prioritize real-time store data, fallback to auth user data
    const userCredits = userProfile?.credits ?? user?.credits ?? 750;

    const navItems = [
        { path: '/dashboard', icon: Home, label: 'Dashboard' },
        { path: '/dashboard/store', icon: ShoppingBag, label: 'Store' },
        { path: '/dashboard/missions', icon: ListTodo, label: 'Missions' },
        { path: '/dashboard/community', icon: Users, label: 'Community' },
        { path: '/dashboard/leaderboard', icon: Trophy, label: 'Leaderboard' },
        { path: '/dashboard/learning', icon: BookOpen, label: 'Learning' },
        { path: '/dashboard/quiz', icon: Brain, label: 'Quiz' },
        { path: '/dashboard/behavior', icon: Sprout, label: 'Impact' },
        { path: '/dashboard/offline', icon: RefreshCw, label: 'Sync' },
        { path: '/dashboard/tickets/new', icon: AlertCircle, label: 'Support Tickets' },
        { path: '/dashboard/disaster/new', icon: AlertTriangle, label: 'Emergency Help' },
        { path: '/dashboard/profile', icon: User, label: 'Profile' },
    ];

    if (['institution', 'admin', 'superadmin'].includes(user?.role)) {
        navItems.push({ path: '/institute/missions', icon: Briefcase, label: 'Manage Missions' });
    }

    return (
        <div className="min-h-screen bg-eco-50 flex flex-col md:flex-row">
            {/* Sidebar (Desktop) / Bottom Nav (Mobile) */}
            <nav className="bg-white shadow-lg md:w-64 md:h-screen fixed md:sticky md:top-0 bottom-0 w-full z-50 flex flex-col flex-shrink-0">
                <div className="p-4 hidden md:flex items-center gap-2 border-b flex-shrink-0">
                    <Leaf className="text-eco-600 w-8 h-8" />
                    <h1 className="text-2xl font-bold text-eco-800">EcoFarming</h1>
                </div>

                <div className="flex md:flex-col justify-around md:justify-start p-2 md:p-4 gap-2 overflow-y-auto flex-1">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = location.pathname === item.path;
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`flex flex-col md:flex-row items-center md:gap-3 p-2 rounded-lg transition-colors ${isActive
                                    ? 'bg-eco-100 text-eco-700'
                                    : 'text-gray-600 hover:bg-gray-50'
                                    }`}
                            >
                                <Icon className="w-6 h-6" />
                                <span className="text-xs md:text-base font-medium">{item.label}</span>
                            </Link>
                        );
                    })}
                </div>
            </nav>

            {/* Main Content */}
            <div className="flex-1 flex flex-col">
                <header className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center sticky top-0 z-40">
                    <div className="flex items-center gap-2">
                        <Leaf className="w-6 h-6 text-eco-600 md:hidden" />
                        <h1 className="text-xl font-bold text-eco-700 md:hidden">EcoFarming</h1>
                        <h2 className="text-xl font-bold text-gray-800 hidden md:block">
                            {navItems.find(item => item.path === location.pathname)?.label || 'Dashboard'}
                        </h2>
                    </div>

                    <div className="flex items-center gap-4">
                        {/* EcoCredit Button */}
                        <button
                            onClick={() => navigate('/dashboard/missions', { state: { initialTab: 'credit_history' } })}
                            className="hidden md:flex items-center gap-2 bg-eco-50 hover:bg-eco-100 text-eco-700 px-4 py-2 rounded-full transition-colors border border-eco-200"
                        >
                            <div className="w-6 h-6 rounded-full bg-eco-200 flex items-center justify-center">
                                <Leaf className="w-4 h-4 text-eco-700" />
                            </div>
                            <span className="font-bold">{userCredits}</span>
                            <span className="text-xs font-medium opacity-80">Credits</span>
                        </button>

                        <GoogleTranslate />
                    </div>
                </header>

                <main className="flex-1 p-4 pb-20 md:p-8 overflow-y-auto">
                    <div className="max-w-4xl mx-auto">
                        <Outlet />
                    </div>
                </main>
            </div>
            {/* Removed Legacy Transactions Modal */}
        </div>
    );
};

export default Layout;
