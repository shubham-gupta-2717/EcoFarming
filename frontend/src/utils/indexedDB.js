import { openDB } from 'idb';

const DB_NAME = 'EcoFarmingOfflineDB';
const DB_VERSION = 1;
const STORE_SYNC_QUEUE = 'syncQueue';
const STORE_LOGS = 'offlineLogs';
const STORE_CACHE = 'dataCache'; // New Store for generic caching

// Max Storage: 500MB (Strict Limit)
const MAX_STORAGE_BYTES = 500 * 1024 * 1024; // 500MB

/**
 * Initialize Database
 */
export const initDB = async () => {
    return openDB(DB_NAME, DB_VERSION, {
        upgrade(db) {
            // 1. Sync Queue Store
            if (!db.objectStoreNames.contains(STORE_SYNC_QUEUE)) {
                const store = db.createObjectStore(STORE_SYNC_QUEUE, { keyPath: 'id' });
                store.createIndex('priority', 'priority'); // For sorting
                store.createIndex('created_at', 'created_at');
                store.createIndex('status', 'status');
            }

            // 2. Offline Logs Store
            if (!db.objectStoreNames.contains(STORE_LOGS)) {
                db.createObjectStore(STORE_LOGS, { keyPath: 'id', autoIncrement: true });
            }

            // 3. Data Cache Store (For read-only offline access)
            if (!db.objectStoreNames.contains(STORE_CACHE)) {
                db.createObjectStore(STORE_CACHE); // Key-Value store
            }
        },
    });
};

/**
 * Check Storage Usage
 * @returns {Object} { usageBytes, isFull, isWarning }
 */
export const checkStorageUsage = async () => {
    if (navigator.storage && navigator.storage.estimate) {
        const { usage, quota } = await navigator.storage.estimate();

        // Use our hard limit OR browser quota (whichever is smaller)
        const limit = Math.min(quota, MAX_STORAGE_BYTES);

        return {
            usageBytes: usage,
            usageExceeded: usage >= limit,
            isWarning: usage >= (limit * 0.9), // 90% warning
            limitBytes: limit,
            percentage: ((usage / limit) * 100).toFixed(1)
        };
    }
    return { usageBytes: 0, usageExceeded: false, isWarning: false, limitBytes: MAX_STORAGE_BYTES, percentage: 0 };
};

/**
 * Add Action to Offline Queue
 */
export const addToQueue = async (action) => {
    const db = await initDB();

    // Check storage first
    const { usageExceeded, isWarning } = await checkStorageUsage();
    if (usageExceeded) {
        throw new Error("Offline Storage Full (500MB limit reached). Please connect to internet.");
    }

    if (isWarning) {
        console.warn("⚠️ Offline Storage is 90% full.");
    }

    await db.add(STORE_SYNC_QUEUE, action);
    return action.id;
};

/**
 * Save Data to Cache (Overwrite)
 */
export const saveToCache = async (key, data) => {
    try {
        const db = await initDB();
        await db.put(STORE_CACHE, data, key);
        console.log(`✅ Cached data for: ${key}`);
    } catch (error) {
        console.error("Cache Save Error:", error);
    }
};

/**
 * Get Data from Cache
 */
export const getFromCache = async (key) => {
    try {
        const db = await initDB();
        return await db.get(STORE_CACHE, key);
    } catch (error) {
        console.error("Cache Read Error:", error);
        return null;
    }
};

/**
 * Get All Pending Actions (Sorted by Priority)
 * Priority: 1 (Highest) -> 99 (Lowest)
 */
export const getPendingActions = async () => {
    const db = await initDB();
    const actions = await db.getAllFromIndex(STORE_SYNC_QUEUE, 'priority');
    return actions.filter(a => a.status === 'PENDING' || a.status === 'RETRYING'); // Ignore successfully processed if logic keeps them
};

/**
 * Remove Action (After successful sync)
 */
export const removeFromQueue = async (id) => {
    const db = await initDB();
    await db.delete(STORE_SYNC_QUEUE, id);
};

/**
 * Add Log (Audit)
 */
export const logOfflineEvent = async (event) => {
    const db = await initDB();
    await db.add(STORE_LOGS, {
        event,
        timestamp: new Date().toISOString()
    });
};

/**
 * Clear All Data (Emergency / Logout)
 */
export const clearOfflineData = async () => {
    const db = await initDB();
    await db.clear(STORE_SYNC_QUEUE);
    await db.clear(STORE_LOGS);
};
