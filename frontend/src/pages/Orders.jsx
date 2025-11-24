import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Package, CheckCircle, Truck, Calendar, MapPin, Store } from 'lucide-react';
import { storeProducts } from '../data/storeProducts';

import { useAuth } from '../context/AuthContext';

const Orders = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('current');

    // Real Data from User Profile
    const currentOrders = user?.orders || [];

    const previousOrders = [
        {
            id: 'ORD-2024-002',
            date: '2024-11-10',
            status: 'Delivered',
            total: 850,
            items: [
                { ...storeProducts[6], quantity: 1 } // Solar Trap
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
            status: 'Delivered',
            total: 450,
            items: [
                { ...storeProducts[8], quantity: 1 } // Soil Testing Kit
            ],
            deliveredDate: '2024-10-30',
            deliveryMethod: 'offline',
            deliveryDetails: {
                name: 'Kisan Seva Kendra',
                address: 'Block A, District Center, Karnal, Haryana'
            }
        }
    ];

    const orders = activeTab === 'current' ? currentOrders : previousOrders;

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
                    onClick={() => setActiveTab('previous')}
                    className={`pb-4 px-4 font-medium transition-all relative ${activeTab === 'previous'
                        ? 'text-emerald-600'
                        : 'text-gray-500 hover:text-gray-700'
                        }`}
                >
                    Previous Orders
                    {activeTab === 'previous' && (
                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-600 rounded-t-full" />
                    )}
                </button>
            </div>

            {/* Orders List */}
            <div className="space-y-6">
                {orders.length === 0 ? (
                    <div className="text-center py-12 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                        <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500">No {activeTab} orders found</p>
                    </div>
                ) : (
                    orders.map(order => (
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
                                    {order.items.map((item, idx) => (
                                        <div key={idx} className="flex gap-4 items-center">
                                            <img
                                                src={item.image}
                                                alt={item.name}
                                                className="w-16 h-16 rounded-lg object-cover bg-gray-100"
                                            />
                                            <div className="flex-1">
                                                <h4 className="font-medium text-gray-800">{item.name}</h4>
                                                <p className="text-sm text-gray-500">Qty: {item.quantity} × ₹{item.price}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Delivery Details Section */}
                                <div className="bg-gray-50 rounded-xl p-4 mb-6 flex items-start gap-4">
                                    <div className="bg-white p-2 rounded-lg shadow-sm">
                                        {order.deliveryMethod === 'offline' ? (
                                            <Store className="w-5 h-5 text-gray-600" />
                                        ) : (
                                            <Truck className="w-5 h-5 text-gray-600" />
                                        )}
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-gray-800 mb-1">
                                            {order.deliveryMethod === 'offline' ? 'Store Pickup' : 'Home Delivery'}
                                        </p>
                                        {order.deliveryDetails && (
                                            <div className="text-sm text-gray-600">
                                                {order.deliveryMethod === 'offline' ? (
                                                    <>
                                                        <p className="font-medium">{order.deliveryDetails.name}</p>
                                                        <p>{order.deliveryDetails.address}</p>
                                                    </>
                                                ) : (
                                                    <>
                                                        <p>{order.deliveryDetails.street}</p>
                                                        <p>{order.deliveryDetails.city}, {order.deliveryDetails.state} - {order.deliveryDetails.zip}</p>
                                                        <p>Phone: {order.deliveryDetails.phone}</p>
                                                    </>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Order Status Footer */}
                                <div className="pt-6 border-t border-gray-100 flex items-center gap-3">
                                    {order.status === 'Delivered' || order.status === 'Picked Up' ? (
                                        <>
                                            <CheckCircle className="w-5 h-5 text-emerald-500" />
                                            <span className="text-emerald-600 font-medium">
                                                {order.status === 'Picked Up' ? 'Picked Up on' : 'Delivered on'} {order.deliveredDate}
                                            </span>
                                        </>
                                    ) : (
                                        <>
                                            <Truck className="w-5 h-5 text-orange-500" />
                                            <span className="text-orange-600 font-medium">
                                                {order.status} - {order.estimatedDelivery === 'Available Immediately' ? 'Ready for Pickup' : `Expected by ${order.estimatedDelivery}`}
                                            </span>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default Orders;
