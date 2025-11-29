import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Minus, Plus, X, ArrowLeft, Leaf, CreditCard, ShoppingCart, Truck, Store } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

const Cart = () => {
    const navigate = useNavigate();
    const { cart, removeFromCart, updateQuantity, clearCart, cartTotalAmount } = useCart();
    const { user, updateUser } = useAuth();

    // Fulfillment State
    const [fulfillmentType, setFulfillmentType] = useState('delivery'); // 'delivery' | 'pickup'
    const [selectedShop, setSelectedShop] = useState('');

    // Billing State
    const [useCredits, setUseCredits] = useState(false);
    const [creditAmount, setCreditAmount] = useState(0);
    const [isProcessing, setIsProcessing] = useState(false);

    // Billing Details State
    const [billingDetails, setBillingDetails] = useState({
        name: user?.name || '',
        street: '',
        city: '',
        state: '',
        zip: '',
        phone: user?.phone || ''
    });

    const userCredits = user?.credits || 750;

    // Mock Government Shops for Pickup
    const nearbyShops = [
        { id: 1, name: 'Kisan Seva Kendra, Karnal', distance: '2.5 km', address: 'Block A, District Center' },
        { id: 2, name: 'Govt. Agri Depot, Indri', distance: '5.0 km', address: 'Main Market, Indri' },
        { id: 3, name: 'Co-operative Society Store', distance: '8.2 km', address: 'Village Road, Taraori' }
    ];

    // Calculate Totals
    // Ensure credit amount doesn't exceed total or user balance
    useEffect(() => {
        if (useCredits) {
            const maxRedeemable = Math.min(cartTotalAmount, userCredits);
            // Default to max possible if just toggled on, or clamp if total changed
            setCreditAmount(prev => Math.min(prev || maxRedeemable, maxRedeemable));
        } else {
            setCreditAmount(0);
        }
    }, [useCredits, cartTotalAmount, userCredits]);

    const discount = creditAmount;
    const total = cartTotalAmount - discount;

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setBillingDetails(prev => ({ ...prev, [name]: value }));
    };

    const handleCheckout = async () => {
        // Validation
        if (fulfillmentType === 'delivery') {
            if (!billingDetails.name || !billingDetails.street || !billingDetails.city || !billingDetails.state || !billingDetails.zip || !billingDetails.phone) {
                alert('Please fill in all delivery details.');
                return;
            }
        } else {
            if (!selectedShop) {
                alert('Please select a shop for pickup.');
                return;
            }
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
            status: fulfillmentType === 'delivery' ? 'Processing' : 'Ready for Pickup',
            total: total,
            subtotal: cartTotalAmount,
            discount: discount,
            items: [...cart],
            fulfillmentType: fulfillmentType,
            deliveryDetails: fulfillmentType === 'delivery' ? billingDetails : null,
            pickupDetails: fulfillmentType === 'pickup' ? nearbyShops.find(s => s.id === Number(selectedShop)) : null,
            estimatedDelivery: fulfillmentType === 'delivery'
                ? new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
                : 'Available Immediately'
        };

        // Update user data using functional update to prevent race conditions
        updateUser(prevUser => {
            const currentOrders = prevUser.orders || [];
            const updatedData = {
                orders: [newOrder, ...currentOrders]
            };

            if (discount > 0) {
                updatedData.credits = (prevUser.credits || 0) - discount;

                const newTransaction = {
                    id: Date.now(),
                    type: 'debit',
                    amount: discount,
                    description: `Store Purchase - ${newOrder.id}`,
                    date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
                };

                updatedData.transactions = [newTransaction, ...(prevUser.transactions || [])];
            }

            console.log("Updating user with new order (functional):", updatedData);
            return updatedData;
        });

        // Save to global orders for Admin Panel visibility
        try {
            const globalOrders = JSON.parse(localStorage.getItem('all_orders') || '[]');
            const orderWithUser = {
                ...newOrder,
                userId: user.id || user.phone || 'unknown_user', // Attach user ID for filtering
                customer: billingDetails.name || user.name || 'Anonymous', // Ensure customer name is present
                location: fulfillmentType === 'delivery'
                    ? `${billingDetails.city}, ${billingDetails.state}`
                    : nearbyShops.find(s => s.id === Number(selectedShop))?.address || 'Pickup'
            };
            const updatedGlobalOrders = [orderWithUser, ...globalOrders];
            localStorage.setItem('all_orders', JSON.stringify(updatedGlobalOrders));
            console.log("Order saved to global storage:", orderWithUser);
        } catch (error) {
            console.error("Failed to save to global orders:", error);
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
                {/* Left Column: Cart Items & Fulfillment */}
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

                    {/* Fulfillment Options */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <h2 className="text-lg font-bold text-gray-800 mb-6">Delivery Options</h2>

                        <div className="flex gap-4 mb-6">
                            <button
                                onClick={() => setFulfillmentType('delivery')}
                                className={`flex-1 p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${fulfillmentType === 'delivery'
                                    ? 'border-eco-600 bg-eco-50 text-eco-800'
                                    : 'border-gray-200 hover:border-gray-300 text-gray-600'
                                    }`}
                            >
                                <Truck className="w-6 h-6" />
                                <span className="font-medium">Home Delivery</span>
                            </button>
                            <button
                                onClick={() => setFulfillmentType('pickup')}
                                className={`flex-1 p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${fulfillmentType === 'pickup'
                                    ? 'border-eco-600 bg-eco-50 text-eco-800'
                                    : 'border-gray-200 hover:border-gray-300 text-gray-600'
                                    }`}
                            >
                                <Store className="w-6 h-6" />
                                <span className="font-medium">Store Pickup</span>
                            </button>
                        </div>

                        {fulfillmentType === 'delivery' ? (
                            <div className="space-y-4 animate-fadeIn">
                                <h3 className="font-medium text-gray-900">Shipping Address</h3>
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
                        ) : (
                            <div className="space-y-4 animate-fadeIn">
                                <h3 className="font-medium text-gray-900">Select Pickup Location</h3>
                                <div className="grid gap-3">
                                    {nearbyShops.map(shop => (
                                        <label
                                            key={shop.id}
                                            className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all ${selectedShop == shop.id
                                                ? 'border-eco-600 bg-eco-50'
                                                : 'border-gray-200 hover:border-gray-300'
                                                }`}
                                        >
                                            <input
                                                type="radio"
                                                name="shop"
                                                value={shop.id}
                                                checked={selectedShop == shop.id}
                                                onChange={(e) => setSelectedShop(e.target.value)}
                                                className="mt-1 text-eco-600 focus:ring-eco-500"
                                            />
                                            <div>
                                                <p className="font-medium text-gray-900">{shop.name}</p>
                                                <p className="text-sm text-gray-500">{shop.address}</p>
                                                <p className="text-xs text-eco-600 font-medium mt-1">{shop.distance} away</p>
                                            </div>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Column: Order Summary */}
                <div className="lg:col-span-1">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 sticky top-4">
                        <h2 className="text-lg font-bold text-gray-800 mb-6">Order Summary</h2>

                        <div className="space-y-4 mb-6">
                            <div className="flex justify-between text-gray-600">
                                <span>Subtotal</span>
                                <span>₹{cartTotalAmount}</span>
                            </div>
                            <div className="flex justify-between text-gray-600">
                                <span>Shipping</span>
                                <span className="text-green-600">Free</span>
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
                                    <div className="pt-2 border-t border-eco-200">
                                        <div className="flex justify-between text-sm mb-2">
                                            <span className="text-eco-800">Redeem Amount</span>
                                            <span className="font-bold text-eco-800">{creditAmount}</span>
                                        </div>
                                        <input
                                            type="range"
                                            min="0"
                                            max={Math.min(cartTotalAmount, userCredits)}
                                            value={creditAmount}
                                            onChange={(e) => setCreditAmount(Number(e.target.value))}
                                            className="w-full h-2 bg-eco-200 rounded-lg appearance-none cursor-pointer accent-eco-600"
                                        />
                                        <div className="flex justify-between text-xs text-eco-600 mt-1">
                                            <span>0</span>
                                            <span>{Math.min(cartTotalAmount, userCredits)}</span>
                                        </div>
                                    </div>
                                )}

                                {useCredits && creditAmount > 0 && (
                                    <div className="flex justify-between text-eco-700 font-medium text-sm pt-2 mt-2 border-t border-eco-200">
                                        <span>Discount Applied</span>
                                        <span>- ₹{creditAmount}</span>
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
                                    {total === 0 ? 'Place Order' : `Pay ₹${total}`}
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
