import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { ArrowLeft, Send, Loader2, AlertCircle, Camera } from 'lucide-react';
import PhotoUpload from '../components/PhotoUpload';

const RaiseTicket = () => {
    const navigate = useNavigate();
    const [type, setType] = useState('App Issue');
    const [description, setDescription] = useState('');
    const [photo, setPhoto] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!description.trim()) {
            alert('Please describe your issue');
            return;
        }

        setSubmitting(true);
        try {
            // In a real app, upload photo first and get URL
            // For now, we'll send null or mock URL if photo exists
            const ticketData = {
                type,
                description,
                photo: photo ? 'mock-photo-url' : null
            };

            await api.post('/tickets', ticketData);
            alert('Ticket raised successfully! We will contact you soon.');
            navigate('/dashboard');
        } catch (error) {
            console.error('Error raising ticket:', error);
            alert('Failed to raise ticket. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="max-w-xl mx-auto px-4 py-6">
            <button
                onClick={() => navigate('/dashboard')}
                className="flex items-center gap-2 text-gray-500 hover:text-eco-600 mb-6"
            >
                <ArrowLeft className="w-4 h-4" /> Back to Dashboard
            </button>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100 bg-eco-50">
                    <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                        <AlertCircle className="w-6 h-6 text-eco-600" />
                        Raise a Ticket
                    </h1>
                    <p className="text-gray-600 text-sm mt-1">
                        Facing an issue? Let us know and we'll help you out.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Issue Type
                        </label>
                        <select
                            value={type}
                            onChange={(e) => setType(e.target.value)}
                            className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-eco-500 focus:border-transparent bg-white"
                        >
                            <option value="App Issue">App Issue (Technical)</option>
                            <option value="Mission Issue">Mission Related</option>
                            <option value="Payment">Payment / Rewards</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Description <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Please describe the issue in detail..."
                            className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-eco-500 focus:border-transparent"
                            rows="4"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Screenshot (Optional)
                        </label>
                        <PhotoUpload onUpload={setPhoto} />
                    </div>

                    <button
                        type="submit"
                        disabled={submitting}
                        className="w-full py-3 rounded-xl font-bold shadow-lg transition-all transform hover:-translate-y-0.5 bg-eco-600 text-white hover:bg-eco-700 shadow-eco-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
                    >
                        {submitting ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                Submitting...
                            </>
                        ) : (
                            <>
                                <Send className="w-5 h-5" />
                                Submit Ticket
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default RaiseTicket;
