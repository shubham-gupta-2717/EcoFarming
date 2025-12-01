import React, { useState, useEffect } from 'react';
import { Search, Filter, Eye, Truck, Store, CheckCircle, Clock, Package, X } from 'lucide-react';
import api from '../../services/api';

const AdminOrders = () => {
    const [filterStatus, setFilterStatus] = useState('All');
    const [searchTerm, setSearchTerm] = useState('');

    // Mock Orders Data (Initial Seed)
    const initialMockOrders = [
        {
            id: 'ORD-1732812000123',
            customer: 'Ramesh Kumar',
            date: 'Nov 28, 2024',
            total: 1250,
            status: 'Processing',
            fulfillmentType: 'delivery',
            items: 3,
            location: 'Karnal, Haryana',
            userId: 'mock-user-1'
        },
        {
            id: 'ORD-1732809000456',
            customer: 'Suresh Singh',
            date: 'Nov 28, 2024',
            total: 450,
            status: 'Ready for Pickup',
            fulfillmentType: 'pickup',
            items: 1,
            location: 'Kisan Seva Kendra, Karnal',
            userId: 'mock-user-2'
        },
        {
            id: 'ORD-1732725000789',
            customer: 'Anita Devi',
            date: 'Nov 27, 2024',
            total: 2100,
            status: 'Dispatched',
            fulfillmentType: 'delivery',
            items: 5,
            location: 'Panipat, Haryana',
            userId: 'mock-user-3'
        }
    ];

    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState(null);

    useEffect(() => {
        fetchOrders();
        // Poll every 30 seconds
        const interval = setInterval(fetchOrders, 30000);
        return () => clearInterval(interval);
    }, []);

    const fetchOrders = async () => {
        try {
            const response = await api.get('/admin/orders');
            setOrders(response.data || []);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching orders:', error);
            setLoading(false);
        }
    };

    const handleStatusChange = async (orderId, newStatus) => {
        try {
            await api.put(`/admin/orders/${orderId}/status`, { status: newStatus });
            setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
        } catch (error) {
            console.error('Error updating status:', error);
            alert('Failed to update status');
        }
    };

    const filteredOrders = orders.filter(order => {
        const matchesSearch = order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.customer.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter = filterStatus === 'All' || order.fulfillmentType === filterStatus.toLowerCase();
        return matchesSearch && matchesFilter;
    });

    const getStatusColor = (status) => {
        switch (status) {
            case 'Processing': return 'bg-yellow-100 text-yellow-800';
            case 'Placed': return 'bg-yellow-100 text-yellow-800'; // Legacy
            case 'Ready for Pickup': return 'bg-blue-100 text-blue-800';
            case 'Dispatched': return 'bg-purple-100 text-purple-800';
            case 'Delivered': return 'bg-green-100 text-green-800';
            case 'Picked Up': return 'bg-green-100 text-green-800';
            case 'Given': return 'bg-green-100 text-green-800'; // Legacy
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Order Management</h1>
                        <p className="text-gray-500">Track and manage farmer orders</p>
                    </div>
                    <div className="flex gap-3">
                        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center gap-3">
                            <div className="p-2 bg-yellow-50 rounded-lg">
                                <Clock className="w-5 h-5 text-yellow-600" />
                            </div>
                            <div>
                                <p className="text-xs text-gray-500">Pending</p>
                                <p className="font-bold text-gray-900">{orders.filter(o => o.status === 'Processing').length}</p>
                            </div>
                        </div>
                        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center gap-3">
                            <div className="p-2 bg-blue-50 rounded-lg">
                                <Store className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-xs text-gray-500">Pickup Ready</p>
                                <p className="font-bold text-gray-900">{orders.filter(o => o.status === 'Ready for Pickup').length}</p>
                            </div>
                        </div>
                        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center gap-3">
                            <div className="p-2 bg-purple-50 rounded-lg">
                                <Truck className="w-5 h-5 text-purple-600" />
                            </div>
                            <div>
                                <p className="text-xs text-gray-500">Dispatched</p>
                                <p className="font-bold text-gray-900">{orders.filter(o => o.status === 'Dispatched').length}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filters & Search */}
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-6 flex flex-wrap gap-4 justify-between items-center">
                    <div className="flex gap-2">
                        {['All', 'Delivery', 'Pickup'].map(status => (
                            <button
                                key={status}
                                onClick={() => setFilterStatus(status)}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filterStatus === status
                                    ? 'bg-gray-900 text-white'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}
                            >
                                {status}
                            </button>
                        ))}
                    </div>
                    <div className="relative">
                        <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                            type="text"
                            placeholder="Search Order ID or Name..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 w-64"
                        />
                    </div>
                </div>

                {/* Orders Table */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-4 text-sm font-semibold text-gray-600">Order Details</th>
                                <th className="px-6 py-4 text-sm font-semibold text-gray-600">Customer</th>
                                <th className="px-6 py-4 text-sm font-semibold text-gray-600">Type</th>
                                <th className="px-6 py-4 text-sm font-semibold text-gray-600">Status</th>
                                <th className="px-6 py-4 text-sm font-semibold text-gray-600">Amount</th>
                                <th className="px-6 py-4 text-sm font-semibold text-gray-600">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {filteredOrders.map(order => (
                                <tr key={order.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-gray-100 rounded-lg">
                                                <Package className="w-5 h-5 text-gray-600" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-900">{order.displayId || order.id}</p>
                                                <p className="text-xs text-gray-500">
                                                    {order.date || (order.createdAt?._seconds ? new Date(order.createdAt._seconds * 1000).toLocaleDateString() : new Date(order.createdAt || Date.now()).toLocaleDateString())} • {Array.isArray(order.items) ? order.items.length : (order.items || 0)} Items
                                                </p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <button
                                            onClick={() => setSelectedOrder(order)}
                                            className="text-left hover:bg-gray-100 p-2 -m-2 rounded-lg transition-colors group"
                                        >
                                            <p className="font-medium text-indigo-600 group-hover:text-indigo-800">
                                                {order.customer || order.customerName || 'Unknown'}
                                            </p>
                                            <p className="text-xs text-gray-500">{order.location || 'N/A'}</p>
                                        </button>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            {order.fulfillmentType === 'delivery' ? (
                                                <Truck className="w-4 h-4 text-gray-500" />
                                            ) : (
                                                <Store className="w-4 h-4 text-gray-500" />
                                            )}
                                            <span className="capitalize text-sm text-gray-700">
                                                {order.fulfillmentType || 'Standard'}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                                            {order.status || 'Pending'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 font-medium text-gray-900">
                                        ₹{order.total || order.amount || 0}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            {/* Delivery Actions */}
                                            {order.fulfillmentType === 'delivery' && (
                                                <>
                                                    {(order.status === 'Processing' || order.status === 'Placed') && (
                                                        <button
                                                            onClick={() => handleStatusChange(order.id, 'Dispatched')}
                                                            className="text-xs bg-purple-50 text-purple-700 px-3 py-1 rounded-lg hover:bg-purple-100 border border-purple-200"
                                                        >
                                                            Dispatch
                                                        </button>
                                                    )}
                                                    {order.status === 'Dispatched' && (
                                                        <button
                                                            onClick={() => handleStatusChange(order.id, 'Delivered')}
                                                            className="text-xs bg-green-50 text-green-700 px-3 py-1 rounded-lg hover:bg-green-100 border border-green-200"
                                                        >
                                                            Mark Delivered
                                                        </button>
                                                    )}
                                                </>
                                            )}

                                            {/* Pickup Actions */}
                                            {order.fulfillmentType === 'pickup' && (
                                                <>
                                                    {(order.status === 'Processing' || order.status === 'Placed') && (
                                                        <button
                                                            onClick={() => handleStatusChange(order.id, 'Ready for Pickup')}
                                                            className="text-xs bg-blue-50 text-blue-700 px-3 py-1 rounded-lg hover:bg-blue-100 border border-blue-200"
                                                        >
                                                            Ready Pickup
                                                        </button>
                                                    )}
                                                    {order.status === 'Ready for Pickup' && (
                                                        <button
                                                            onClick={() => handleStatusChange(order.id, 'Picked Up')}
                                                            className="text-xs bg-green-50 text-green-700 px-3 py-1 rounded-lg hover:bg-green-100 border border-green-200"
                                                        >
                                                            Mark Picked Up
                                                        </button>
                                                    )}
                                                </>
                                            )}

                                            {/* Legacy/Fallback Actions */}
                                            {(!order.fulfillmentType || (order.status !== 'Processing' && order.status !== 'Placed' && order.status !== 'Dispatched' && order.status !== 'Ready for Pickup' && order.status !== 'Delivered' && order.status !== 'Picked Up')) && order.status !== 'Delivered' && order.status !== 'Picked Up' && (
                                                <button
                                                    onClick={() => handleStatusChange(order.id, 'Delivered')}
                                                    className="text-xs bg-gray-50 text-gray-700 px-3 py-1 rounded-lg hover:bg-gray-100 border border-gray-200"
                                                >
                                                    Complete
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {/* Order Summary Modal */}
                {selectedOrder && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fadeIn">
                        <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                            {/* Modal Header */}
                            <div className="sticky top-0 bg-white p-6 border-b border-gray-100 flex justify-between items-start z-10">
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900">Order Summary</h2>
                                    <p className="text-sm text-gray-500">#{selectedOrder.id}</p>
                                </div>
                                <button
                                    onClick={() => setSelectedOrder(null)}
                                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                                >
                                    <X className="w-5 h-5 text-gray-500" />
                                </button>
                            </div>

                            <div className="p-6 space-y-8">
                                {/* Customer & Order Details */}
                                <section>
                                    <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">Customer & Order Details</h3>
                                    <div className="bg-gray-50 rounded-xl p-4 grid grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <p className="text-gray-500">Customer Name</p>
                                            <p className="font-semibold text-gray-900">{selectedOrder.customer}</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-500">Order Date</p>
                                            <p className="font-semibold text-gray-900">{selectedOrder.date}</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-500">Status</p>
                                            <span className={`inline-block px-2 py-1 rounded-md text-xs font-medium mt-1 ${getStatusColor(selectedOrder.status)}`}>
                                                {selectedOrder.status}
                                            </span>
                                        </div>
                                        <div>
                                            <p className="text-gray-500">Order ID</p>
                                            <p className="font-mono text-gray-900">{selectedOrder.id}</p>
                                        </div>
                                    </div>
                                </section>

                                {/* Order Items */}
                                <section>
                                    <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">Order Items</h3>
                                    <div className="border border-gray-200 rounded-xl overflow-hidden">
                                        <table className="w-full text-sm text-left">
                                            <thead className="bg-gray-50 border-b border-gray-200">
                                                <tr>
                                                    <th className="px-4 py-3 font-semibold text-gray-700">Item Name</th>
                                                    <th className="px-4 py-3 font-semibold text-gray-700 text-center">Qty</th>
                                                    <th className="px-4 py-3 font-semibold text-gray-700 text-right">Price</th>
                                                    <th className="px-4 py-3 font-semibold text-gray-700 text-right">Subtotal</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-100">
                                                {Array.isArray(selectedOrder.items) ? (
                                                    selectedOrder.items.map((item, idx) => (
                                                        <tr key={idx}>
                                                            <td className="px-4 py-3 text-gray-900">{item.name}</td>
                                                            <td className="px-4 py-3 text-gray-600 text-center">{item.quantity}</td>
                                                            <td className="px-4 py-3 text-gray-600 text-right">₹{item.price}</td>
                                                            <td className="px-4 py-3 font-medium text-gray-900 text-right">₹{item.price * item.quantity}</td>
                                                        </tr>
                                                    ))
                                                ) : (
                                                    <tr>
                                                        <td colSpan="4" className="px-4 py-3 text-center text-gray-500 italic">
                                                            Item details not available for legacy orders
                                                        </td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </section>

                                {/* Delivery & Store Info */}
                                <section>
                                    <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">
                                        {selectedOrder.fulfillmentType === 'delivery' ? 'Delivery Information' : 'Store Pickup Information'}
                                    </h3>
                                    <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex gap-4 items-start">
                                        <div className="p-2 bg-white rounded-lg shadow-sm">
                                            {selectedOrder.fulfillmentType === 'delivery' ? (
                                                <Truck className="w-5 h-5 text-blue-600" />
                                            ) : (
                                                <Store className="w-5 h-5 text-blue-600" />
                                            )}
                                        </div>
                                        <div className="text-sm">
                                            <p className="font-bold text-gray-900 mb-1">
                                                {selectedOrder.fulfillmentType === 'delivery' ? 'Home Delivery' : 'In-Store Pickup'}
                                            </p>
                                            <p className="text-gray-600 whitespace-pre-line">{selectedOrder.location}</p>
                                        </div>
                                    </div>
                                </section>

                                {/* Payment Details */}
                                <section>
                                    <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">Payment Details</h3>
                                    <div className="bg-gray-50 rounded-xl p-4 space-y-3 text-sm">
                                        <div className="flex justify-between text-gray-600">
                                            <span>Subtotal</span>
                                            <span>₹{selectedOrder.subtotal || selectedOrder.total}</span>
                                        </div>
                                        <div className="flex justify-between text-gray-600">
                                            <span>Shipping/Tax</span>
                                            <span className="text-green-600">Free</span>
                                        </div>
                                        <div className="border-t border-gray-200 pt-3 flex justify-between font-bold text-gray-900 text-base">
                                            <span>Total Order Amount</span>
                                            <span>₹{selectedOrder.total}</span>
                                        </div>

                                        <div className="border-t border-gray-200 my-3"></div>

                                        <div className="flex justify-between text-gray-600">
                                            <span>Credit Used</span>
                                            <span className="text-red-500">- ₹{selectedOrder.discount || 0}</span>
                                        </div>
                                        <div className="flex justify-between font-bold text-gray-900">
                                            <span>Money Paid (Cash/Card)</span>
                                            <span>₹{selectedOrder.total}</span>
                                        </div>
                                        <div className="flex justify-between text-gray-500 text-xs mt-2">
                                            <span>Payment Method</span>
                                            <span>Online (EcoPay)</span>
                                        </div>
                                    </div>
                                </section>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminOrders;
