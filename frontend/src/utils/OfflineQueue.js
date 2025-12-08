import { addToQueue, getPendingActions, removeFromQueue, logOfflineEvent } from './indexedDB';
import { encryptPayload, decryptPayload, generateParamsHash } from './crypto';
import api from '../services/api';

// Priorities
export const PRIORITY = {
    DISASTER: 1,      // Extremely Critical
    MISSION_PROOF: 2, // High Value (Credits)
    TICKET: 3,        // Admin Request
    COMMUNITY: 4,     // Social
    LOG: 5            // background
};

// Helper: Convert Blob to Base64
const blobToBase64 = (blob) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
};

// Helper: Convert Base64 to Blob
const base64ToBlob = async (base64Data) => {
    const res = await fetch(base64Data);
    return await res.blob();
};

class OfflineQueueManager {
    constructor() {
        this.isSyncing = false;
    }

    /**
     * Queue an action securely
     * @param {String} type - Action type
     * @param {Object} data - Payload data
     * @param {Number} priority - Priority level
     */
    async output(type, data, priority = 5) {
        try {
            // 1. Serialization Fix: Convert any Blobs to Base64 (String)
            // JSON.stringify will destroy Blobs, so we must manually convert them first.
            const serializedData = { ...data };

            if (serializedData.imageBlob && serializedData.imageBlob instanceof Blob) {
                serializedData.imageBlob = await blobToBase64(serializedData.imageBlob);
            }
            // Note: DisasterHelp already sends 'photoBase64', which is fine.

            // 2. Generate ID and Hash
            const id = crypto.randomUUID();
            const hash = generateParamsHash(serializedData);

            // 3. Encrypt Payload
            const encryptedPayload = encryptPayload(serializedData);

            // 4. Construct Record
            const record = {
                id,
                type,
                payload: encryptedPayload,
                hash, // Conflict detection
                priority,
                created_at: new Date().toISOString(),
                status: 'PENDING',
                retryCount: 0
            };

            // 5. Save to IndexedDB
            await addToQueue(record);
            await logOfflineEvent(`Queued ${type} (ID: ${id.slice(0, 8)})`);

            console.log(`✅ Offline Action Queued: ${type}`);
            return true;
        } catch (error) {
            console.error("Failed to queue offline action:", error);
            throw error; // Let UI know
        }
    }

    /**
     * Process the Sync Queue
     * Called when connection restores or manually triggered
     */
    async processQueue() {
        if (this.isSyncing || !navigator.onLine) return; // Prevent double sync or offline sync attempts

        this.isSyncing = true;
        console.log("🔄 Starting Offline Sync...");

        try {
            const pending = await getPendingActions(); // Returns sorted by priority

            if (pending.length === 0) {
                console.log("✅ Nothing to sync.");
                this.isSyncing = false;
                return;
            }

            for (const action of pending) {
                try {
                    // 1. Decrypt
                    const data = decryptPayload(action.payload);
                    if (!data) throw new Error("Decryption failed (Data corrupted)");

                    // 2. Send to Server (Generic sync endpoint or specific endpoints)
                    await this.sendToServer(action.type, data);

                    // 3. Delete from Local DB on Success
                    await removeFromQueue(action.id);
                    await logOfflineEvent(`Synced ${action.type} (ID: ${action.id.slice(0, 8)})`);

                } catch (err) {
                    console.error(`❌ Sync Failed for ${action.id} (${action.type}):`, err);
                    // Increment retry or mark failed?
                    // For now, next sync loop picks it up.
                }
            }

            // Reload page or trigger global refresh if needed
            // window.location.reload(); // Too aggressive
            console.log("✅ Sync Batch Complete");

        } catch (error) {
            console.error("Critical Sync Error:", error);
        } finally {
            this.isSyncing = false;
        }
    }

    /**
     * Dispatcher to correct API endpoint
     */
    async sendToServer(type, data) {
        console.log(`📡 Syncing ${type}...`);

        switch (type) {
            case 'MISSION_PROOF':
                await this.uploadMissionProof(data);
                break;

            case 'COMMUNITY_POST':
                await this.uploadCommunityPost(data);
                break;

            case 'DISASTER_REPORT':
                // DisasterHelp passes { type, details, photoBase64, gps }
                // API Implementation in DisasterHelp.jsx: api.post('/disaster', requestData)
                // requestData matches exactly what we stored (except key name standardisation)
                await api.post('/disaster', {
                    type: data.type,
                    details: data.details,
                    photo: data.photoBase64, // The API expects base64 string directly here
                    gps: data.gps
                });
                break;

            case 'TICKET_CREATE':
                // RaiseTicket.jsx passes { type, description, imageBlob (as Blob!) }
                // But RaiseTicket.jsx implementation for ONLINE was: api.post('/tickets', { type, description, photo })
                // We need to match that.
                await api.post('/tickets', {
                    type: data.type,
                    description: data.description,
                    photo: data.imageBlob // This in RaiseTicket.jsx was just "mock-photo-url".
                    // If we want real upload, we need FormData, but the current backend is mocked for tickets photo.
                    // We will send the base64 string if it exists.
                });
                break;

            default:
                console.warn("Unknown sync type:", type);
        }
    }

    async uploadMissionProof(data) {
        // MissionDetail.jsx: api.post(`/missions/${id}/submit`, formData)
        // Fields: 'image', 'notes'
        const formData = new FormData();

        if (data.notes) formData.append('notes', data.notes);

        if (data.imageBlob) { // This is now a Base64 string from IDB
            const blob = await base64ToBlob(data.imageBlob);
            formData.append('image', blob, 'proof.jpg');
        }

        await api.post(`/missions/${data.missionId}/submit`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
    }

    async uploadCommunityPost(data) {
        // CreatePostWidget.jsx: api.post('/community/post', formData)
        // Fields: 'content', 'file'
        const formData = new FormData();
        formData.append('content', data.content);

        if (data.imageBlob) { // Base64 string from IDB
            const blob = await base64ToBlob(data.imageBlob);
            formData.append('file', blob, 'post-image.jpg');
        }

        await api.post('/community/post', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
    }
}

export const offlineQueue = new OfflineQueueManager();
