import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { CheckCircle, XCircle, Clock, Search, Filter, Eye, Image as ImageIcon, Video } from 'lucide-react';

const AdminVerify = () => {
    const [submissions, setSubmissions] = useState([]);
    const [filteredSubmissions, setFilteredSubmissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedSubmission, setSelectedSubmission] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('pending');
    const [actionLoading, setActionLoading] = useState(false);
    const [comments, setComments] = useState('');

    useEffect(() => {
        fetchSubmissions();
    }, [statusFilter]);

    useEffect(() => {
        filterSubmissions();
    }, [searchTerm, submissions]);

    const fetchSubmissions = async () => {
        setLoading(true);
        try {
            const endpoint = statusFilter === 'pending'
                ? '/verification/pending'
                : `/verification/history?status=${statusFilter}`;

            const response = await api.get(endpoint);
            const data = statusFilter === 'pending' ? response.data.requests : response.data.history;
            setSubmissions(data || []);
            setFilteredSubmissions(data || []);
        } catch (error) {
            console.error('Error fetching submissions:', error);
            setSubmissions([]);
            setFilteredSubmissions([]);
        } finally {
            setLoading(false);
        }
    };

    const filterSubmissions = () => {
        if (!searchTerm.trim()) {
            setFilteredSubmissions(submissions);
            return;
        }

        const filtered = submissions.filter(sub =>
            sub.farmerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            sub.missionTitle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            sub.crop?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            sub.village?.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setFilteredSubmissions(filtered);
    };

    const openModal = (submission) => {
        setSelectedSubmission(submission);
        setComments('');
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setSelectedSubmission(null);
        setComments('');
    };

    const handleApprove = async () => {
        if (!selectedSubmission) return;

        setActionLoading(true);
        try {
            await api.post('/verification/approve', {
                id: selectedSubmission.id,
                comments: comments
            });

            alert('Submission approved successfully!');
            closeModal();
            fetchSubmissions();
        } catch (error) {
            console.error('Error approving submission:', error);
            alert('Failed to approve submission: ' + (error.response?.data?.message || error.message));
        } finally {
            setActionLoading(false);
        }
    };

    const handleReject = async () => {
        if (!selectedSubmission) return;

        if (!comments.trim()) {
            alert('Please provide a reason for rejection');
            return;
        }

        setActionLoading(true);
        try {
            await api.post('/verification/reject', {
                id: selectedSubmission.id,
                reason: comments
            });

            alert('Submission rejected');
            closeModal();
            fetchSubmissions();
        } catch (error) {
            console.error('Error rejecting submission:', error);
            alert('Failed to reject submission: ' + (error.response?.data?.message || error.message));
        } finally {
            setActionLoading(false);
        }
    };

    const formatDate = (timestamp) => {
        if (!timestamp) return 'N/A';
        let date;
        if (timestamp._seconds) {
            date = new Date(timestamp._seconds * 1000);
        } else if (timestamp.toDate) {
            date = timestamp.toDate();
        } else {
            date = new Date(timestamp);
        }
        return date.toLocaleString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-6">
                    <h1 className="text-3xl font-bold text-gray-800">Mission Verification</h1>
                    <p className="text-gray-600 mt-1">Review and validate farmer mission submissions</p>
                </div>

                {/* Filters */}
                <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Search */}
                        <div className="relative">
                            <Search className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                            <input
                                type="text"
                                placeholder="Search by name, crop, village..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-eco-500 focus:outline-none"
                            />
                        </div>

                        {/* Status Filter */}
                        <div className="relative">
                            <Filter className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="w-full pl-10 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-eco-500 focus:outline-none appearance-none"
                            >
                                <option value="pending">Pending</option>
                                <option value="approved">Approved</option>
                                <option value="rejected">Rejected</option>
                            </select>
                        </div>

                        {/* Count */}
                        <div className="flex items-center justify-end text-sm text-gray-600">
                            Showing {filteredSubmissions.length} of {submissions.length} submissions
                        </div>
                    </div>
                </div>

                {/* Submissions Table */}
                {loading ? (
                    <div className="bg-white p-12 rounded-lg shadow-sm text-center">
                        <div className="animate-spin w-8 h-8 border-4 border-eco-600 border-t-transparent rounded-full mx-auto"></div>
                        <p className="text-gray-600 mt-4">Loading submissions...</p>
                    </div>
                ) : filteredSubmissions.length === 0 ? (
                    <div className="bg-white p-12 rounded-lg shadow-sm text-center">
                        <Clock className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-600">No {statusFilter} submissions found</p>
                    </div>
                ) : (
                    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b">
                                <tr>
                                    <th className="text-left p-4 font-semibold text-gray-700">Proof</th>
                                    <th className="text-left p-4 font-semibold text-gray-700">Farmer</th>
                                    <th className="text-left p-4 font-semibold text-gray-700">Mission</th>
                                    <th className="text-left p-4 font-semibold text-gray-700">Crop</th>
                                    <th className="text-left p-4 font-semibold text-gray-700">Village</th>
                                    <th className="text-left p-4 font-semibold text-gray-700">Submitted</th>
                                    <th className="text-left p-4 font-semibold text-gray-700">Status</th>
                                    <th className="text-center p-4 font-semibold text-gray-700">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredSubmissions.map((submission) => (
                                    <tr key={submission.id} className="border-b hover:bg-gray-50 transition">
                                        <td className="p-4">
                                            <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
                                                {submission.proofUrl ? (
                                                    submission.proofType === 'video' ? (
                                                        <Video className="w-8 h-8 text-gray-400" />
                                                    ) : (
                                                        <img
                                                            src={submission.proofUrl}
                                                            alt="Proof"
                                                            className="w-full h-full object-cover"
                                                        />
                                                    )
                                                ) : (
                                                    <ImageIcon className="w-8 h-8 text-gray-400" />
                                                )}
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <div className="font-medium text-gray-800">{submission.farmerName || 'N/A'}</div>
                                            <div className="text-sm text-gray-500">{submission.farmerEmail}</div>
                                        </td>
                                        <td className="p-4 text-gray-700">{submission.missionTitle}</td>
                                        <td className="p-4">
                                            <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-sm">
                                                {submission.crop || 'N/A'}
                                            </span>
                                        </td>
                                        <td className="p-4 text-gray-700">{submission.village || submission.panchayat || 'N/A'}</td>
                                        <td className="p-4 text-sm text-gray-600">{formatDate(submission.submittedAt)}</td>
                                        <td className="p-4">
                                            {submission.status === 'approved' && (
                                                <span className="flex items-center gap-1 text-green-600">
                                                    <CheckCircle className="w-4 h-4" /> Approved
                                                </span>
                                            )}
                                            {submission.status === 'rejected' && (
                                                <span className="flex items-center gap-1 text-red-600">
                                                    <XCircle className="w-4 h-4" /> Rejected
                                                </span>
                                            )}
                                            {submission.status === 'pending' && (
                                                <span className="flex items-center gap-1 text-yellow-600">
                                                    <Clock className="w-4 h-4" /> Pending
                                                </span>
                                            )}
                                        </td>
                                        <td className="p-4 text-center">
                                            <button
                                                onClick={() => openModal(submission)}
                                                className="bg-eco-600 text-white px-4 py-2 rounded-lg hover:bg-eco-700 transition flex items-center gap-2 mx-auto"
                                            >
                                                <Eye className="w-4 h-4" /> Review
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Submission Detail Modal */}
            {showModal && selectedSubmission && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b sticky top-0 bg-white z-10">
                            <h2 className="text-2xl font-bold text-gray-800">Mission Submission Review</h2>
                            <button
                                onClick={closeModal}
                                className="absolute top-6 right-6 text-gray-400 hover:text-gray-600"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* Proof Media */}
                            <div>
                                <h3 className="font-semibold text-gray-700 mb-2">Submitted Proof</h3>
                                <div className="bg-gray-100 rounded-lg overflow-hidden">
                                    {selectedSubmission.proofUrl ? (
                                        selectedSubmission.proofType === 'video' ? (
                                            <video
                                                src={selectedSubmission.proofUrl}
                                                controls
                                                className="w-full"
                                            />
                                        ) : (
                                            <img
                                                src={selectedSubmission.proofUrl}
                                                alt="Submission proof"
                                                className="w-full"
                                            />
                                        )
                                    ) : (
                                        <div className="flex items-center justify-center h-64 text-gray-400">
                                            <ImageIcon className="w-16 h-16" />
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Farmer Details */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <h3 className="font-semibold text-gray-700 mb-2">Farmer Information</h3>
                                    <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                                        <p><span className="font-medium">Name:</span> {selectedSubmission.farmerName}</p>
                                        <p><span className="font-medium">Email:</span> {selectedSubmission.farmerEmail}</p>
                                        <p><span className="font-medium">Village:</span> {selectedSubmission.village || 'N/A'}</p>
                                        <p>
                                            <span className="font-medium">Crop:</span> {selectedSubmission.cropTarget || selectedSubmission.crop || 'N/A'}
                                            {selectedSubmission.cropStage && (
                                                <span className="ml-2 text-sm text-gray-600">({selectedSubmission.cropStage})</span>
                                            )}
                                        </p>
                                    </div>
                                </div>

                                <div>
                                    <h3 className="font-semibold text-gray-700 mb-2">Mission Details</h3>
                                    <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                                        <p><span className="font-medium">Title:</span> {selectedSubmission.missionTitle}</p>
                                        <p><span className="font-medium">Credits:</span> {selectedSubmission.credits || 50}</p>
                                        <p><span className="font-medium">Submitted:</span> {formatDate(selectedSubmission.submittedAt)}</p>
                                        <p><span className="font-medium">Status:</span>
                                            <span className={`ml-2 px-2 py-1 rounded-full text-sm ${selectedSubmission.status === 'approved' ? 'bg-green-100 text-green-700' :
                                                selectedSubmission.status === 'rejected' ? 'bg-red-100 text-red-700' :
                                                    'bg-yellow-100 text-yellow-700'
                                                }`}>
                                                {selectedSubmission.status}
                                            </span>
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Admin Comments */}
                            {selectedSubmission.status === 'pending' && (
                                <div>
                                    <h3 className="font-semibold text-gray-700 mb-2">
                                        {statusFilter === 'rejected' ? 'Rejection Reason' : 'Admin Comments (Optional)'}
                                    </h3>
                                    <textarea
                                        value={comments}
                                        onChange={(e) => setComments(e.target.value)}
                                        placeholder="Add your comments or feedback..."
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-eco-500 focus:outline-none"
                                        rows="3"
                                    />
                                </div>
                            )}

                            {selectedSubmission.adminComments && (
                                <div>
                                    <h3 className="font-semibold text-gray-700 mb-2">Admin Comments</h3>
                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        {selectedSubmission.adminComments}
                                    </div>
                                </div>
                            )}

                            {/* Action Buttons */}
                            {selectedSubmission.status === 'pending' && (
                                <div className="flex gap-4">
                                    <button
                                        onClick={handleApprove}
                                        disabled={actionLoading}
                                        className="flex-1 bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
                                    >
                                        <CheckCircle className="w-5 h-5" />
                                        {actionLoading ? 'Processing...' : 'Approve Submission'}
                                    </button>
                                    <button
                                        onClick={handleReject}
                                        disabled={actionLoading}
                                        className="flex-1 bg-red-600 text-white py-3 rounded-lg font-semibold hover:bg-red-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
                                    >
                                        <XCircle className="w-5 h-5" />
                                        {actionLoading ? 'Processing...' : 'Reject Submission'}
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminVerify;
