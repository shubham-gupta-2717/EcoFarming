import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ShoppingCart, ArrowLeft, Plus, Search, Ticket, CreditCard, Check } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useStore } from '../context/StoreContext';
import { categories } from '../data/storeProducts';

const StoreCategory = () => {
    const { categoryId } = useParams();
    const navigate = useNavigate();
    const { addToCart, cartTotalItems } = useCart();
    const { products: allProducts } = useStore();
    const [showToast, setShowToast] = useState(false);
    const [toastProduct, setToastProduct] = useState(null);

    const categoryInfo = categories.find(c => c.id === categoryId);
    const products = allProducts.filter(p => p.category === categoryId);

    const handleAddToCart = (product) => {
        addToCart(product);
        setToastProduct(product);
        setShowToast(true);

        // Auto-hide toast after 3 seconds
        setTimeout(() => {
            setShowToast(false);
        }, 3000);
    };

    if (!categoryInfo) {
        return (
            <div className="p-8 text-center">
                <h2 className="text-2xl font-bold text-gray-800">Category not found</h2>
                <button
                    onClick={() => navigate('/dashboard/store')}
                    className="mt-4 text-eco-600 hover:underline"
                >
                    Back to Store
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-6 pb-10">
            {/* Toast Notification */}
            {showToast && (
                <div className="fixed top-20 right-4 z-50 animate-slide-in-right">
                    <div className="bg-white rounded-xl shadow-2xl border-2 border-eco-500 p-4 flex items-center gap-3 min-w-[300px]">
                        <div className="w-10 h-10 rounded-full bg-eco-500 flex items-center justify-center flex-shrink-0">
                            <Check className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1">
                            <p className="font-bold text-gray-900">Added to Cart!</p>
                            <p className="text-sm text-gray-600 line-clamp-1">{toastProduct?.name}</p>
                        </div>
                        <button
                            onClick={() => setShowToast(false)}
                            className="text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            ✕
                        </button>
                    </div>
                </div>
            )}

            {/* Header */}
            <div className="flex justify-between items-center sticky top-0 bg-eco-50/95 backdrop-blur-sm py-4 z-40 border-b border-eco-100">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate('/dashboard/store')}
                        className="p-2 hover:bg-white rounded-full transition-colors"
                    >
                        <ArrowLeft className="w-6 h-6 text-gray-600" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">{categoryInfo.label}</h1>
                        <p className="text-gray-600 text-sm">Browse our collection</p>
                    </div>
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

            {/* Products Grid */}
            {products.length === 0 ? (
                <div className="text-center py-20">
                    <p className="text-gray-500">No products found in this category.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {products.map(product => (
                        <div key={product.id} className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-all hover:-translate-y-1">
                            <div className="relative h-48 overflow-hidden">
                                <img
                                    src={product.image}
                                    alt={product.name}
                                    className="w-full h-full object-cover transition-transform hover:scale-110 duration-500"
                                    onError={(e) => {
                                        e.target.onerror = null;
                                        e.target.src = 'https://images.unsplash.com/photo-1530507629858-e4977d30e9e0?auto=format&fit=crop&q=80&w=400';
                                    }}
                                />
                                <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg text-sm font-bold text-gray-800 shadow-sm">
                                    ₹{product.price}
                                </div>
                                {product.category === 'vouchers' && (
                                    <div className="absolute top-2 left-2 bg-emerald-500/90 backdrop-blur-sm px-2 py-1 rounded-lg text-xs font-bold text-white shadow-sm flex items-center gap-1">
                                        <Ticket className="w-3 h-3" />
                                        Scratchable
                                    </div>
                                )}
                            </div>
                            <div className="p-4">
                                <h3 className="font-bold text-lg text-gray-800 mb-1">{product.name}</h3>
                                <p className="text-gray-600 text-sm mb-4 line-clamp-2">{product.description}</p>

                                {product.category === 'vouchers' && (
                                    <div className="mb-4 space-y-3">
                                        {/* Hidden Code Preview */}
                                        <div className="bg-gray-100 p-2 rounded-lg border border-dashed border-gray-300 flex items-center justify-between">
                                            <span className="text-xs font-bold text-gray-500 uppercase">Code</span>
                                            <div className="flex gap-1">
                                                <span className="w-2 h-2 rounded-full bg-gray-400"></span>
                                                <span className="w-2 h-2 rounded-full bg-gray-400"></span>
                                                <span className="w-2 h-2 rounded-full bg-gray-400"></span>
                                                <span className="w-2 h-2 rounded-full bg-gray-400"></span>
                                                <span className="w-2 h-2 rounded-full bg-gray-400"></span>
                                            </div>
                                            <div className="text-[10px] bg-gray-200 px-1.5 py-0.5 rounded text-gray-500 font-medium">
                                                Hidden
                                            </div>
                                        </div>

                                        <div className="bg-emerald-50 rounded-lg p-3 text-xs space-y-2">
                                            <div className="grid grid-cols-2 gap-2">
                                                <div>
                                                    <span className="block text-emerald-600 font-medium mb-0.5">Valid At:</span>
                                                    <span className="text-emerald-900 font-medium line-clamp-1" title={product.validAt}>{product.validAt}</span>
                                                </div>
                                                <div>
                                                    <span className="block text-emerald-600 font-medium mb-0.5">Valid For:</span>
                                                    <span className="text-emerald-900 font-medium">{product.validityDays} Days</span>
                                                </div>
                                                <div className="col-span-2">
                                                    <span className="block text-emerald-600 font-medium mb-0.5">Applicable On:</span>
                                                    <span className="text-emerald-900 font-medium">{product.applicableOn}</span>
                                                </div>
                                            </div>

                                            {product.terms && (
                                                <div className="text-emerald-600 pt-2 border-t border-emerald-100 mt-2">
                                                    <p className="font-medium mb-1">Terms:</p>
                                                    <ul className="list-disc list-inside space-y-0.5 opacity-80">
                                                        {product.terms.map((term, idx) => (
                                                            <li key={idx}>{term}</li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {product.isGiftCard ? (
                                    <button
                                        onClick={() => navigate(`/dashboard/store/redeem/${product.id}`)}
                                        className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-2 rounded-lg hover:shadow-lg hover:scale-[1.02] transition-all flex items-center justify-center gap-2 font-medium"
                                    >
                                        <CreditCard className="w-4 h-4" />
                                        Redeem Now
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => handleAddToCart(product)}
                                        className="w-full bg-eco-50 text-eco-700 py-2 rounded-lg hover:bg-eco-600 hover:text-white transition-all flex items-center justify-center gap-2 font-medium border border-eco-100 hover:border-transparent"
                                    >
                                        <Plus className="w-4 h-4" />
                                        Add to Cart
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default StoreCategory;
