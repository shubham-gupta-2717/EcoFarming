import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Wifi, WifiOff, RefreshCw, CheckCircle, AlertTriangle, Download, Upload } from 'lucide-react';

const OfflineSync = () => {
    const [lastSynced, setLastSynced] = useState(null);
    const [syncing, setSyncing] = useState(false);
    const [pendingActions, setPendingActions] = useState([]);
    const [syncMessage, setSyncMessage] = useState('');
    const [isOnline, setIsOnline] = useState(navigator.onLine);

    useEffect(() => {
        // Check online status
        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        // Mock pending actions for UI demonstration
        setPendingActions([
            { id: 1, action: "Mission Completed: Soil Test", time: "10 mins ago" },
            { id: 2, action: "Profile Updated", time: "2 hours ago" }
        ]);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    const handleSync = async () => {
        if (!isOnline) {
            setSyncMessage('Cannot sync while offline. Please check your connection.');
            return;
        }

        setSyncing(true);
        setSyncMessage('');

        try {
            // 1. Push Data
            const pushRes = await api.post('/offline/push', {
                offlineActions: pendingActions
            });

            // 2. Pull Data
            const pullRes = await api.get('/offline/pull');

            if (pushRes.data.success && pullRes.data.success) {
                setLastSynced(new Date().toLocaleTimeString());
                setPendingActions([]); // Clear pending actions after sync
                setSyncMessage('Sync completed successfully! ✅');
            }
        } catch (error) {
            console.error("Sync failed", error);
            setSyncMessage('Sync failed. Please try again.');
        } finally {
            setSyncing(false);
        }
    };

    return (
        <div className="space-y-6">
            <header>
                <h1 className="text-2xl font-bold text-gray-800">Offline Sync 🔄</h1>
                <p className="text-gray-600">Manage your data synchronization.</p>
            </header>

            {/* Status Card */}
            <div className={`p-6 rounded-xl border ${isOnline ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className={`p-3 rounded-full ${isOnline ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                            {isOnline ? <Wifi className="w-6 h-6" /> : <WifiOff className="w-6 h-6" />}
                        </div>
                        <div>
                            <h3 className={`font-bold text-lg ${isOnline ? 'text-green-800' : 'text-red-800'}`}>
                                {isOnline ? 'You are Online' : 'You are Offline'}
                            </h3>
                            <p className="text-sm text-gray-600">
                                {isOnline ? 'Ready to sync data.' : 'Please connect to internet to sync.'}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={handleSync}
                        disabled={!isOnline || syncing}
                        className={`flex items-center gap-2 px-6 py-3 rounded-lg font-bold transition ${isOnline
                            ? 'bg-eco-600 text-white hover:bg-eco-700'
                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            }`}
                    >
                        <RefreshCw className={`w-5 h-5 ${syncing ? 'animate-spin' : ''}`} />
                        {syncing ? 'Syncing...' : 'Sync Now'}
                    </button>
                </div>
                {syncMessage && (
                    <div className={`mt-4 p-3 rounded-lg text-sm font-medium ${syncMessage.includes('success') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {syncMessage}
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Pending Actions */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <Upload className="w-5 h-5 text-orange-500" />
                        Pending Uploads ({pendingActions.length})
                    </h3>
                    {pendingActions.length > 0 ? (
                        <div className="space-y-3">
                            {pendingActions.map(action => (
                                <div key={action.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
                                    <span className="text-gray-700 font-medium">{action.action}</span>
                                    <span className="text-xs text-gray-500">{action.time}</span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8 text-gray-400 flex flex-col items-center">
                            <CheckCircle className="w-10 h-10 mb-2 text-green-400" />
                            <p>All data synced!</p>
                        </div>
                    )}
                </div>

                {/* Last Sync Info */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <Download className="w-5 h-5 text-blue-500" />
                        Sync Status
                    </h3>
                    <div className="space-y-4">
                        <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                            <span className="text-blue-800 font-medium">Last Synced</span>
                            <span className="font-bold text-blue-900">{lastSynced || 'Never'}</span>
                        </div>
                        <div className="text-sm text-gray-600">
                            <p className="flex items-start gap-2">
                                <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                                Syncing ensures your progress is saved and you receive the latest missions and alerts.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OfflineSync;
