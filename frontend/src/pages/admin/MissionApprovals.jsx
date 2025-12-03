import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import {
    CheckCircle, XCircle, Clock, Image as ImageIcon,
    User, Calendar, Award, AlertCircle, Loader2, Eye
} from 'lucide-react';

const MissionApprovals = () => {
    const [missions, setMissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all'); // all, submitted, verified, rejected
    const [selectedMission, setSelectedMission] = useState(null);
    const [actionLoading, setActionLoading] = useState(false);

    useEffect(() => {
        fetchPendingMissions();
    }, []);

    const fetchPendingMissions = async () => {
        setLoading(true);
        try {
            const response = await api.get('/missions/pending-verification');
            setMissions(response.data.missions || []);
        } catch (error) {
            console.error('Error fetching missions:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (missionId) => {
        if (!window.confirm('Approve this mission and award points?')) return;

        setActionLoading(true);
        try {
            await api.post(`/missions/${missionId}/approve-manual`, {
                reason: 'Manually approved by admin'
            });
            alert('Mission approved and points awarded!');
            fetchPendingMissions();
            setSelectedMission(null);
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to approve mission');
        } finally {
            setActionLoading(false);
        }
    };

    const handleReject = async (missionId) => {
        const reason = prompt('Enter rejection reason:');
        if (!reason) return;

        setActionLoading(true);
        try {
            await api.post(`/missions/${missionId}/reject-manual`, { reason });
            alert('Mission rejected');
            fetchPendingMissions();
            setSelectedMission(null);
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to reject mission');
        } finally {
            setActionLoading(false);
        }
    };

    const filteredMissions = missions.filter(m => {
        if (filter === 'all') return true;
        return m.status?.toLowerCase() === filter;
    });

    const getStatusBadge = (status) => {
        const badges = {
            'SUBMITTED': { color: 'bg-yellow-100 text-yellow-700', icon: Clock, text: 'Pending' },
            'VERIFIED': { color: 'bg-green-100 text-green-700', icon: CheckCircle, text: 'Approved' },
            'REJECTED': { color: 'bg-red-100 text-red-700', icon: XCircle, text: 'Rejected' }
        };

        const badge = badges[status?.toUpperCase()] || badges['SUBMITTED'];
        const Icon = badge.icon;

        return (
            <span className={`px-2 py-1 ${badge.color} rounded-full text-xs font-medium flex items-center gap-1 w-fit`}>
                <Icon className="w-3 h-3" />
                {badge.text}
            </span>
        );
    };

    const formatDate = (timestamp) => {
        if (!timestamp) return 'N/A';
        let date;
        if (timestamp._seconds || timestamp.seconds) {
            date = new Date((timestamp._seconds || timestamp.seconds) * 1000);
        } else if (timestamp.toDate) {
            date = timestamp.toDate();
        } else {
            date = new Date(timestamp);
        }
        return date.toLocaleDateString();
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-eco-600" />
            </div>
        );
    }

    return (
        <div className="p-6">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-800 mb-2">Mission Approvals</h1>
                <p className="text-gray-600">Review and approve farmer mission submissions</p>
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-2 mb-6 border-b border-gray-200">
                {[
                    { key: 'all', label: 'All' },
                    { key: 'submitted', label: 'Pending' },
                    { key: 'verified', label: 'Approved' },
                    { key: 'rejected', label: 'Rejected' }
                ].map(tab => (
                    <button
                        key={tab.key}
                        onClick={() => setFilter(tab.key)}
                        className={`px-4 py-2 font-medium transition ${filter === tab.key
                            ? 'text-eco-600 border-b-2 border-eco-600'
                            : 'text-gray-600 hover:text-gray-800'
                            }`}
                    >
                        {tab.label}
                        <span className="ml-2 text-xs bg-gray-100 px-2 py-0.5 rounded-full">
                            {missions.filter(m => tab.key === 'all' || m.status?.toLowerCase() === tab.key).length}
                        </span>
                    </button>
                ))}
            </div>

            {/* Mission List */}
            {filteredMissions.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                    <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600">No missions found</p>
                </div>
            ) : (
                <div className="grid gap-4">
                    {filteredMissions.map(mission => (
                        <div key={mission.id} className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition">
                            <div className="p-4">
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            {getStatusBadge(mission.status)}
                                            {mission.aiVerified !== undefined && (
                                                <span className="text-xs text-gray-500">
                                                    {mission.aiVerified ? '🤖 AI Approved' : '🤖 AI Rejected'}
                                                </span>
                                            )}
                                            {mission.manualOverride && (
                                                <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded">
                                                    Manual Override
                                                </span>
                                            )}
                                        </div>
                                        <h3 className="font-bold text-gray-900">{mission.title}</h3>
                                        <p className="text-sm text-gray-600 mt-1">{mission.description}</p>
                                    </div>
                                    <div className="flex items-center gap-1 text-eco-600 font-bold ml-4">
                                        <Award className="w-4 h-4" />
                                        <span>{mission.points} pts</span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                                    <div className="flex items-center gap-1">
                                        <User className="w-4 h-4" />
                                        <span>{mission.farmerName || 'Unknown'}</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Calendar className="w-4 h-4" />
                                        <span>{formatDate(mission.submittedAt)}</span>
                                    </div>
                                </div>

                                {/* Image Preview */}
                                {mission.imageUrl && (
                                    <div className="mb-3">
                                        <img
                                            src={mission.imageUrl}
                                            alt="Mission proof"
                                            className="w-full h-48 object-cover rounded-lg cursor-pointer hover:opacity-90 transition"
                                            onClick={() => setSelectedMission(mission)}
                                        />
                                    </div>
                                )}

                                {/* Notes */}
                                {mission.notes && (
                                    <div className="mb-3 p-3 bg-gray-50 rounded-lg">
                                        <p className="text-xs text-gray-500 mb-1">Farmer's Notes:</p>
                                        <p className="text-sm text-gray-700">{mission.notes}</p>
                                    </div>
                                )}

                                {/* AI Verification Result */}
                                {mission.verificationReason && (
                                    <div className={`mb-3 p-3 rounded-lg ${mission.aiVerified
                                        ? 'bg-green-50 border border-green-200'
                                        : 'bg-red-50 border border-red-200'
                                        }`}>
                                        <p className="text-xs text-gray-600 mb-1">AI Verification:</p>
                                        <p className={`text-sm ${mission.aiVerified ? 'text-green-700' : 'text-red-700'}`}>
                                            {mission.verificationReason}
                                        </p>
                                        {mission.verificationConfidence && (
                                            <p className="text-xs text-gray-500 mt-1">
                                                Confidence: {(mission.verificationConfidence * 100).toFixed(0)}%
                                            </p>
                                        )}
                                    </div>
                                )}

                                {/* Actions */}
                                {(mission.status?.toUpperCase() === 'SUBMITTED' ||
                                    (mission.status?.toUpperCase() === 'REJECTED' && mission.verificationConfidence === 0 && !mission.manualOverride)) && (
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleApprove(mission.id)}
                                                disabled={actionLoading}
                                                className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
                                            >
                                                <CheckCircle className="w-4 h-4" />
                                                Approve
                                            </button>
                                            <button
                                                onClick={() => handleReject(mission.id)}
                                                disabled={actionLoading}
                                                className="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
                                            >
                                                <XCircle className="w-4 h-4" />
                                                Reject
                                            </button>
                                        </div>
                                    )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Image Modal */}
            {selectedMission && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
                    onClick={() => setSelectedMission(null)}
                >
                    <div className="max-w-4xl w-full bg-white rounded-lg overflow-hidden" onClick={(e) => e.stopPropagation()}>
                        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                            <h3 className="font-bold text-gray-900">{selectedMission.title}</h3>
                            <button
                                onClick={() => setSelectedMission(null)}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                <XCircle className="w-6 h-6" />
                            </button>
                        </div>
                        <img
                            src={selectedMission.imageUrl}
                            alt="Mission proof full size"
                            className="w-full max-h-[70vh] object-contain"
                        />
                        <div className="p-4 bg-gray-50">
                            <div className="flex gap-2">
                                <button
                                    onClick={() => handleApprove(selectedMission.id)}
                                    disabled={actionLoading || selectedMission.status?.toUpperCase() !== 'SUBMITTED'}
                                    className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition disabled:opacity-50"
                                >
                                    Approve
                                </button>
                                <button
                                    onClick={() => handleReject(selectedMission.id)}
                                    disabled={actionLoading || selectedMission.status?.toUpperCase() !== 'SUBMITTED'}
                                    className="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition disabled:opacity-50"
                                >
                                    Reject
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MissionApprovals;
