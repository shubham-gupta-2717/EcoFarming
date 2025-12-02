import React, { useState } from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import { Home, ListTodo, Trophy, User, Leaf, Users, BookOpen, Sprout, RefreshCw, ShoppingBag, X, ArrowUpRight, ArrowDownLeft, Briefcase, Brain, AlertCircle, AlertTriangle } from 'lucide-react';
import GoogleTranslate from './GoogleTranslate';
import { useAuth } from '../context/AuthContext';
import useEcoStore from '../store/useEcoStore';

const Layout = ({ children }) => {
    const location = useLocation();
    const { user } = useAuth();
    const { userProfile } = useEcoStore();
    const [showTransactions, setShowTransactions] = useState(false);

    // Prioritize real-time store data, fallback to auth user data
    const userCredits = userProfile?.credits ?? user?.credits ?? 750;

    // Use real transactions from user object, fallback to empty array
    // Note: If transactions are also synced to store, use that. For now, user object might be stale.
    // Ideally transactions should be fetched or synced.
    const transactions = userProfile?.transactions || user?.transactions || [];

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
        { path: '/dashboard/disaster/new', icon: AlertTriangle, label: 'Emergency Help' }, // NEW
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
                            onClick={() => setShowTransactions(true)}
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

            {/* Transactions Modal */}
            {showTransactions && (
                <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="p-6 border-b bg-eco-50 flex justify-between items-center">
                            <div>
                                <h3 className="text-lg font-bold text-gray-900">Transaction History</h3>
                                <p className="text-sm text-gray-500">Your recent EcoCredit activity</p>
                            </div>
                            <button
                                onClick={() => setShowTransactions(false)}
                                className="p-2 hover:bg-white rounded-full transition-colors"
                            >
                                <X className="w-5 h-5 text-gray-500" />
                            </button>
                        </div>

                        <div className="p-6 max-h-[60vh] overflow-y-auto">
                            <div className="bg-gradient-to-r from-eco-600 to-eco-500 rounded-xl p-6 text-white mb-6 shadow-md">
                                <p className="text-eco-100 text-sm mb-1">Current Balance</p>
                                <h2 className="text-3xl font-bold flex items-center gap-2">
                                    {userCredits} <span className="text-lg font-normal opacity-80">Credits</span>
                                </h2>
                            </div>

                            <div className="space-y-4">
                                {transactions.length === 0 ? (
                                    <div className="text-center py-8 text-gray-500">
                                        <p>No transactions yet</p>
                                    </div>
                                ) : (
                                    transactions.map(tx => (
                                        <div key={tx.id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors border border-transparent hover:border-gray-100">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${tx.type === 'credit' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                                                    }`}>
                                                    {tx.type === 'credit' ? <ArrowDownLeft className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
                                                </div>
                                                <div>
                                                    <p className="font-medium text-gray-800">{tx.description}</p>
                                                    <p className="text-xs text-gray-500">{tx.date}</p>
                                                </div>
                                            </div>
                                            <span className={`font-bold ${tx.type === 'credit' ? 'text-green-600' : 'text-red-600'
                                                }`}>
                                                {tx.type === 'credit' ? '+' : '-'}{tx.amount}
                                            </span>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        <div className="p-4 border-t bg-gray-50 text-center">
                            <button
                                onClick={() => setShowTransactions(false)}
                                className="text-gray-600 hover:text-gray-900 text-sm font-medium"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Layout;
