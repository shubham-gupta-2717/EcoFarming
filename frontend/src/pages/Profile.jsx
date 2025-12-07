import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { TrendingUp, Flame, LogOut, Loader2, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import ManageCrops from '../components/ManageCrops';
import useEcoStore from '../store/useEcoStore';

const Profile = () => {
    const { user, logout, login, updateUser } = useAuth(); // Assuming login updates context
    const navigate = useNavigate();

    // const [stats, setStats] = useState(null); // Removed in favor of store
    const [loading, setLoading] = useState(true);

    // Edit States
    const [editingEmail, setEditingEmail] = useState(false);
    const [email, setEmail] = useState('');
    const [editingName, setEditingName] = useState(false);
    const [name, setName] = useState('');
    const [editingLocation, setEditingLocation] = useState(false);
    const [location, setLocation] = useState('');
    const [updating, setUpdating] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const handleUpdateProfile = async (field) => {
        let value;
        if (field === 'email') value = email;
        else if (field === 'name') value = name;
        else if (field === 'location') {
            // If all fields are empty, we allow saving to clear the location
            if (!selectedState && !selectedDistrict && !selectedSubDistrict && !village) {
                value = ''; // Clear location
            } else {
                // Validate required fields (State and District are minimum)
                if (!selectedState || !selectedDistrict) {
                    alert('Please select at least State and District');
                    return;
                }
                // Construct value for location
                const parts = [];
                if (village) parts.push(village);
                if (selectedSubDistrict) parts.push(selectedSubDistrict);
                parts.push(selectedDistrict);
                parts.push(selectedState);
                value = parts.join(', ');
            }
        }

        if (field === 'email' && (!value || !value.includes('@'))) {
            alert('Please enter a valid email');
            return;
        }
        if (field === 'name' && !value.trim()) {
            alert('Please enter a valid name');
            return;
        }
        // Location validation is handled above

        try {
            setUpdating(true);
            const updateData = {};
            if (field === 'email') updateData.email = value;
            if (field === 'name') updateData.name = value;
            if (field === 'location') {
                updateData.state = selectedState;
                updateData.district = selectedDistrict;
                updateData.subDistrict = selectedSubDistrict;
                updateData.village = village;
                updateData.location = value;
            }

            const response = await api.put('/auth/profile', updateData);

            if (response.data.success) {
                updateUser(updateData);
                if (field === 'email') setEditingEmail(false);
                if (field === 'name') setEditingName(false);
                if (field === 'location') setEditingLocation(false);
            }
        } catch (error) {
            console.error(`Failed to update ${field}`, error);
            const errorMessage = error.response?.data?.message || error.message || 'Unknown error';
            alert(`Failed to update ${field}: ${errorMessage}`);
        } finally {
            setUpdating(false);
        }
    };

    // Location States
    const [states, setStates] = useState([]);
    const [districts, setDistricts] = useState([]);
    const [subDistricts, setSubDistricts] = useState([]);

    const [selectedState, setSelectedState] = useState('');
    const [selectedDistrict, setSelectedDistrict] = useState('');
    const [selectedSubDistrict, setSelectedSubDistrict] = useState('');
    const [village, setVillage] = useState('');
    const [detectingLocation, setDetectingLocation] = useState(false);

    const handleDetectLocation = (enterEditMode = false) => {
        if (!navigator.geolocation) {
            alert("Geolocation is not supported by your browser");
            return;
        }

        setDetectingLocation(true);
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                try {
                    const { latitude, longitude } = position.coords;
                    // Call the Python backend
                    // Note: Assuming backend runs on port 8000
                    const response = await fetch(`http://localhost:8000/reverse_geocode?lat=${latitude}&lon=${longitude}`);

                    if (!response.ok) {
                        // Check if it's a service unavailable error
                        if (response.status === 503) {
                            throw new Error("Geocoding service is currently unavailable. Please enter your location manually.");
                        }
                        throw new Error("Location not found in dataset. Please enter your location manually.");
                    }

                    const data = await response.json();

                    setSelectedState(data.state);
                    setSelectedDistrict(data.district);
                    setVillage(data.location);
                    setSelectedSubDistrict(''); // Clear sub-district as it's not detected

                    if (enterEditMode) {
                        setEditingLocation(true);
                    }

                    alert(data.description);

                } catch (error) {
                    console.error("Geocoding error:", error);
                    // More user-friendly error message
                    if (error.message.includes("Failed to fetch") || error.message.includes("NetworkError")) {
                        alert("Location detection service is not available. Please enter your location manually.");
                    } else {
                        alert(error.message || "Failed to detect location. Please enter your location manually.");
                    }
                    // Open edit mode so user can enter manually
                    if (enterEditMode) {
                        setEditingLocation(true);
                    }
                } finally {
                    setDetectingLocation(false);
                }
            },
            (error) => {
                console.error("Geolocation error:", error);
                alert("Unable to retrieve your location. Please enable location permissions or enter manually.");
                setDetectingLocation(false);
            }
        );
    };

    const handleResetLocation = () => {
        setSelectedState('');
        setSelectedDistrict('');
        setSelectedSubDistrict('');
        setVillage('');
        setLocation('');
    };

    // Helper to format location string without duplication
    const getLocationString = () => {
        const parts = [];
        // Add parts only if they are unique and exist
        const addPart = (part) => {
            if (part && !parts.includes(part)) {
                parts.push(part);
            }
        };

        addPart(user?.village);
        addPart(user?.subDistrict);
        addPart(user?.district);
        addPart(user?.state);

        if (parts.length > 0) return parts.join(', ');
        return user?.location || 'India';
    };




    const { userProfile } = useEcoStore();

    // Derived stats from store
    const stats = {
        ecoScore: userProfile?.ecoScore || 0,
        streak: userProfile?.currentStreakDays || 0
    };

    useEffect(() => {
        const fetchProfileData = async () => {
            try {
                const statesResponse = await api.get('/locations/states');

                setStates(statesResponse.data);

                // Initialize location fields if user has them
                if (user?.state) setSelectedState(user.state);
                if (user?.district) setSelectedDistrict(user.district);
                if (user?.subDistrict) setSelectedSubDistrict(user.subDistrict);
                if (user?.village) setVillage(user.village);

            } catch (error) {
                console.error("Failed to fetch profile data", error);
            } finally {
                setLoading(false);
            }
        };

        fetchProfileData();
    }, [user]);

    // Fetch Districts
    useEffect(() => {
        if (selectedState) {
            const fetchDistricts = async () => {
                try {
                    const res = await api.get(`/locations/districts/${selectedState}`);
                    setDistricts(res.data);
                } catch (error) {
                    console.error("Error fetching districts:", error);
                }
            };
            fetchDistricts();
        } else {
            setDistricts([]);
        }
    }, [selectedState]);

    // Fetch Sub-Districts
    useEffect(() => {
        if (selectedState && selectedDistrict) {
            const fetchSubDistricts = async () => {
                try {
                    const res = await api.get(`/locations/sub-districts/${selectedState}/${selectedDistrict}`);
                    setSubDistricts(res.data);
                } catch (error) {
                    console.error("Error fetching sub-districts:", error);
                }
            };
            fetchSubDistricts();
        } else {
            setSubDistricts([]);
        }
    }, [selectedDistrict]);

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <Loader2 className="w-8 h-8 animate-spin text-eco-600" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <header className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">My Profile</h1>
                    <p className="text-gray-600">Track your progress and achievements</p>
                </div>
                <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition"
                >
                    <LogOut className="w-4 h-4" />
                    Logout
                </button>
            </header>

            {/* User Info Card */}
            <div className="bg-gradient-to-r from-eco-600 to-eco-700 rounded-xl p-6 text-white shadow-lg">
                <div className="flex items-center gap-4">
                    <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center text-3xl font-bold">
                        {user?.name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'D'}
                    </div>
                    <div className="flex-1">
                        {/* Name Edit Section */}
                        <div className="flex items-center gap-2 mb-1">
                            {editingName ? (
                                <div className="flex items-center gap-2">
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="px-2 py-1 rounded text-gray-800 text-lg font-bold focus:outline-none focus:ring-2 focus:ring-eco-300 w-48"
                                        placeholder="Enter name"
                                    />
                                    <button
                                        onClick={() => handleUpdateProfile('name')}
                                        disabled={updating}
                                        className="bg-white/20 hover:bg-white/30 px-2 py-1 rounded text-xs font-medium transition"
                                    >
                                        {updating ? 'Saving...' : 'Save'}
                                    </button>
                                    <button
                                        onClick={() => setEditingName(false)}
                                        className="text-white/70 hover:text-white text-xs"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            ) : (
                                <div className="flex items-center gap-2 group">
                                    <h2 className="text-2xl font-bold">{user?.name || 'Demo Farmer'}</h2>
                                    <button
                                        onClick={() => {
                                            setName(user?.name || '');
                                            setEditingName(true);
                                        }}
                                        className="opacity-0 group-hover:opacity-100 transition text-xs bg-white/20 px-2 py-0.5 rounded hover:bg-white/30"
                                    >
                                        Edit
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Location Edit Section */}
                        <div className="flex items-center gap-2 text-white/80 text-sm">
                            {editingLocation ? (
                                <div className="flex flex-col gap-2 bg-white/10 p-2 rounded">
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleDetectLocation(true)}
                                            disabled={detectingLocation}
                                            className="flex-1 flex items-center justify-center gap-2 bg-eco-600 hover:bg-eco-700 text-white py-1.5 rounded text-sm transition"
                                        >
                                            {detectingLocation ? (
                                                <>
                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                    Detecting...
                                                </>
                                            ) : (
                                                <>
                                                    <MapPin className="w-4 h-4" />
                                                    Detect
                                                </>
                                            )}
                                        </button>
                                        <button
                                            onClick={handleResetLocation}
                                            className="px-3 py-1.5 bg-red-500/80 hover:bg-red-600 text-white rounded text-sm transition"
                                            title="Reset Location"
                                        >
                                            Reset
                                        </button>
                                    </div>

                                    <select
                                        value={selectedState}
                                        onChange={(e) => setSelectedState(e.target.value)}
                                        className="px-2 py-1 rounded text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-eco-300 w-full"
                                    >
                                        <option value="">Select State</option>
                                        {states.map(s => <option key={s} value={s}>{s}</option>)}
                                    </select>

                                    <select
                                        value={selectedDistrict}
                                        onChange={(e) => setSelectedDistrict(e.target.value)}
                                        className="px-2 py-1 rounded text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-eco-300 w-full"
                                        disabled={!selectedState}
                                    >
                                        <option value="">Select District</option>
                                        {districts.map(d => <option key={d} value={d}>{d}</option>)}
                                    </select>

                                    <select
                                        value={selectedSubDistrict}
                                        onChange={(e) => setSelectedSubDistrict(e.target.value)}
                                        className="px-2 py-1 rounded text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-eco-300 w-full"
                                        disabled={!selectedDistrict}
                                    >
                                        <option value="">Select Sub-District</option>
                                        {subDistricts.map(sd => <option key={sd} value={sd}>{sd}</option>)}
                                    </select>

                                    <input
                                        type="text"
                                        value={village}
                                        onChange={(e) => setVillage(e.target.value)}
                                        className="px-2 py-1 rounded text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-eco-300 w-full"
                                        placeholder="Village Name (Optional)"
                                    />

                                    <div className="flex gap-2 mt-1">
                                        <button
                                            onClick={() => handleUpdateProfile('location')}
                                            disabled={updating}
                                            className="bg-white/20 hover:bg-white/30 px-2 py-1 rounded text-xs font-medium transition flex-1"
                                        >
                                            Save
                                        </button>
                                        <button
                                            onClick={() => setEditingLocation(false)}
                                            className="text-white/70 hover:text-white text-xs flex-1"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex items-center gap-2 group">
                                    <span>
                                        {getLocationString()}
                                    </span>
                                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition">
                                        <button
                                            onClick={() => {
                                                setLocation(user?.location || '');
                                                setEditingLocation(true);
                                            }}
                                            className="text-xs bg-white/20 px-2 py-0.5 rounded hover:bg-white/30"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleDetectLocation(true)}
                                            disabled={detectingLocation}
                                            className="text-xs bg-eco-600/80 px-2 py-0.5 rounded hover:bg-eco-600 flex items-center gap-1"
                                            title="Detect Location"
                                        >
                                            {detectingLocation ? <Loader2 className="w-3 h-3 animate-spin" /> : <MapPin className="w-3 h-3" />}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Email Edit Section */}
                        <div className="flex items-center gap-2 mt-1">
                            {editingEmail ? (
                                <div className="flex items-center gap-2">
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="px-2 py-1 rounded text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-eco-300"
                                        placeholder="Enter email"
                                    />
                                    <button
                                        onClick={() => handleUpdateProfile('email')}
                                        disabled={updating}
                                        className="bg-white/20 hover:bg-white/30 px-2 py-1 rounded text-xs font-medium transition"
                                    >
                                        {updating ? 'Saving...' : 'Save'}
                                    </button>
                                    <button
                                        onClick={() => setEditingEmail(false)}
                                        className="text-white/70 hover:text-white text-xs"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            ) : (
                                <div className="flex items-center gap-2 group">
                                    <p className="opacity-90">{user?.email || 'Add email address'}</p>
                                    <button
                                        onClick={() => {
                                            setEmail(user?.email || '');
                                            setEditingEmail(true);
                                        }}
                                        className="opacity-0 group-hover:opacity-100 transition text-xs bg-white/20 px-2 py-0.5 rounded hover:bg-white/30"
                                    >
                                        Edit
                                    </button>
                                </div>
                            )}
                        </div>
                        {/* Mobile Number (non-editable) */}
                        <div className="flex items-center gap-2 mt-1">
                            <span className="text-gray-400">Mobile:</span>
                            <span className="text-lg font-mono text-gray-800">{user?.mobile || ''}</span>
                        </div>


                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-eco-100 rounded-full">
                            <TrendingUp className="w-6 h-6 text-eco-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">EcoScore</p>
                            <p className="text-2xl font-bold text-gray-800">{stats?.ecoScore || 0}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-orange-100 rounded-full">
                            <Flame className="w-6 h-6 text-orange-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Day Streak</p>
                            <p className="text-2xl font-bold text-gray-800">{stats?.streak || 0} Days</p>
                        </div>
                    </div>
                </div>


            </div>

            {/* Crop Management */}
            <ManageCrops />


        </div>
    );
};

export default Profile;
