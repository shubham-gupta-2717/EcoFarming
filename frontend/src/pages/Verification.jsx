import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Check, X, Clock } from 'lucide-react';

const Verification = () => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRequests = async () => {
            try {
                const response = await api.get('/verification/pending');
                setRequests(response.data.requests);
            } catch (error) {
                console.error("Failed to fetch requests", error);
            } finally {
                setLoading(false);
            }
        };
        fetchRequests();
    }, []);

    const handleAction = async (id, action) => {
        try {
            await api.post(`/verification/${action}`, { id });
            setRequests(requests.filter(req => req.id !== id));
            alert(`Request ${action}ed successfully!`);
        } catch (error) {
            alert(`Failed to ${action} request`);
        }
    };

    return (
        <div className="space-y-6">
            <header>
                <h1 className="text-2xl font-bold text-gray-800">Verification Dashboard 🛡️</h1>
                <p className="text-gray-600">Review mission submissions from farmers.</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {requests.map((req) => (
                    <div key={req.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        <img src={req.proofImage} alt="Proof" className="w-full h-48 object-cover bg-gray-100" />
                        <div className="p-4">
                            <div className="flex justify-between items-start mb-2">
                                <div>
                                    <h3 className="font-bold text-gray-800">{req.missionTitle}</h3>
                                    <p className="text-sm text-gray-600">by {req.farmerName}</p>
                                </div>
                                <span className="bg-yellow-100 text-yellow-700 text-xs px-2 py-1 rounded flex items-center gap-1">
                                    <Clock className="w-3 h-3" /> Pending
                                </span>
                            </div>

                            <div className="flex gap-2 mt-4">
                                <button
                                    onClick={() => handleAction(req.id, 'approve')}
                                    className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition flex justify-center items-center gap-2"
                                >
                                    <Check className="w-4 h-4" /> Approve
                                </button>
                                <button
                                    onClick={() => handleAction(req.id, 'reject')}
                                    className="flex-1 bg-red-100 text-red-600 py-2 rounded-lg hover:bg-red-200 transition flex justify-center items-center gap-2"
                                >
                                    <X className="w-4 h-4" /> Reject
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            {loading && <div className="text-center p-8 text-gray-500">Loading requests...</div>}
            {!loading && requests.length === 0 && (
                <div className="text-center p-12 bg-white rounded-xl border border-dashed border-gray-300 text-gray-500">
                    No pending verifications. Good job! 🎉
                </div>
            )}
        </div>
    );
};

export default Verification;
