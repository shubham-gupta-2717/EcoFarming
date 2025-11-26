import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Minus, Plus, X, ArrowLeft, Leaf, CreditCard, ShoppingCart } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

const Cart = () => {
    const navigate = useNavigate();
    const { cart, removeFromCart, updateQuantity, clearCart, cartTotalAmount } = useCart();
    const { user, updateUser } = useAuth();
    const [useCredits, setUseCredits] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);

    // Billing State
    const [billingDetails, setBillingDetails] = useState({
        name: user?.name || '',
        street: '',
        city: '',
        state: '',
        zip: '',
        phone: user?.phone || ''
    });

    const userCredits = user?.credits || 750;
    const discount = useCredits ? Math.min(cartTotalAmount, userCredits) : 0;
    const total = cartTotalAmount - discount;

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setBillingDetails(prev => ({ ...prev, [name]: value }));
    };

    const handleCheckout = async () => {
        // Validation
        if (!billingDetails.name || !billingDetails.street || !billingDetails.city || !billingDetails.state || !billingDetails.zip || !billingDetails.phone) {
            alert('Please fill in all billing details.');
            return;
        }

        setIsProcessing(true);

        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500));

        let updatedUserData = {};

        // Create Order Object
        const newOrder = {
            id: `ORD-${Date.now()}`,
            date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
            purchaseDate: new Date().toISOString(),
            status: 'Processing',
            total: total,
            items: [...cart],
            billingDetails: billingDetails,
            estimatedDelivery: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
        };

        const currentOrders = user.orders || [];
        updatedUserData.orders = [newOrder, ...currentOrders];

        if (useCredits && discount > 0) {
            const newCredits = userCredits - discount;

            const newTransaction = {
                id: Date.now(),
                type: 'debit',
                amount: discount,
                description: `Store Purchase - ${newOrder.id}`,
                date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
            };

            const currentTransactions = user.transactions || [];
            updatedUserData.credits = newCredits;
            updatedUserData.transactions = [newTransaction, ...currentTransactions];
        }

        // Update user data if there are changes
        if (Object.keys(updatedUserData).length > 0) {
            updateUser(updatedUserData);
        }

        alert(`Order Placed Successfully! \nOrder ID: ${newOrder.id}`);
        clearCart();
        setIsProcessing(false);
        navigate('/dashboard/store/orders');
    };

    if (cart.length === 0) {
        return (
            <div className="max-w-4xl mx-auto p-6">
                <button
                    onClick={() => navigate('/dashboard/store')}
                    className="flex items-center text-gray-600 hover:text-eco-600 mb-8 transition-colors"
                >
                    <ArrowLeft className="w-5 h-5 mr-2" />
                    Back to Store
                </button>
                <div className="text-center py-20 bg-white rounded-2xl shadow-sm">
                    <div className="bg-gray-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                        <ShoppingCart className="w-10 h-10 text-gray-400" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Your cart is empty</h2>
                    <p className="text-gray-500 mb-8">Looks like you haven't added anything to your cart yet.</p>
                    <button
                        onClick={() => navigate('/dashboard/store')}
                        className="bg-eco-600 text-white px-8 py-3 rounded-xl hover:bg-eco-700 transition-colors font-medium"
                    >
                        Start Shopping
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto p-6">
            <button
                onClick={() => navigate('/dashboard/store')}
                className="flex items-center text-gray-600 hover:text-eco-600 mb-6 transition-colors"
            >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Back to Store
            </button>

            <h1 className="text-2xl font-bold text-gray-800 mb-8">Shopping Cart & Checkout</h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Cart Items & Delivery Options */}
                <div className="lg:col-span-2 space-y-8">

                    {/* Cart Items */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <h2 className="text-lg font-bold text-gray-800 mb-4">Cart Items ({cart.length})</h2>
                        <div className="space-y-4">
                            {cart.map(item => (
                                <div key={item.id} className="flex gap-4 py-4 border-b last:border-0 border-gray-100">
                                    <img
                                        src={item.image}
                                        alt={item.name}
                                        className="w-20 h-20 object-cover rounded-lg"
                                    />
                                    <div className="flex-1 flex flex-col justify-between">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h3 className="font-semibold text-gray-800">{item.name}</h3>
                                                <p className="text-sm text-gray-500">{item.category}</p>
                                            </div>
                                            <button
                                                onClick={() => removeFromCart(item.id)}
                                                className="text-gray-400 hover:text-red-500 transition-colors"
                                            >
                                                <X className="w-5 h-5" />
                                            </button>
                                        </div>

                                        <div className="flex justify-between items-end">
                                            <div className="flex items-center gap-3 bg-gray-50 rounded-lg p-1">
                                                <button
                                                    onClick={() => updateQuantity(item.id, -1)}
                                                    className="p-1 hover:bg-white rounded-md shadow-sm transition-all"
                                                >
                                                    <Minus className="w-4 h-4 text-gray-600" />
                                                </button>
                                                <span className="font-medium w-8 text-center">{item.quantity}</span>
                                                <button
                                                    onClick={() => updateQuantity(item.id, 1)}
                                                    className="p-1 hover:bg-white rounded-md shadow-sm transition-all"
                                                >
                                                    <Plus className="w-4 h-4 text-gray-600" />
                                                </button>
                                            </div>
                                            <p className="font-bold text-gray-900">₹{item.price * item.quantity}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Billing Details */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <h2 className="text-lg font-bold text-gray-800 mb-6">Billing Details</h2>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Contact Name</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={billingDetails.name}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-eco-500 focus:border-transparent outline-none transition-all"
                                    placeholder="Full Name"
                                />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Street Address</label>
                                    <input
                                        type="text"
                                        name="street"
                                        value={billingDetails.street}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-eco-500 focus:border-transparent outline-none transition-all"
                                        placeholder="House No, Street Name"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                                    <input
                                        type="text"
                                        name="city"
                                        value={billingDetails.city}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-eco-500 focus:border-transparent outline-none transition-all"
                                        placeholder="City"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                                    <input
                                        type="text"
                                        name="state"
                                        value={billingDetails.state}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-eco-500 focus:border-transparent outline-none transition-all"
                                        placeholder="State"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">ZIP Code</label>
                                    <input
                                        type="text"
                                        name="zip"
                                        value={billingDetails.zip}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-eco-500 focus:border-transparent outline-none transition-all"
                                        placeholder="ZIP Code"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={billingDetails.phone}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-eco-500 focus:border-transparent outline-none transition-all"
                                        placeholder="+91 98765 43210"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Billing Summary */}
                <div className="lg:col-span-1">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 sticky top-4">
                        <h2 className="text-lg font-bold text-gray-800 mb-6">Order Summary</h2>

                        <div className="space-y-4 mb-6">
                            <div className="flex justify-between text-gray-600">
                                <span>Subtotal</span>
                                <span>₹{cartTotalAmount}</span>
                            </div>



                            <div className="bg-eco-50 p-4 rounded-xl border border-eco-100">
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                        <Leaf className="w-5 h-5 text-eco-600" />
                                        <span className="font-medium text-eco-900">EcoCredits</span>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            className="sr-only peer"
                                            checked={useCredits}
                                            onChange={(e) => setUseCredits(e.target.checked)}
                                            disabled={userCredits === 0}
                                        />
                                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-eco-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-eco-600"></div>
                                    </label>
                                </div>
                                <p className="text-xs text-eco-700 mb-2">Available Balance: {userCredits}</p>
                                {useCredits && (
                                    <div className="flex justify-between text-eco-700 font-medium text-sm pt-2 border-t border-eco-200">
                                        <span>Discount Applied</span>
                                        <span>- ₹{discount}</span>
                                    </div>
                                )}
                            </div>

                            <div className="border-t pt-4">
                                <div className="flex justify-between items-end">
                                    <span className="text-gray-600">Total Amount</span>
                                    <span className="text-2xl font-bold text-gray-900">₹{total}</span>
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={handleCheckout}
                            disabled={isProcessing}
                            className="w-full bg-gray-900 text-white py-4 rounded-xl hover:bg-gray-800 transition-colors flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {isProcessing ? (
                                <span className="animate-pulse">Processing...</span>
                            ) : (
                                <>
                                    <CreditCard className="w-5 h-5" />
                                    Place Order
                                </>
                            )}
                        </button>
                        <p className="text-xs text-center text-gray-500 mt-4">
                            Secure payment powered by EcoPay
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Cart;
