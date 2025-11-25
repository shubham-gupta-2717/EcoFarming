import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Package, CheckCircle, Truck, Calendar, MapPin, Store, Ticket, X } from 'lucide-react';
import { storeProducts } from '../data/storeProducts';
import ScratchCard from '../components/ScratchCard';
import VoucherModal from '../components/VoucherModal';

import { useAuth } from '../context/AuthContext';

const Orders = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('current');
    const [selectedVoucher, setSelectedVoucher] = useState(null);

    // Real Data from User Profile
    // Real Data from User Profile
    const allOrders = user?.orders || [];

    const historyOrders = [
        {
            id: 'ORD-2024-002',
            date: '2024-11-10',
            purchaseDate: '2024-11-10T10:00:00.000Z',
            status: 'Delivered',
            total: 850,
            items: [
                {
                    id: 10,
                    name: 'Crop Insurance Form',
                    category: 'schemes',
                    price: 30,
                    image: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&q=80&w=400',
                    quantity: 1
                },
                {
                    id: 3,
                    name: 'Fertilizer Subsidy Voucher',
                    category: 'vouchers',
                    price: 50,
                    image: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&q=80&w=400',
                    couponCode: 'FERT200OFF',
                    validity: 'Valid for 3 months',
                    validityDays: 90,
                    validAt: 'All Authorized Fertilizer Dealers',
                    applicableOn: 'Chemical & Organic Fertilizers',
                    terms: ['Minimum purchase ₹1000', 'Valid on all fertilizer brands'],
                    quantity: 1
                }
            ],
            deliveredDate: '2024-11-15',
            deliveryMethod: 'online',
            deliveryDetails: {
                street: '123 Farm Road',
                city: 'Karnal',
                state: 'Haryana',
                zip: '132001'
            }
        },
        {
            id: 'ORD-2024-003',
            date: '2024-10-25',
            purchaseDate: '2024-10-25T10:00:00.000Z',
            status: 'Delivered',
            total: 450,
            items: [
                {
                    id: 20,
                    name: 'Organic Certification',
                    category: 'schemes',
                    price: 150,
                    image: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&q=80&w=400',
                    quantity: 1
                }
            ],
            deliveredDate: '2024-10-30',
            deliveryMethod: 'offline',
            deliveryDetails: {
                name: 'Kisan Seva Kendra',
                address: 'Block A, District Center, Karnal, Haryana'
            }
        }
    ];

    // Helper to check if an order is active (has valid vouchers or is not delivered/cancelled)
    const isOrderActive = (order) => {
        // If status is not final, it's active
        if (order.status !== 'Delivered' && order.status !== 'Picked Up' && order.status !== 'Cancelled') {
            return true;
        }

        // If it has vouchers, check if ANY voucher is still valid
        const hasVouchers = order.items?.some(item => item.category === 'vouchers');
        if (hasVouchers) {
            const purchaseDate = new Date(order.purchaseDate || order.date); // Fallback to date string if purchaseDate missing
            const today = new Date();

            // Check if any voucher in the order is still valid
            const hasValidVoucher = order.items.some(item => {
                if (item.category !== 'vouchers') return false;

                // If no validityDays specified, assume it doesn't expire based on days (or use default)
                if (!item.validityDays) return false;

                const expiryDate = new Date(purchaseDate);
                expiryDate.setDate(expiryDate.getDate() + item.validityDays);

                return today <= expiryDate;
            });

            return hasValidVoucher;
        }

        // If no vouchers and status is final, it's history
        return false;
    };

    const activeOrders = allOrders.filter(isOrderActive);
    const pastOrders = [...allOrders.filter(o => !isOrderActive(o)), ...historyOrders];

    const orders = activeTab === 'current' ? activeOrders : pastOrders;

    return (
        <div className="max-w-4xl mx-auto pb-10">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
                <button
                    onClick={() => navigate(-1)}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                    <ArrowLeft className="w-6 h-6 text-gray-600" />
                </button>
                <h1 className="text-2xl font-bold text-gray-800">Your Orders</h1>
            </div>

            {/* Tabs */}
            <div className="flex gap-4 mb-8 border-b border-gray-200">
                <button
                    onClick={() => setActiveTab('current')}
                    className={`pb-4 px-4 font-medium transition-all relative ${activeTab === 'current'
                        ? 'text-emerald-600'
                        : 'text-gray-500 hover:text-gray-700'
                        }`}
                >
                    Current Orders
                    {activeTab === 'current' && (
                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-600 rounded-t-full" />
                    )}
                </button>
                <button
                    onClick={() => setActiveTab('history')}
                    className={`pb-4 px-4 font-medium transition-all relative ${activeTab === 'history'
                        ? 'text-emerald-600'
                        : 'text-gray-500 hover:text-gray-700'
                        }`}
                >
                    History
                    {activeTab === 'history' && (
                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-600 rounded-t-full" />
                    )}
                </button>
            </div>

            {/* Orders List */}
            <div className="space-y-6">
                {orders?.length === 0 ? (
                    <div className="text-center py-12 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                        <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500">No {activeTab} orders found</p>
                    </div>
                ) : (
                    orders?.map(order => (
                        <div key={order.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                            {/* Order Header */}
                            <div className="bg-gray-50/50 p-6 flex flex-wrap gap-4 justify-between items-center border-b border-gray-100">
                                <div className="flex gap-4 items-center">
                                    <div className="p-3 bg-white rounded-xl shadow-sm border border-gray-100">
                                        <Package className="w-6 h-6 text-emerald-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Order ID</p>
                                        <p className="font-bold text-gray-800">{order.id}</p>
                                    </div>
                                </div>
                                <div className="flex gap-6">
                                    <div>
                                        <p className="text-sm text-gray-500">Date Placed</p>
                                        <div className="flex items-center gap-2">
                                            <Calendar className="w-4 h-4 text-gray-400" />
                                            <span className="font-medium text-gray-700">{order.date}</span>
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Total Amount</p>
                                        <p className="font-bold text-emerald-600">₹{order.total}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Order Items */}
                            <div className="p-6">
                                <div className="space-y-4 mb-6">
                                    {order.items?.map((item, idx) => (
                                        <div key={idx} className="flex gap-4 items-start">
                                            <div className="w-16 h-16 flex-shrink-0">
                                                {item.category === 'vouchers' && item.couponCode ? (
                                                    <button
                                                        onClick={() => setSelectedVoucher(item)}
                                                        className="w-16 h-16 rounded-lg overflow-hidden shadow-sm border border-gray-200 hover:ring-2 hover:ring-emerald-500 transition-all cursor-pointer relative group"
                                                    >
                                                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 z-20 transition-colors" />
                                                        <ScratchCard coverColor="#e5e7eb">
                                                            <div className="w-full h-full bg-emerald-50 flex flex-col items-center justify-center p-1 text-center">
                                                                <span className="text-[10px] text-emerald-600 font-bold uppercase">Code</span>
                                                                <span className="text-xs font-mono font-bold text-gray-800 break-all leading-tight">***</span>
                                                            </div>
                                                        </ScratchCard>
                                                    </button>
                                                ) : (
                                                    <img
                                                        src={item.image}
                                                        alt={item.name}
                                                        className="w-16 h-16 rounded-lg object-cover bg-gray-100"
                                                    />
                                                )}
                                            </div>
                                            <div className="flex-1">
                                                <h4 className="font-medium text-gray-800">{item.name}</h4>
                                                <p className="text-sm text-gray-500">Qty: {item.quantity} × ₹{item.price}</p>
                                                {item.category === 'vouchers' && (
                                                    <button
                                                        onClick={() => setSelectedVoucher(item)}
                                                        className="mt-1 flex items-center gap-1 text-xs text-emerald-600 font-medium hover:underline"
                                                    >
                                                        <Ticket className="w-3 h-3" />
                                                        <span>Click to reveal code</span>
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Billing Details Section */}
                                <div className="bg-gray-50 rounded-xl p-4 mb-6 flex items-start gap-4">
                                    <div className="bg-white p-2 rounded-lg shadow-sm">
                                        <MapPin className="w-5 h-5 text-gray-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-gray-800 mb-1">
                                            Billed To
                                        </p>
                                        {(() => {
                                            const details = order.billingDetails || order.deliveryDetails;
                                            if (!details) return null;

                                            return (
                                                <div className="text-sm text-gray-600">
                                                    {details.name && <p className="font-medium">{details.name}</p>}
                                                    <p>{details.street || details.address}</p>
                                                    {(details.city || details.state) && (
                                                        <p>{details.city}, {details.state} {details.zip ? `- ${details.zip}` : ''}</p>
                                                    )}
                                                    {details.phone && <p>Phone: {details.phone}</p>}
                                                </div>
                                            );
                                        })()}
                                    </div>
                                </div>

                                {/* Order Status Footer */}
                                <div className="pt-6 border-t border-gray-100 flex items-center gap-3">
                                    {(() => {
                                        const isActive = isOrderActive(order);
                                        const hasVouchers = order.items?.some(item => item.category === 'vouchers');

                                        if (isActive) {
                                            if (order.status === 'Processing' || order.status === 'Shipped') {
                                                return (
                                                    <>
                                                        <Truck className="w-5 h-5 text-orange-500" />
                                                        <span className="text-orange-600 font-medium">
                                                            {order.status} - {order.estimatedDelivery === 'Available Immediately' ? 'Ready for Pickup' : `Expected by ${order.estimatedDelivery}`}
                                                        </span>
                                                    </>
                                                );
                                            }
                                            // Active (Delivered/Picked Up but Valid)
                                            return (
                                                <>
                                                    <CheckCircle className="w-5 h-5 text-emerald-500" />
                                                    <span className="text-emerald-600 font-medium">Active</span>
                                                </>
                                            );
                                        } else {
                                            // History (Expired or Completed)
                                            if (hasVouchers) {
                                                return (
                                                    <>
                                                        <div className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center">
                                                            <X className="w-3 h-3 text-red-500" />
                                                        </div>
                                                        <span className="text-red-600 font-medium">Expired</span>
                                                    </>
                                                );
                                            }
                                            return (
                                                <>
                                                    <CheckCircle className="w-5 h-5 text-gray-400" />
                                                    <span className="text-gray-500 font-medium">Completed</span>
                                                </>
                                            );
                                        }
                                    })()}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Voucher Modal */}
            {selectedVoucher && (
                <VoucherModal
                    voucher={selectedVoucher}
                    onClose={() => setSelectedVoucher(null)}
                />
            )}
        </div>
    );
};

export default Orders;
