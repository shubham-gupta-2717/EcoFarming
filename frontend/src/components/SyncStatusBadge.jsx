import React, { useEffect, useState } from 'react';
import { Database, UploadCloud } from 'lucide-react';
import { checkStorageUsage, getPendingActions } from '../utils/indexedDB';

const SyncStatusBadge = () => {
    const [stats, setStats] = useState(null);
    const [pendingCount, setPendingCount] = useState(0);

    const refreshStats = async () => {
        const usage = await checkStorageUsage();
        const pending = await getPendingActions();
        setStats(usage);
        setPendingCount(pending.length);
    };

    useEffect(() => {
        refreshStats();
        const interval = setInterval(refreshStats, 5000); // Poll every 5s
        return () => clearInterval(interval);
    }, []);

    if (!stats) return null;

    return (
        <div className="flex items-center gap-4 text-xs font-medium text-gray-600 bg-gray-50 px-3 py-1 rounded-full border border-gray-200">
            <div className="flex items-center gap-1" title={`${(stats.usageBytes / 1024 / 1024).toFixed(1)}MB Used`}>
                <Database className="w-3 h-3 text-eco-600" />
                <span>{stats.percentage}% Storage</span>
            </div>
            {pendingCount > 0 && (
                <div className="flex items-center gap-1 text-orange-600">
                    <UploadCloud className="w-3 h-3" />
                    <span>{pendingCount} Pending</span>
                </div>
            )}
        </div>
    );
};

export default SyncStatusBadge;
