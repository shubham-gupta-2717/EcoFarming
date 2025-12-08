import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { AlertTriangle, MapPin, Phone, CheckCircle, Clock, Loader2, ArrowLeft, Trash2 } from 'lucide-react';

const InstituteEmergencyHelp = () => {
    const navigate = useNavigate();
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('Pending');

    useEffect(() => {
        fetchRequests();
    }, [filter]);

    const fetchRequests = async () => {
        setLoading(true);
        try {
            const res = await api.get(`/disaster/all?status=${filter}`);
            setRequests(res.data.requests || []);
        } catch (error) {
            console.error("Error fetching disaster requests:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (id, newStatus) => {
        try {
            await api.put(`/disaster/${id}/status`, { status: newStatus });
            alert(`Request marked as ${newStatus}`);
            fetchRequests();
        } catch (error) {
            console.error("Error updating status:", error);
            alert("Failed to update status");
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this emergency alert? This action cannot be undone.')) {
            return;
        }
        try {
            await api.delete(`/disaster/${id}`);
            alert('Request deleted successfully');
            fetchRequests();
        } catch (error) {
            console.error("Error deleting request:", error);
            alert("Failed to delete request");
        }
    };

    const formatDate = (timestamp) => {
        if (!timestamp) return 'N/A';

        let date;
        // Handle Firestore Timestamp (serialized)
        if (timestamp._seconds) {
            date = new Date(timestamp._seconds * 1000);
        }
        // Handle Firestore Timestamp (object with toDate)
        else if (timestamp.toDate) {
            date = timestamp.toDate();
        }
        // Handle standard Date or string
        else {
            date = new Date(timestamp);
        }

        return date.toLocaleString('en-IN', {
            day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
        });
    };

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-8">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate(-1)}
                        className="p-2 hover:bg-gray-100 rounded-full transition"
                        title="Go Back"
                    >
                        <ArrowLeft className="w-6 h-6 text-gray-600" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                            <AlertTriangle className="text-red-600" />
                            Emergency Help Requests
                        </h1>
                        <p className="text-gray-600 mt-1">Manage and respond to farmer distress calls</p>
                    </div>
                </div>
                <select
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    className="p-2 border rounded-lg bg-white shadow-sm"
                >
                    <option value="Pending">Pending</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Resolved">Resolved</option>
                </select>
            </div>

            {loading ? (
                <div className="flex justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
                </div>
            ) : requests.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
                    <p className="text-gray-500">No {filter.toLowerCase()} emergency requests found.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {requests.map((req) => (
                        <div key={req.id} className="bg-white rounded-xl shadow-sm border border-red-100 overflow-hidden">
                            <div className="p-4 bg-red-50 border-b border-red-100 flex justify-between items-start">
                                <div>
                                    <span className="inline-block px-2 py-1 bg-red-100 text-red-700 text-xs font-bold rounded-full mb-2">
                                        {req.type}
                                    </span>
                                    <h3 className="font-bold text-gray-900">{req.farmerName}</h3>
                                </div>
                                <span className="text-xs text-gray-500">{formatDate(req.createdAt)}</span>
                            </div>

                            <div className="p-4 space-y-3">
                                <p className="text-gray-700 text-sm">{req.details}</p>

                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <Phone className="w-4 h-4" />
                                    <a href={`tel:${req.farmerMobile}`} className="hover:text-blue-600">
                                        {req.farmerMobile}
                                    </a>
                                </div>

                                {req.gps && (
                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                        <MapPin className="w-4 h-4" />
                                        <a
                                            href={`https://www.google.com/maps?q=${req.gps}`}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="text-blue-600 hover:underline"
                                        >
                                            View Location
                                        </a>
                                    </div>
                                )}

                                {req.photo && (
                                    <img
                                        src={req.photo}
                                        alt="Evidence"
                                        className="w-full h-32 object-cover rounded-lg mt-2"
                                    />
                                )}
                            </div>

                            <div className="p-4 bg-gray-50 border-t border-gray-100 flex gap-2">
                                {req.status === 'Pending' && (
                                    <button
                                        onClick={() => handleStatusUpdate(req.id, 'In Progress')}
                                        className="flex-1 bg-blue-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-blue-700"
                                    >
                                        Mark In Progress
                                    </button>
                                )}
                                {req.status !== 'Resolved' && (
                                    <button
                                        onClick={() => handleStatusUpdate(req.id, 'Resolved')}
                                        className="flex-1 bg-green-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-green-700"
                                    >
                                        Resolve
                                    </button>
                                )}
                                <button
                                    onClick={() => handleDelete(req.id)}
                                    className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                                    title="Delete Alert"
                                >
                                    <Trash2 className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default InstituteEmergencyHelp;
