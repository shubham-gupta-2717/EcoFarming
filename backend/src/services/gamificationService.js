const { db, admin } = require('../config/firebase');

// --- Constants & Config ---

const POINTS_CONFIG = {
    DAILY_CHECKIN: 10,
    MISSION_COMPLETE_EASY: 30,
    MISSION_COMPLETE_MEDIUM: 50,
    MISSION_COMPLETE_HARD: 80,
    PROOF_UPLOAD: 15,
    LEARNING_MODULE: 20,
    COMMUNITY_SHARE: 10,
    STREAK_BONUS_7_DAYS: 20
};

const BADGE_DEFINITIONS = [
    {
        id: 'crop_champion',
        name: 'Crop Champion',
        description: 'Completed 5 crop-specific missions',
        icon: 'Wheat',
        criteria: { type: 'mission_count', category: 'crop_specific', threshold: 5 }
    },
    {
        id: 'water_saver',
        name: 'Water Saver',
        description: 'Completed 3 water conservation missions',
        icon: 'Droplets',
        criteria: { type: 'mission_count', category: 'water', threshold: 3 }
    },
    {
        id: 'pest_protector',
        name: 'Pest Protector',
        description: 'Completed 3 pest management missions',
        icon: 'Bug',
        criteria: { type: 'mission_count', category: 'pest', threshold: 3 }
    },
    {
        id: 'organic_pioneer',
        name: 'Organic Pioneer',
        description: 'Completed 5 organic farming missions',
        icon: 'Sprout',
        criteria: { type: 'mission_count', category: 'organic', threshold: 5 }
    },
    {
        id: 'weather_wizard',
        name: 'Weather Wizard',
        description: 'Completed 3 weather-smart missions',
        icon: 'CloudSun',
        criteria: { type: 'mission_count', category: 'weather_smart', threshold: 3 }
    },
    {
        id: 'streak_master',
        name: 'Streak Master',
        description: 'Maintained a 7-day streak',
        icon: 'Flame',
        criteria: { type: 'streak', threshold: 7 }
    },
    {
        id: 'community_voice',
        name: 'Community Voice',
        description: 'Shared 5 posts in the community',
        icon: 'Users',
        criteria: { type: 'community_posts', threshold: 5 }
    },
    {
        id: 'scholar',
        name: 'Scholar',
        description: 'Completed 5 learning modules',
        icon: 'BookOpen',
        criteria: { type: 'learning_modules', threshold: 5 }
    }
];

// --- Core Service Functions ---

/**
 * Award points to a user and log the activity
 */
