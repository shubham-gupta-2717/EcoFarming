import { useEffect } from 'react';
import { db } from '../config/firebase'; // Ensure this points to your firebase config
import { collection, doc, onSnapshot, query, where, orderBy, limit } from 'firebase/firestore';
import useEcoStore from '../store/useEcoStore';
import { useAuth } from '../context/AuthContext';

const useFirestoreSync = () => {
    const { user } = useAuth();
    const {
        setUserProfile,
        setMissions,
        setBadges,
        setLearningProgress,
        setCommunityPosts
    } = useEcoStore();

    useEffect(() => {
        if (!user?.uid) return;

        const userId = user.uid;
        console.log('Starting Firestore Sync for:', userId);

        // 1. User Profile Sync
        const unsubUser = onSnapshot(doc(db, 'users', userId), (doc) => {
            if (doc.exists()) {
                const data = doc.data();
                setUserProfile({ id: doc.id, ...data });
                // Also sync badges from profile if stored there
                if (data.badges) {
                    setBadges(data.badges);
                }
            }
        }, (error) => console.error("User Sync Error:", error));

        // 2. Missions Sync
        const syncMissions = async () => {
            // A. Try Load from Cache First (Offline Support)
            try {
                const { getFromCache } = await import('../utils/indexedDB');
                const cachedMissions = await getFromCache(`missions_${userId}`);
                if (cachedMissions) {
                    console.log('📦 Loaded missions from offline cache');
                    setMissions(cachedMissions);
                }
            } catch (err) {
                console.warn('Cache load failed', err);
            }

            // B. Listen to Live Updates
            const qMissions = query(
                collection(db, 'user_missions'),
                where('userId', '==', userId)
            );

            return onSnapshot(qMissions, async (snapshot) => {
                const missions = [];
                snapshot.forEach(doc => {
                    missions.push({ id: doc.id, ...doc.data() });
                });

                setMissions(missions);

                // C. Update Cache
                try {
                    const { saveToCache } = await import('../utils/indexedDB');
                    await saveToCache(`missions_${userId}`, missions);
                } catch (err) {
                    console.error("Failed to cache missions", err);
                }
            }, (error) => console.error("Missions Sync Error:", error));
        };

        const unsubMissionsPromise = syncMissions();

        // 3. Learning Progress Sync
        const qLearning = query(
            collection(db, 'learningProgress'),
            where('farmerId', '==', userId)
        );

        const unsubLearning = onSnapshot(qLearning, (snapshot) => {
            const progress = {};
            snapshot.forEach(doc => {
                const data = doc.data();
                progress[data.moduleId] = data;
            });
            setLearningProgress(progress);
        }, (error) => console.error("Learning Sync Error:", error));

        // 4. Community Posts (User's posts)
        const qPosts = query(
            collection(db, 'communityPosts'),
            where('authorId', '==', userId),
            orderBy('createdAt', 'desc'),
            limit(20)
        );

        const unsubPosts = onSnapshot(qPosts, (snapshot) => {
            const posts = [];
            snapshot.forEach(doc => {
                posts.push({ id: doc.id, ...doc.data() });
            });
            setCommunityPosts(posts);
        }, (error) => console.error("Community Sync Error:", error));

        // 5. Admin/Institute Specific Sync
        let unsubAdminProfile = () => { };
        let unsubRecentFarmers = () => { };
        let unsubRecentActivity = () => { };

        // Check if user is admin or institution (using role or collection check if available in user object)
        // Assuming user object has role. If not, we might need to fetch it first or rely on auth context.
        if (user.role === 'admin' || user.role === 'institution') {
            console.log('Starting Admin Sync');
            const { setAdminStats, setRecentActivity, setRecentFarmers } = useEcoStore.getState();

            // A. Admin Profile / Stats (if stored in profile)
            // For now, let's assume stats might be calculated or stored in a summary doc.
            // Since we don't have a dedicated stats doc yet, we'll skip real-time stats for now 
            // OR we can listen to the collections to count (expensive)
            // Better: Listen to a 'dashboard_stats' document if we had one.
            // For MVP: We will just listen to the lists which is the most visible part.

            // B. Recent Farmers (New Users)
            const qFarmers = query(
                collection(db, 'users'),
                where('role', '==', 'farmer'),
                orderBy('createdAt', 'desc'),
                limit(5)
            );

            unsubRecentFarmers = onSnapshot(qFarmers, (snapshot) => {
                const farmers = [];
                snapshot.forEach(doc => farmers.push({ id: doc.id, ...doc.data() }));
                setRecentFarmers(farmers);

                // Simple client-side stat update for total farmers (approx)
                // In real app, use a counter trigger
                setAdminStats(prev => ({ ...prev, totalFarmers: snapshot.size + (prev.totalFarmers > 5 ? prev.totalFarmers - 5 : 0) }));
            });

            // C. Recent Activity (Mission Submissions)
            const qActivity = query(
                collection(db, 'user_missions'),
                where('status', 'in', ['pending_verification', 'completed']),
                orderBy('updatedAt', 'desc'),
                limit(5)
            );

            unsubRecentActivity = onSnapshot(qActivity, (snapshot) => {
                const activities = [];
                let pendingCount = 0;
                snapshot.forEach(doc => {
                    const data = doc.data();
                    activities.push({ id: doc.id, ...data });
                    if (data.status === 'pending_verification') pendingCount++;
                });
                setRecentActivity(activities);
                // Update pending count estimate
                setAdminStats(prev => ({ ...prev, pendingVerifications: pendingCount }));
            });
        }

        // Cleanup
        return () => {
            console.log('Stopping Firestore Sync');
            unsubUser();
            unsubMissionsPromise.then(unsub => unsub && unsub()); // Handle async unsub
            unsubLearning();
            unsubPosts();
            unsubAdminProfile();
            unsubRecentFarmers();
            unsubRecentActivity();
        };

    }, [user?.uid]); // Re-run only if user changes
};

export default useFirestoreSync;
