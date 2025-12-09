import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

const useEcoStore = create(
    persist(
        (set, get) => ({
            // --- State ---
            userProfile: null,
            activeMissions: [],
            pendingMissions: [],
            completedMissions: [],
            badgesEarned: [],
            leaderboardSnapshot: [],
            learningProgress: {},
            communityPosts: [],
            notifications: [],

            // --- Admin/Institute State ---
            adminStats: {
                totalFarmers: 0,
                pendingVerifications: 0,
                approvedToday: 0,
                rejectedToday: 0
            },
            recentActivity: [],
            recentFarmers: [],

            settings: {
                language: 'en',
                theme: 'light',
                notificationsEnabled: true
            },

            // --- Actions ---

            // User Profile
            setUserProfile: (profile) => set({ userProfile: profile }),
            updateEcoScore: (score) => set((state) => ({
                userProfile: { ...state.userProfile, ecoScore: score }
            })),

            // Missions
            setMissions: (missions) => {
                const active = [];
                const pending = [];
                const completed = [];

                missions.forEach(m => {
                    const status = m.status?.toLowerCase();
                    if (status === 'active') active.push(m);
                    else if (status === 'pending') pending.push(m);
                    else if (status === 'completed' || status === 'verified' || status === 'submitted') completed.push(m);
                });

                set({
                    activeMissions: active,
                    pendingMissions: pending,
                    completedMissions: completed
                });
            },

            // Badges
            setBadges: (badges) => set({ badgesEarned: badges }),
            addBadge: (badgeId) => set((state) => ({
                badgesEarned: [...state.badgesEarned, badgeId]
            })),

            // Leaderboard
            setLeaderboard: (data) => set({ leaderboardSnapshot: data }),

            // Learning
            setLearningProgress: (progressMap) => set({ learningProgress: progressMap }),
            updateModuleProgress: (moduleId, status, score) => set((state) => ({
                learningProgress: {
                    ...state.learningProgress,
                    [moduleId]: { status, score, updatedAt: new Date().toISOString() }
                }
            })),

            // Community
            setCommunityPosts: (posts) => set({ communityPosts: posts }),
            addCommunityPost: (post) => set((state) => ({
                communityPosts: [post, ...state.communityPosts]
            })),

            // Admin Actions
            setAdminStats: (stats) => set({ adminStats: stats }),
            setRecentActivity: (activity) => set({ recentActivity: activity }),
            setRecentFarmers: (farmers) => set({ recentFarmers: farmers }),

            // General
            clearAll: () => set({
                userProfile: null,
                activeMissions: [],
                pendingMissions: [],
                completedMissions: [],
                badgesEarned: [],
                leaderboardSnapshot: [],
                learningProgress: {},
                communityPosts: [],
                notifications: []
            }),

            // Helper Actions (Async)
            syncLeaderboard: async (scope, value) => {
                try {
                    // Dynamic import to avoid circular dependency if possible, or just use fetch/axios
                    // Assuming api service is available or we pass it in. 
                    // For simplicity in Zustand, we can import api here if it doesn't use the store.
                    // api.js uses localStorage for token, so it's fine.
                    const { default: api } = await import('../services/api');
                    const response = await api.get(`/gamification/leaderboard?scope=${scope}&value=${value}`);
                    set({ leaderboardSnapshot: response.data.leaderboard });
                } catch (error) {
                    console.error('Failed to sync leaderboard:', error);
                }
            },

            refreshAll: () => {
                console.log('Refreshing all data...');
                // Trigger re-fetches if needed
            }
        }),
        {
            name: 'eco-farming-storage',
            storage: createJSONStorage(() => localStorage),
            partialize: (state) => ({
                userProfile: state.userProfile,
                activeMissions: state.activeMissions,
                badgesEarned: state.badgesEarned,
                leaderboardSnapshot: state.leaderboardSnapshot,
                settings: state.settings
            })
        }
    )
);

export default useEcoStore;
