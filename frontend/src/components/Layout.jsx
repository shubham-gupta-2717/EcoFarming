import React from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import { Home, ListTodo, Trophy, User, Leaf, Users, BookOpen, Sprout, RefreshCw } from 'lucide-react';
import LanguageSelector from './LanguageSelector';

const Layout = ({ children }) => {
    const location = useLocation();

    const navItems = [
        { path: '/', icon: Home, label: 'Dashboard' },
        { path: '/missions', icon: ListTodo, label: 'Missions' },
        { path: '/community', icon: Users, label: 'Community' },
        { path: '/leaderboard', icon: Trophy, label: 'Leaderboard' },
        { path: '/learning', icon: BookOpen, label: 'Learning' },
        { path: '/behavior', icon: Sprout, label: 'Impact' },
        { path: '/offline', icon: RefreshCw, label: 'Sync' },
        { path: '/profile', icon: User, label: 'Profile' },
    ];

    return (
        <div className="min-h-screen bg-eco-50 flex flex-col md:flex-row">
            {/* Sidebar (Desktop) / Bottom Nav (Mobile) */}
            <nav className="bg-white shadow-lg md:w-64 md:h-screen fixed md:static bottom-0 w-full z-50">
                <div className="p-4 hidden md:flex items-center gap-2 border-b">
                    <Leaf className="text-eco-600 w-8 h-8" />
                    <h1 className="text-2xl font-bold text-eco-800">EcoFarming</h1>
                </div>

                <div className="flex md:flex-col justify-around md:justify-start p-2 md:p-4 gap-2">
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
                <header className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <Leaf className="w-6 h-6 text-eco-600" />
                        <h1 className="text-xl font-bold text-eco-700">EcoFarming</h1>
                    </div>
                    <LanguageSelector />
                </header>

                <main className="flex-1 p-4 pb-20 md:p-8 overflow-y-auto">
                    <div className="max-w-4xl mx-auto">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
};

export default Layout;
