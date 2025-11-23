import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, Leaf, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { categories } from '../data/storeProducts';

const Store = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { cartTotalItems } = useCart();

    const userCredits = user?.credits || 750;

    return (
        <div className="space-y-8 pb-10">
            {/* Header */}
            <div className="flex justify-between items-center sticky top-0 bg-eco-50/95 backdrop-blur-sm py-4 z-40 border-b border-eco-100">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">EcoStore</h1>
                    <p className="text-gray-600">Spend your EcoCredits on farming essentials</p>
                </div>
                <button
                    onClick={() => navigate('/dashboard/store/cart')}
                    className="relative p-3 bg-white rounded-full shadow-md hover:bg-gray-50 transition-all hover:scale-105 active:scale-95"
                >
                    <ShoppingCart className="w-6 h-6 text-eco-600" />
                    {cartTotalItems > 0 && (
                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full animate-bounce">
                            {cartTotalItems}
                        </span>
                    )}
                </button>
            </div>

            {/* Credit Balance Card */}
            {/* Credit Balance Card */}
            <div className="relative overflow-hidden bg-gradient-to-br from-emerald-800 to-teal-900 rounded-2xl p-8 text-white shadow-2xl border border-emerald-700/50">
                {/* Decorative Elements */}
                <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-emerald-500/20 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-40 h-40 bg-teal-500/20 rounded-full blur-3xl"></div>

                <div className="relative z-10">
                    <div className="flex justify-between items-start mb-8">
                        <div>
                            <p className="text-emerald-200 text-sm font-medium tracking-wider uppercase mb-2">EcoWallet Balance</p>
                            <div className="flex items-baseline gap-2">
                                <h2 className="text-5xl font-bold tracking-tight text-white">{userCredits}</h2>
                                <span className="text-xl text-emerald-200 font-medium">Credits</span>
                            </div>
                        </div>
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-400/20 to-teal-400/20 backdrop-blur-md border border-white/10 flex items-center justify-center">
                            <Leaf className="w-6 h-6 text-emerald-400" />
                        </div>
                    </div>

                    <div className="flex items-center justify-between pt-6 border-t border-white/10">
                        <div className="flex items-center gap-3">
                            <div className="flex -space-x-2">
                                <div className="w-8 h-8 rounded-full bg-emerald-500/20 border-2 border-emerald-900 flex items-center justify-center text-[10px]">🌾</div>
                                <div className="w-8 h-8 rounded-full bg-teal-500/20 border-2 border-emerald-900 flex items-center justify-center text-[10px]">🚜</div>
                            </div>
                            <span className="text-sm text-emerald-300">Redeem on any item</span>
                        </div>
                        <div className="text-xs font-mono text-emerald-400/80">
                            ID: **** 8842
                        </div>
                    </div>
                </div>
            </div>

            {/* Categories Grid */}
            <div>
                <h2 className="text-xl font-bold text-gray-800 mb-6">Browse Categories</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {categories.map(category => (
                        <div
                            key={category.id}
                            onClick={() => navigate(`/dashboard/store/category/${category.id}`)}
                            className="group relative h-48 rounded-2xl overflow-hidden cursor-pointer shadow-md hover:shadow-xl transition-all"
                        >
                            <img
                                src={category.image}
                                alt={category.label}
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex flex-col justify-end p-6">
                                <div className="transform translate-y-2 group-hover:translate-y-0 transition-transform">
                                    <h3 className="text-2xl font-bold text-white mb-1">{category.label}</h3>
                                    <div className="flex items-center text-eco-300 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <span className="text-sm font-medium">View Products</span>
                                        <ArrowRight className="w-4 h-4 ml-2" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Store;