const awardPoints = async (userId, points, activityType, description, missionId = null) => {
    try {
        const userRef = db.collection('users').doc(userId);

        await db.runTransaction(async (t) => {
            const userDoc = await t.get(userRef);
            if (!userDoc.exists) return;

            const currentScore = userDoc.data().sustainabilityScore || 0;
            const newScore = currentScore + points;

            // Update User Score
            t.update(userRef, {
                sustainabilityScore: newScore,
                lastActivityDate: admin.firestore.FieldValue.serverTimestamp()
            });

            // Log Activity
            const activityRef = db.collection('user_activity_logs').doc();
            t.set(activityRef, {
                userId,
                missionId,
                type: activityType,
                description,
                pointsAwarded: points,
                createdAt: admin.firestore.FieldValue.serverTimestamp()
            });
        });

        // Trigger Badge Evaluation (Async - fire and forget)
        evaluateBadges(userId);

        return { success: true, pointsAwarded: points };
    } catch (error) {
        console.error('Error awarding points:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Handle Daily Streak Logic
 * Should be called on first activity of the day (e.g., Dashboard load or Check-in)
 */
const updateStreak = async (userId) => {
    try {
        const userRef = db.collection('users').doc(userId);
        const userDoc = await userRef.get();
        if (!userDoc.exists) return;

        const data = userDoc.data();
        const lastCheckIn = data.lastCheckInDate ? data.lastCheckInDate.toDate() : null;
        const now = new Date();

        // Reset time part for comparison
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        let currentStreak = data.currentStreakDays || 0;
        let longestStreak = data.longestStreakDays || 0;
        let streakUpdated = false;

        if (!lastCheckIn) {
            // First time ever
            currentStreak = 1;
            streakUpdated = true;
        } else {
            const lastDate = new Date(lastCheckIn.getFullYear(), lastCheckIn.getMonth(), lastCheckIn.getDate());

            if (lastDate.getTime() === today.getTime()) {
                // Already checked in today, do nothing
                return { streak: currentStreak, updated: false };
            } else if (lastDate.getTime() === yesterday.getTime()) {
                // Consecutive day
                currentStreak += 1;
                streakUpdated = true;
            } else {
                // Broken streak
                currentStreak = 1;
                streakUpdated = true;
            }
        }

        if (streakUpdated) {
            if (currentStreak > longestStreak) {
                longestStreak = currentStreak;
            }

            await userRef.update({
                currentStreakDays: currentStreak,
                longestStreakDays: longestStreak,
                lastCheckInDate: admin.firestore.FieldValue.serverTimestamp()
            });

            // Log check-in points
            await awardPoints(userId, POINTS_CONFIG.DAILY_CHECKIN, 'checkin', 'Daily Check-in');

            // Bonus for 7-day streak
            if (currentStreak % 7 === 0) {
                await awardPoints(userId, POINTS_CONFIG.STREAK_BONUS_7_DAYS, 'streak_bonus', `${currentStreak} Day Streak Bonus!`);
            }
        }

        return { streak: currentStreak, updated: streakUpdated };

    } catch (error) {
        console.error('Error updating streak:', error);
        return { error: error.message };
    }
};

/**
 * Evaluate and award badges based on criteria
 */
const evaluateBadges = async (userId) => {
    try {
        const userRef = db.collection('users').doc(userId);
        const userDoc = await userRef.get();
        if (!userDoc.exists) return;

        const userData = userDoc.data();
        const earnedBadges = userData.badges || [];
        const newBadges = [];

        // Fetch stats needed for criteria
        // 1. Completed Missions Count by Category
        const missionsSnapshot = await db.collection('user_missions')
            .where('userId', '==', userId)
            .where('status', '==', 'completed')
            .get();

        const missionCounts = {};
        missionsSnapshot.forEach(doc => {
            const cat = doc.data().category;
            missionCounts[cat] = (missionCounts[cat] || 0) + 1;
        });
        const totalMissions = missionsSnapshot.size;

        // 2. Community Posts
        // (Assuming we might store a counter on user or query posts)
        // For MVP, let's assume we query posts or rely on a counter if it existed.
        // Let's query for now (might be expensive at scale, but fine for MVP)
        const postsSnapshot = await db.collection('communityPosts')
            .where('authorId', '==', userId)
            .get();
        const postCount = postsSnapshot.size;

        // Evaluate each badge
        for (const badge of BADGE_DEFINITIONS) {
            if (earnedBadges.includes(badge.id)) continue; // Already earned

            let earned = false;
            const c = badge.criteria;

            switch (c.type) {
                case 'mission_count':
                    if (c.category) {
                        if ((missionCounts[c.category] || 0) >= c.threshold) earned = true;
                    } else {
                        if (totalMissions >= c.threshold) earned = true;
                    }
                    break;
                case 'streak':
                    if ((userData.currentStreakDays || 0) >= c.threshold) earned = true;
                    break;
                case 'community_posts':
                    if (postCount >= c.threshold) earned = true;
                    break;
                case 'learning_modules':
                    // Assuming we track this in user profile or separate collection
                    // For MVP, check a field 'learningModulesCompleted' on user
                    if ((userData.learningModulesCompleted || 0) >= c.threshold) earned = true;
                    break;
            }

            if (earned) {
                newBadges.push(badge.id);
                // Log badge award
                await db.collection('user_activity_logs').add({
                    userId,
                    type: 'badge_earned',
                    description: `Earned Badge: ${badge.name}`,
                    badgeId: badge.id,
                    createdAt: admin.firestore.FieldValue.serverTimestamp()
                });
            }
        }

        if (newBadges.length > 0) {
            await userRef.update({
                badges: [...earnedBadges, ...newBadges]
            });
            console.log(`User ${userId} earned badges: ${newBadges.join(', ')}`);
        }

    } catch (error) {
        console.error('Error evaluating badges:', error);
    }
};

/**
 * Get Leaderboard Data
 */
const getLeaderboard = async (scope = 'global', scopeValue = null, limit = 10) => {
    try {
        let query = db.collection('users').orderBy('ecoScore', 'desc');

        if (scope === 'state' && scopeValue) {
            query = query.where('location.state', '==', scopeValue);
        } else if (scope === 'district' && scopeValue) {
            query = query.where('location.district', '==', scopeValue);
        } else if (scope === 'crop' && scopeValue) {
            query = query.where('crop', '==', scopeValue);
        }

        const snapshot = await query.limit(limit).get();

        const leaderboard = [];
        let rank = 1;
        snapshot.forEach(doc => {
            const data = doc.data();
            leaderboard.push({
                userId: doc.id,
                name: data.name,
                score: data.ecoScore || 0,
                location: data.location,
                avatar: data.name ? data.name[0].toUpperCase() : 'U',
                rank: rank++
            });
        });

        return leaderboard;
    } catch (error) {
        console.error('Error fetching leaderboard:', error);
        return [];
    }
};

module.exports = {
    awardPoints,
    updateStreak,
    evaluateBadges,
    getLeaderboard,
    POINTS_CONFIG,
    BADGE_DEFINITIONS
};
