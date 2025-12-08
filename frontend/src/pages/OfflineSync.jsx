import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff, RefreshCw, Trash2, Database, AlertOctagon } from 'lucide-react';
import { offlineQueue } from '../utils/OfflineQueue';
import { getPendingActions, checkStorageUsage, clearOfflineData } from '../utils/indexedDB';
import SyncStatusBadge from '../components/SyncStatusBadge';

const OfflineSync = () => {
    const [pendingActions, setPendingActions] = useState([]);
    const [storageStats, setStorageStats] = useState(null);
    const [syncing, setSyncing] = useState(false);
    const [isOnline, setIsOnline] = useState(navigator.onLine);

    const loadData = async () => {
        const actions = await getPendingActions();
        const stats = await checkStorageUsage();
        setPendingActions(actions);
        setStorageStats(stats);
    };

    useEffect(() => {
        loadData();

        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    const handleSync = async () => {
        if (!isOnline) return;
        setSyncing(true);
        try {
            await offlineQueue.processQueue();
            await loadData(); // Refresh list
        } catch (error) {
            console.error("Sync error:", error);
        } finally {
            setSyncing(false);
        }
    };

    const handleClear = async () => {
        if (window.confirm("Are you sure? This will delete all unsaved local data.")) {
            await clearOfflineData();
            await loadData();
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-6 space-y-6">
            <header className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                        Offline Sync Manager
                        <SyncStatusBadge />
                    </h1>
                    <p className="text-gray-600">Local storage and synchronization control center.</p>
                </div>
                <div className={`px-4 py-1 rounded-full text-sm font-bold flex items-center gap-2 ${isOnline ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {isOnline ? <Wifi className="w-4 h-4" /> : <WifiOff className="w-4 h-4" />}
                    {isOnline ? 'Online' : 'Offline'}
                </div>
            </header>

            {/* Storage Metric */}
            {storageStats && (
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <h3 className="font-bold text-gray-700 mb-2 flex items-center gap-2">
                        <Database className="w-5 h-5" /> Storage Usage
                    </h3>
                    <div className="w-full bg-gray-100 rounded-full h-4 overflow-hidden">
                        <div
                            className={`h-full transition-all duration-500 ${storageStats.isWarning ? 'bg-red-500' : 'bg-eco-600'}`}
                            style={{ width: `${storageStats.percentage}%` }}
                        ></div>
                    </div>
                    <div className="flex justify-between text-xs text-gray-500 mt-2">
                        <span>{(storageStats.usageBytes / 1024 / 1024).toFixed(2)} MB Used</span>
                        <span>Limit: {(storageStats.limitBytes / 1024 / 1024).toFixed(0)} MB</span>
                    </div>
                    {storageStats.isWarning && (
                        <p className="text-red-500 text-sm mt-2 font-medium flex items-center gap-1">
                            <AlertOctagon className="w-4 h-4" /> Warning: Storage is nearly full!
                        </p>
                    )}
                </div>
            )}

            {/* Queue List */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                    <h3 className="font-bold text-gray-800">Pending Actions ({pendingActions.length})</h3>
                    <div className="flex gap-2">
                        <button
                            onClick={handleClear}
                            className="text-red-500 hover:bg-red-50 px-3 py-1.5 rounded-lg text-sm flex items-center gap-1 transition"
                        >
                            <Trash2 className="w-4 h-4" /> Clear All
                        </button>
                        <button
                            onClick={handleSync}
                            disabled={!isOnline || syncing || pendingActions.length === 0}
                            className={`px-4 py-1.5 rounded-lg text-sm font-bold flex items-center gap-2 transition ${isOnline && pendingActions.length > 0
                                    ? 'bg-eco-600 text-white hover:bg-eco-700'
                                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                }`}
                        >
                            <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
                            {syncing ? 'Syncing...' : 'Sync Now'}
                        </button>
                    </div>
                </div>

                {pendingActions.length > 0 ? (
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 text-gray-500">
                            <tr>
                                <th className="p-4">Type</th>
                                <th className="p-4">Priority</th>
                                <th className="p-4">Created</th>
                                <th className="p-4">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {pendingActions.map(action => (
                                <tr key={action.id} className="hover:bg-gray-50">
                                    <td className="p-4 font-medium text-gray-800">{action.type}</td>
                                    <td className="p-4">
                                        <span className={`px-2 py-0.5 rounded text-xs font-bold ${action.priority === 1 ? 'bg-red-100 text-red-700' :
                                                action.priority === 2 ? 'bg-orange-100 text-orange-700' :
                                                    'bg-blue-100 text-blue-700'
                                            }`}>
                                            P-{action.priority}
                                        </span>
                                    </td>
                                    <td className="p-4 text-gray-500">{new Date(action.created_at).toLocaleTimeString()}</td>
                                    <td className="p-4">
                                        <span className="text-orange-600 font-medium">{action.status}</span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <div className="p-8 text-center text-gray-400">
                        <Database className="w-12 h-12 mx-auto mb-2 opacity-20" />
                        <p>Local queue is empty. You are all synced!</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default OfflineSync;
