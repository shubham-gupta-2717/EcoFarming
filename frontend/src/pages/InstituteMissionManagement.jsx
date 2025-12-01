import { useState, useEffect } from 'react';
import { Trash2, Plus, Users, Filter } from 'lucide-react';
import AssignMissionModal from '../components/AssignMissionModal';

const InstituteMissionManagement = () => {
    const [missions, setMissions] = useState([]);
    const [farmers, setFarmers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAssignModal, setShowAssignModal] = useState(false);
    const [filters, setFilters] = useState({
        farmerId: '',
        crop: '',
        status: 'active'
    });

    useEffect(() => {
        fetchMissions();
        fetchFarmers();
    }, [filters]);

    const fetchMissions = async () => {
        try {
            const token = localStorage.getItem('token');
            const queryParams = new URLSearchParams(filters).toString();

            const response = await fetch(`http://localhost:5000/api/institute/missions/active?${queryParams}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await response.json();
            if (data.success) {
                setMissions(data.missions);
            }
        } catch (error) {
            console.error('Error fetching missions:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchFarmers = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:5000/api/institute/farmers', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await response.json();
            if (data.success) {
                setFarmers(data.farmers);
            }
        } catch (error) {
            console.error('Error fetching farmers:', error);
        }
    };

    const handleRemoveMission = async (missionId) => {
        if (!confirm('Are you sure you want to remove this mission?')) return;

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:5000/api/institute/missions/${missionId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await response.json();
            if (data.success) {
                alert('Mission removed successfully');
                fetchMissions();
            } else {
                alert('Failed to remove mission: ' + data.message);
            }
        } catch (error) {
            console.error('Error removing mission:', error);
            alert('Error removing mission');
        }
    };

    const handleAssignSuccess = () => {
        setShowAssignModal(false);
        fetchMissions();
    };

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800">Mission Management</h1>
                <div className="flex gap-3">
                    <a
                        href="/admin/mission-approvals"
                        className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                    >
                        <Users size={20} />
                        Mission Approvals
                    </a>
                    <button
                        onClick={() => setShowAssignModal(true)}
                        className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
                    >
                        <Plus size={20} />
                        Assign Mission
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-lg shadow-md mb-6">
                <div className="flex items-center gap-2 mb-3">
                    <Filter size={20} className="text-gray-600" />
                    <h2 className="text-lg font-semibold">Filters</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Farmer</label>
                        <select
                            value={filters.farmerId}
                            onChange={(e) => setFilters({ ...filters, farmerId: e.target.value })}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2"
                        >
                            <option value="">All Farmers</option>
                            {farmers.map(farmer => (
                                <option key={farmer.id} value={farmer.id}>{farmer.name}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Crop</label>
                        <input
                            type="text"
                            value={filters.crop}
                            onChange={(e) => setFilters({ ...filters, crop: e.target.value })}
                            placeholder="Enter crop name"
                            className="w-full border border-gray-300 rounded-lg px-3 py-2"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                        <select
                            value={filters.status}
                            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2"
                        >
                            <option value="active">Active</option>
                            <option value="completed">Completed</option>
                            <option value="">All</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Missions Table */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Farmer</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mission</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Crop</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Credits</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {loading ? (
                                <tr>
                                    <td colSpan="7" className="px-6 py-4 text-center text-gray-500">Loading...</td>
                                </tr>
                            ) : missions.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="px-6 py-4 text-center text-gray-500">No missions found</td>
                                </tr>
                            ) : (
                                missions.map(mission => (
                                    <tr key={mission.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <Users size={16} className="text-gray-400 mr-2" />
                                                <div>
                                                    <div className="text-sm font-medium text-gray-900">{mission.farmerName}</div>
                                                    <div className="text-sm text-gray-500">{mission.farmerEmail}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-gray-900">{mission.title}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                                {mission.crop || 'N/A'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {mission.credits}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${mission.status === 'active' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                                                }`}>
                                                {mission.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {mission.createdAt ? new Date(mission.createdAt.seconds * 1000).toLocaleDateString() : 'N/A'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <button
                                                onClick={() => handleRemoveMission(mission.id)}
                                                className="text-red-600 hover:text-red-900 flex items-center gap-1"
                                            >
                                                <Trash2 size={16} />
                                                Remove
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Assign Mission Modal */}
            {showAssignModal && (
                <AssignMissionModal
                    farmers={farmers}
                    onClose={() => setShowAssignModal(false)}
                    onSuccess={handleAssignSuccess}
                />
            )}
        </div>
    );
};

export default InstituteMissionManagement;
