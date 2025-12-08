import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, CreditCard, Landmark, CheckCircle, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useStore } from '../context/StoreContext';

const GiftCardRedemption = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user, updateUser } = useAuth();
    const { products } = useStore();

    const product = products.find(p => p.id === Number(id));

    const [amount, setAmount] = useState(10);
    const [paymentMethod, setPaymentMethod] = useState('upi'); // 'upi' or 'bank'
    const [details, setDetails] = useState({
        upiId: '',
        accountName: '',
        accountNumber: '',
        ifsc: ''
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(false);

    const creditsNeeded = amount * 10;
    const userCredits = user?.credits ?? 0;

    const handleAmountSelect = (val) => {
        setAmount(val);
        setError('');
    };

    const handleInputChange = (e) => {
        setDetails({ ...details, [e.target.name]: e.target.value });
        setError('');
    };

    const handleRedeem = async () => {
        // Validation
        if (creditsNeeded > userCredits) {
            setError(`Insufficient credits. You need ${creditsNeeded} credits.`);
            return;
        }

        if (paymentMethod === 'upi' && !details.upiId) {
            setError('Please enter your UPI ID.');
            return;
        }

        if (paymentMethod === 'bank' && (!details.accountName || !details.accountNumber || !details.ifsc)) {
            setError('Please fill in all bank details.');
            return;
        }

        setLoading(true);

        // Simulate API call
        // Simulate API call
        setTimeout(() => {
            // Deduct credits
            const newCredits = userCredits - creditsNeeded;

            // Create Order Object
            const newOrder = {
                id: `ORD-${Date.now()}`,
                date: new Date().toISOString().split('T')[0],
                purchaseDate: new Date().toISOString(),
                status: 'Redeemed',
                total: amount, // Value in Rupees
                items: [{
                    ...product,
                    price: amount, // Override price with redeemed amount
                    quantity: 1,
                    redeemedCredits: creditsNeeded
                }],
                deliveryMethod: 'online', // Virtual delivery
                billingDetails: {
                    name: paymentMethod === 'upi' ? details.upiId : details.accountName,
                    method: paymentMethod === 'upi' ? 'UPI Transfer' : 'Bank Transfer',
                    details: paymentMethod === 'upi' ? details.upiId : `Acc: ${details.accountNumber}, IFSC: ${details.ifsc}`
                },
                estimatedDelivery: '2-3 Business Days'
            };

            const updatedOrders = [newOrder, ...(user.orders || [])];

            updateUser({
                credits: newCredits,
                orders: updatedOrders
            });

            setSuccess(true);
            setLoading(false);
        }, 1500);
    };

    if (success) {
        return (
            <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-2xl shadow-xl text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Redemption Successful!</h2>
                <p className="text-gray-600 mb-6">
                    You have successfully redeemed <strong>{creditsNeeded} Credits</strong> for <strong>₹{amount}</strong>.
                </p>
                <div className="bg-blue-50 p-4 rounded-xl mb-6 text-sm text-blue-800">
                    <p>Money will reflect in your account within <strong>2-3 business days</strong>.</p>
                </div>
                <button
                    onClick={() => navigate('/dashboard/store')}
                    className="w-full bg-eco-600 text-white py-3 rounded-xl font-bold hover:bg-eco-700 transition-colors"
                >
                    Return to Store
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto pb-10">
            {/* Header */}
            <div className="flex items-center gap-4 py-6 mb-2">
                <button
                    onClick={() => navigate(-1)}
                    className="p-2 hover:bg-white rounded-full transition-colors"
                >
                    <ArrowLeft className="w-6 h-6 text-gray-600" />
                </button>
                <h1 className="text-2xl font-bold text-gray-800">Redeem Gift Card</h1>
            </div>

            <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
                {/* Product Info */}
                <div className="p-6 bg-gradient-to-r from-emerald-50 to-teal-50 border-b border-emerald-100">
                    <div className="flex items-center gap-4">
                        <img src={product.image} alt={product.name} className="w-16 h-16 rounded-lg object-cover shadow-sm" />
                        <div>
                            <h2 className="font-bold text-lg text-gray-800">{product.name}</h2>
                            <p className="text-sm text-gray-600">Exchange Rate: 100 Credits = ₹10</p>
                        </div>
                    </div>
                </div>

                <div className="p-6 space-y-8">
                    {/* Amount Selection */}
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-3">Select Amount</label>
                        <div className="grid grid-cols-4 gap-3">
                            {[10, 50, 100, 500].map((val) => (
                                <button
                                    key={val}
                                    onClick={() => handleAmountSelect(val)}
                                    className={`py-2 px-4 rounded-xl font-bold border-2 transition-all ${amount === val
                                        ? 'border-eco-500 bg-eco-50 text-eco-700'
                                        : 'border-gray-200 text-gray-600 hover:border-eco-200'
                                        }`}
                                >
                                    ₹{val}
                                </button>
                            ))}
                        </div>
                        <div className="mt-2 text-right text-sm">
                            Cost: <span className="font-bold text-orange-600">{creditsNeeded} Credits</span>
                        </div>
                    </div>

                    {/* Payment Method */}
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-3">Payout Method</label>
                        <div className="flex gap-4 mb-4">
                            <button
                                onClick={() => setPaymentMethod('upi')}
                                className={`flex-1 py-3 px-4 rounded-xl border-2 flex items-center justify-center gap-2 transition-all ${paymentMethod === 'upi'
                                    ? 'border-eco-500 bg-eco-50 text-eco-700'
                                    : 'border-gray-200 text-gray-600'
                                    }`}
                            >
                                <CreditCard className="w-5 h-5" />
                                UPI
                            </button>
                            <button
                                onClick={() => setPaymentMethod('bank')}
                                className={`flex-1 py-3 px-4 rounded-xl border-2 flex items-center justify-center gap-2 transition-all ${paymentMethod === 'bank'
                                    ? 'border-eco-500 bg-eco-50 text-eco-700'
                                    : 'border-gray-200 text-gray-600'
                                    }`}
                            >
                                <Landmark className="w-5 h-5" />
                                Bank Transfer
                            </button>
                        </div>

                        {/* Input Fields */}
                        <div className="space-y-4 bg-gray-50 p-4 rounded-xl">
                            {paymentMethod === 'upi' ? (
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">UPI ID</label>
                                    <input
                                        type="text"
                                        name="upiId"
                                        value={details.upiId}
                                        onChange={handleInputChange}
                                        placeholder="e.g. farmer@upi"
                                        className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-eco-500 outline-none"
                                    />
                                </div>
                            ) : (
                                <>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Account Holder Name</label>
                                        <input
                                            type="text"
                                            name="accountName"
                                            value={details.accountName}
                                            onChange={handleInputChange}
                                            className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-eco-500 outline-none"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Account Number</label>
                                            <input
                                                type="text"
                                                name="accountNumber"
                                                value={details.accountNumber}
                                                onChange={handleInputChange}
                                                className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-eco-500 outline-none"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">IFSC Code</label>
                                            <input
                                                type="text"
                                                name="ifsc"
                                                value={details.ifsc}
                                                onChange={handleInputChange}
                                                className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-eco-500 outline-none"
                                            />
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-lg text-sm">
                            <AlertCircle className="w-5 h-5" />
                            {error}
                        </div>
                    )}

                    {/* Action Button */}
                    <button
                        onClick={handleRedeem}
                        disabled={loading}
                        className={`w-full py-4 rounded-xl font-bold text-white text-lg shadow-lg transition-all ${loading
                            ? 'bg-gray-400 cursor-not-allowed'
                            : 'bg-gradient-to-r from-eco-600 to-emerald-600 hover:shadow-xl active:scale-95'
                            }`}
                    >
                        {loading ? 'Processing...' : `Redeem for ₹${amount}`}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default GiftCardRedemption;
