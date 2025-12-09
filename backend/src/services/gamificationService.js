const { db, admin } = require('../config/firebase');
console.log('--- GAMIFICATION SERVICE LOADED ---');

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
    // 1. Soil Health & Land Management
    {
        id: 'soil_saver',
        name: 'Soil Saver',
        description: 'Completed first soil test and recorded result',
        icon: '🟫',
        category: 'Soil Management',
        criteria: { type: 'mission_count', category: 'soil_test', threshold: 1 }
    },
    {
        id: 'healthy_soil_advocate',
        name: 'Healthy Soil Advocate',
        description: 'Completed 3 soil tests across different seasons',
        icon: '🌱',
        category: 'Soil Nutrition',
        criteria: { type: 'mission_count', category: 'soil_test', threshold: 3 }
    },
    {
        id: 'mulching_master',
        name: 'Mulching Master',
        description: 'Completed 3 mulching tasks',
        icon: '🪵',
        category: 'Mulching Practice',
        criteria: { type: 'mission_count', category: 'mulching', threshold: 3 }
    },
    {
        id: 'zero_till_starter',
        name: 'Zero-Till Starter',
        description: 'Performed first Zero Tillage activity',
        icon: '🚜',
        category: 'Low-Till Practices',
        criteria: { type: 'mission_count', category: 'zero_till', threshold: 1 }
    },
    {
        id: 'soil_moisture_guardian',
        name: 'Soil Moisture Guardian',
        description: 'Used moisture readings for 7 days',
        icon: '💧',
        category: 'Irrigation Efficiency',
        criteria: { type: 'mission_count', category: 'moisture_check', threshold: 7 }
    },

    // 2. Water Conservation
    {
        id: 'water_warrior',
        name: 'Water Warrior',
        description: 'Reduced irrigation by 20%',
        icon: '💧',
        category: 'Water-Saving',
        criteria: { type: 'mission_count', category: 'water_saving', threshold: 1 }
    },
    {
        id: 'drip_champion',
        name: 'Drip Champion',
        description: 'Used drip irrigation for a full crop cycle',
        icon: '🌊',
        category: 'Irrigation Technology',
        criteria: { type: 'mission_count', category: 'drip_irrigation', threshold: 1 } // Simplified for MVP
    },
    {
        id: 'smart_irrigator',
        name: 'Smart Irrigator',
        description: 'Followed irrigation schedule for 14 days',
        icon: '🚿',
        category: 'Smart Practices',
        criteria: { type: 'mission_count', category: 'smart_irrigation', threshold: 14 }
    },

    // 3. Organic & Chemical-Free
    {
        id: 'organic_beginner',
        name: 'Organic Beginner',
        description: 'Used organic fertilizer for the first time',
        icon: '🍃',
        category: 'Organic Inputs',
        criteria: { type: 'mission_count', category: 'organic_fertilizer', threshold: 1 }
    },
    {
        id: 'bio_pesticide_champion',
        name: 'Bio-Pesticide Champion',
        description: 'Switched to bio-pesticides for a season',
        icon: '🧴',
        category: 'Pest Management',
        criteria: { type: 'mission_count', category: 'bio_pesticide', threshold: 5 }
    },
    {
        id: 'chemical_free_farmer',
        name: 'Chemical-Free Farmer',
        description: '30 days without chemical pesticides',
        icon: '⚗️',
        category: 'Clean Farming',
        criteria: { type: 'mission_count', category: 'chemical_free', threshold: 30 } // Modeled as 30 check-ins/tasks
    },
    {
        id: 'natural_input_producer',
        name: 'Natural Input Producer',
        description: 'Prepared natural formulation (Jeevamrut/Panchagavya)',
        icon: '🌿',
        category: 'Homemade Solutions',
        criteria: { type: 'mission_count', category: 'natural_formulation', threshold: 1 }
    },

    // 4. Crop Diversity
    {
        id: 'mixed_crop_explorer',
        name: 'Mixed-Crop Explorer',
        description: 'Added 2 different crops in same season',
        icon: '🌾',
        category: 'Crop Diversity',
        criteria: { type: 'mission_count', category: 'mixed_cropping', threshold: 1 }
    },
    {
        id: 'crop_rotation_hero',
        name: 'Crop Rotation Hero',
        description: 'Rotated crops for two cycles',
        icon: '🌻',
        category: 'Sustainable Crop Planning',
        criteria: { type: 'mission_count', category: 'crop_rotation', threshold: 2 }
    },
    {
        id: 'pulse_promoter',
        name: 'Pulse Promoter',
        description: 'Grew legume crop for soil fertility',
        icon: '🫘',
        category: 'Nitrogen Fixing Crops',
        criteria: { type: 'mission_count', category: 'legume_farming', threshold: 1 }
    },

    // 5. Learning & Knowledge
    {
        id: 'learning_starter',
        name: 'Learning Starter',
        description: 'Completed first learning module',
        icon: '📘',
        category: 'Education',
        criteria: { type: 'learning_modules', threshold: 1 }
    },
    {
        id: 'knowledge_guru',
        name: 'Knowledge Guru',
        description: 'Finished 10 educational modules',
        icon: '📚',
        category: 'Advanced Learning',
        criteria: { type: 'learning_modules', threshold: 10 }
    },
    {
        id: 'quiz_master',
        name: 'Quiz Master',
        description: 'Scored 80%+ in 3 quizzes',
        icon: '🎯',
        category: 'Engagement',
        criteria: { type: 'quiz_score', threshold: 3 } // Needs implementation in evaluateBadges
    },
    {
        id: 'perfect_ten',
        name: 'Perfect Ten',
        description: 'Completed 10 modules with 100% score',
        icon: '🔟',
        category: 'Education',
        criteria: { type: 'learning_modules_perfect_score', threshold: 10 }
    },
    {
        id: 'streak_master',
        name: 'Streak Master',
        description: 'Completed 5 consecutive modules with 100% score',
        icon: '⚡',
        category: 'Education',
        criteria: { type: 'learning_streak', threshold: 5 }
    },
    {
        id: 'scholar',
        name: 'Scholar',
        description: 'Completed 20 learning modules',
        icon: '🎓',
        category: 'Education',
        criteria: { type: 'learning_modules', threshold: 20 }
    },

    // 6. Community
    {
        id: 'community_contributor',
        name: 'Community Contributor',
        description: 'Posted first tip/story',
        icon: '🗣',
        category: 'Social',
        criteria: { type: 'community_posts', threshold: 1 }
    },
    {
        id: 'peer_helper',
        name: 'Peer Helper',
        description: 'Helped 3 farmers',
        icon: '🤝',
        category: 'Community Support',
        criteria: { type: 'community_replies', threshold: 3 }
    },

    // 7. Consistency
    {
        id: '3_day_streak',
        name: '3-Day Streak',
        description: 'Logged in/completed tasks for 3 days',
        icon: '🔥',
        category: 'App Usage',
        criteria: { type: 'streak', threshold: 3 }
    },
    {
        id: '7_day_streak',
        name: '7-Day Streak Champion',
        description: 'Maintained 7-day streak',
        icon: '🔥🔥',
        category: 'Motivation',
        criteria: { type: 'streak', threshold: 7 }
    },
    {
        id: 'habit_builder',
        name: 'Habit Builder',
        description: 'Maintained 30-day streak',
        icon: '🏅',
        category: 'Long-Term Consistency',
        criteria: { type: 'streak', threshold: 30 }
    },

    // 8. Environmental Impact
    {
        id: 'climate_warrior',
        name: 'Climate Warrior',
        description: 'Improved eco-score by 100 points',
        icon: '🌎',
        category: 'Eco Impact',
        criteria: { type: 'eco_score_gain', threshold: 100 } // Needs implementation
    },
    {
        id: 'carbon_reducer',
        name: 'Carbon Reducer',
        description: 'Used renewable/low-emission practices',
        icon: '🪵',
        category: 'Low Emissions',
        criteria: { type: 'mission_count', category: 'low_emission', threshold: 1 }
    },
    {
        id: 'biodiversity_booster',
        name: 'Biodiversity Booster',
        description: 'Grew pollinator-friendly crop',
        icon: '🦋',
        category: 'Environment',
        criteria: { type: 'mission_count', category: 'biodiversity', threshold: 1 }
    },

    // 9. Special Recognition
    {
        id: 'progressive_farmer',
        name: 'Progressive Farmer',
        description: 'Completed 25 sustainable tasks',
        icon: '💼',
        category: 'Mastery',
        criteria: { type: 'mission_count', category: 'any', threshold: 25 }
    },
    {
        id: 'sustainable_hero',
        name: 'Sustainable Hero',
        description: 'Reached Level 10',
        icon: '🏅',
        category: 'High Achievement',
        criteria: { type: 'level', threshold: 10 }
    },
    {
        id: 'eco_legend',
        name: 'Eco Legend',
        description: '100-day streak + >1000 eco-score',
        icon: '👑',
        category: 'Ultimate Badge',
        criteria: { type: 'legend_status', threshold: 1 }
    },

    // New Additions
    {
        id: 'residue_recycler',
        name: 'Residue Recycler',
        description: 'Mulched/composted crop residue',
        icon: '♻️',
        category: 'Sustainable Practice',
        criteria: { type: 'mission_count', category: 'residue_management', threshold: 1 }
    },
    {
        id: 'compost_creator',
        name: 'Compost Creator',
        description: 'Created compost from farm waste',
        icon: '🪵',
        category: 'Sustainable Practice',
        criteria: { type: 'mission_count', category: 'composting', threshold: 1 }
    },
    {
        id: 'microbial_booster',
        name: 'Microbial Booster',
        description: 'Used microbial cultures',
        icon: '🧫',
        category: 'Sustainable Practice',
        criteria: { type: 'mission_count', category: 'microbial_culture', threshold: 1 }
    },
    {
        id: 'bio_fertilizer_user',
        name: 'Bio-Fertilizer User',
        description: 'Applied bio-fertilizers in 3 tasks',
        icon: '🪻',
        category: 'Sustainable Practice',
        criteria: { type: 'mission_count', category: 'bio_fertilizer', threshold: 3 }
    },
    {
        id: 'intercrop_innovator',
        name: 'Intercrop Innovator',
        description: 'Added an intercrop',
        icon: '🌺',
        category: 'Crop Management',
        criteria: { type: 'mission_count', category: 'intercropping', threshold: 1 }
    },
    {
        id: 'soil_amendment_pro',
        name: 'Soil Amendment Pro',
        description: 'Applied soil corrective inputs',
        icon: '🧪',
        category: 'Crop Management',
        criteria: { type: 'mission_count', category: 'soil_amendment', threshold: 1 }
    },
    {
        id: 'predator_protector',
        name: 'Predator Protector',
        description: 'Encouraged predator insects',
        icon: '🐞',
        category: 'Natural Pest Management',
        criteria: { type: 'mission_count', category: 'predator_conservation', threshold: 1 }
    },
    {
        id: 'neem_master',
        name: 'Neem Master',
        description: 'Applied neem extract',
        icon: '🍵',
        category: 'Natural Pest Management',
        criteria: { type: 'mission_count', category: 'neem_application', threshold: 1 }
    },
    {
        id: 'homemade_spray_hero',
        name: 'Homemade Spray Hero',
        description: 'Prepared natural homemade spray',
        icon: '🧄',
        category: 'Natural Pest Management',
        criteria: { type: 'mission_count', category: 'homemade_spray', threshold: 1 }
    },
    {
        id: 'pollinator_protector',
        name: 'Pollinator Protector',
        description: 'Grew pollinator-friendly plants',
        icon: '🌸',
        category: 'Organic & Eco-Friendly',
        criteria: { type: 'mission_count', category: 'pollinator_support', threshold: 1 }
    },
    {
        id: 'earthworm_guardian',
        name: 'Earthworm Guardian',
        description: 'Practices increasing earthworm activity',
        icon: '🪱',
        category: 'Organic & Eco-Friendly',
        criteria: { type: 'mission_count', category: 'earthworm_friendly', threshold: 1 }
    },
    {
        id: 'first_sustainable_step',
        name: 'First Sustainable Step',
        description: 'Completed first sustainable task',
        icon: '🌱',
        category: 'Engagement',
        criteria: { type: 'mission_count', category: 'any', threshold: 1 }
    },
    {
        id: 'weekly_warrior',
        name: 'Weekly Warrior',
        description: 'Completed sustainable tasks 7 days in a row',
        icon: '📅',
        category: 'Engagement',
        criteria: { type: 'streak', threshold: 7 }
    },
    {
        id: 'rain_saver',
        name: 'Rain Saver',
        description: 'Used rainwater harvesting methods',
        icon: '🌧',
        category: 'Engagement',
        criteria: { type: 'mission_count', category: 'rainwater_harvesting', threshold: 1 }
    },
    {
        id: 'insect_identifier',
        name: 'Insect Identifier',
        description: 'Identified pests/diseases 10 times',
        icon: '🔍',
        category: 'Training',
        criteria: { type: 'mission_count', category: 'pest_identification', threshold: 10 }
    },
    {
        id: 'eco_pioneer',
        name: 'Eco Pioneer',
        description: 'Completed 50 sustainable tasks',
        icon: '💎',
        category: 'Special',
        criteria: { type: 'mission_count', category: 'any', threshold: 50 }
    }
];

// --- Core Service Functions ---

/**
 * Centralized function to update EcoScore and log history
 * @param {string} userId - User ID
 * @param {number} points - Points to add (can be negative)
 * @param {string} actionType - Reason category (MISSION_APPROVAL, etc.)
 * @param {string} reason - Detailed reason
 * @param {string} missionId - Optional Mission ID
 */
const updateEcoScore = async (userId, points, actionType, reason, missionId = null) => {
    try {
        const userRef = db.collection('users').doc(userId);
        const historyRef = db.collection('ecoscore_history').doc();
        const creditHistoryRef = db.collection('credit_history').doc();

        // Calculate Credit Change (1 Credit per 10 EcoScore)
        // Using floor to only award full credits
        // Example: 25 Points -> 2 Credits. -15 Points -> -1 Credits.
        const creditChange = Math.floor(points / 10);

        await db.runTransaction(async (t) => {
            const userDoc = await t.get(userRef);
            if (!userDoc.exists) throw new Error('User not found');

            const currentScore = userDoc.data().ecoScore || 0;
            const currentCredits = userDoc.data().credits || 0;

            const newScore = currentScore + points;
            const newCredits = currentCredits + creditChange;

            // 1. Update User Score & Credits
            t.update(userRef, {
                ecoScore: newScore,
                credits: newCredits,
                lastActivityDate: admin.firestore.FieldValue.serverTimestamp()
            });

            // 2. Insert EcoScore History Record (Atomic)
            t.set(historyRef, {
                userId,
                oldScore: currentScore,
                newScore: newScore,
                change: points,
                reason,
                actionType,
                missionId: missionId || null,
                timestamp: admin.firestore.FieldValue.serverTimestamp()
            });

            // 3. Insert Credit History Record (if changed)
            if (creditChange !== 0) {
                t.set(creditHistoryRef, {
                    userId,
                    oldCredits: currentCredits,
                    newCredits: newCredits,
                    change: creditChange,
                    reason: `EcoScore Convert: ${reason}`,
                    actionType: 'ECOSCORE_CONVERSION',
                    relatedHistoryId: historyRef.id, // Link to EcoScore history
                    timestamp: admin.firestore.FieldValue.serverTimestamp()
                });
            }
        });

        // Trigger Badge Evaluation (Async)
        evaluateBadges(userId);

        return { success: true, newScore: (await userRef.get()).data().ecoScore };

    } catch (error) {
        console.error('Error updating EcoScore:', error);
        throw error;
    }
};

/**
 * Legacy wrapper for backward compatibility
 */
const awardPoints = async (userId, points, activityType, description, missionId = null) => {
    // Map legacy types to new Action Types if needed, or default
    const actionMap = {
        'mission_complete': 'MISSION_APPROVAL',
        'checkin': 'COMMUNITY_REWARD',
        'streak_bonus': 'COMMUNITY_REWARD'
    };
    const actionType = actionMap[activityType] || 'COMMUNITY_REWARD';
    return updateEcoScore(userId, points, actionType, description, missionId);
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
            await updateEcoScore(userId, POINTS_CONFIG.DAILY_CHECKIN, 'COMMUNITY_REWARD', 'Daily Check-in');

            // Bonus for 7-day streak
            if (currentStreak % 7 === 0) {
                await updateEcoScore(userId, POINTS_CONFIG.STREAK_BONUS_7_DAYS, 'COMMUNITY_REWARD', `${currentStreak} Day Streak Bonus!`);
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
                    if (c.category === 'any') {
                        if (totalMissions >= c.threshold) earned = true;
                    } else if (c.category) {
                        if ((missionCounts[c.category] || 0) >= c.threshold) earned = true;
                    }
                    break;
                case 'streak':
                    if ((userData.currentStreakDays || 0) >= c.threshold) earned = true;
                    break;
                case 'community_posts':
                    if (postCount >= c.threshold) earned = true;
                    break;
                case 'community_replies':
                    // MVP: Assume replies are tracked or just use post count for now
                    if (postCount >= c.threshold) earned = true;
                    break;
                case 'learning_modules':
                    if ((userData.learningModulesCompleted || 0) >= c.threshold) earned = true;
                    break;
                case 'learning_modules_perfect_score':
                    if ((userData.learningModulesPerfectScore || 0) >= c.threshold) earned = true;
                    break;
                case 'learning_streak':
                    if ((userData.currentPerfectScoreStreak || 0) >= c.threshold) earned = true;
                    break;
                case 'level':
                    // Level calculation: EcoScore / 1000
                    const level = Math.floor((userData.ecoScore || 0) / 1000) + 1;
                    if (level >= c.threshold) earned = true;
                    break;
                case 'eco_score_gain':
                    // MVP: Treat as total score threshold for now
                    if ((userData.ecoScore || 0) >= c.threshold) earned = true;
                    break;
                case 'quiz_score':
                    // MVP: Check if they have high quiz scores (mocked field)
                    if ((userData.highScoreQuizzes || 0) >= c.threshold) earned = true;
                    break;
                case 'legend_status':
                    if ((userData.currentStreakDays || 0) >= 100 && (userData.ecoScore || 0) >= 1000) earned = true;
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
        const fs = require('fs');
        const path = require('path');
        const debugLogPath = path.join(__dirname, '../../logs/debug.log');

        const logDebug = (msg) => {
            try {
                if (!fs.existsSync(path.dirname(debugLogPath))) fs.mkdirSync(path.dirname(debugLogPath), { recursive: true });
                fs.appendFileSync(debugLogPath, `${new Date().toISOString()} - ${msg}\n`);
            } catch (e) { console.error(e); }
        };

        logDebug(`Fetching leaderboard for scope: ${scope}, value: ${scopeValue}`);

        const fetchLimit = limit * 3;
        let query = db.collection('users').orderBy('ecoScore', 'desc');

        if (scope === 'state' && scopeValue) {
            logDebug(`Applying State Filter: ${scopeValue}`);
            query = query.where('state', '==', scopeValue);
        } else if (scope === 'district' && scopeValue) {
            logDebug(`Applying District Filter: ${scopeValue}`);
            query = query.where('district', '==', scopeValue);
        } else if (scope === 'subDistrict' && scopeValue) {
            logDebug(`Applying SubDistrict Filter: ${scopeValue}`);
            query = query.where('subDistrict', '==', scopeValue);
        } else if (scope === 'village' && scopeValue) {
            logDebug(`Applying Village Filter: ${scopeValue}`);
            query = query.where('village', '==', scopeValue);
        } else if (scope === 'crop' && scopeValue) {
            logDebug(`Applying Crop Filter: ${scopeValue} (No OrderBy)`);
            // Use array-contains on the simplified 'supportedCrops' list
            // IMPORTANT: Remove orderBy to avoid needing a composite index
            query = db.collection('users').where('supportedCrops', 'array-contains', scopeValue);
        } else {
            logDebug('No specific filter applied, returning global');
        }

        const snapshot = await query.limit(fetchLimit).get();

        let leaderboard = [];
        let rank = 1;

        snapshot.forEach(doc => {
            const data = doc.data();

            // Filter out non-farmers (admins, superadmins, institutions)
            // Only include users with role 'farmer' or no role (default to farmer)
            const userRole = data.role || 'farmer';
            if (userRole !== 'farmer') {
                return; // Skip this user
            }

            leaderboard.push({
                userId: doc.id,
                name: data.name,
                score: data.ecoScore || 0,
                location: {
                    state: data.state,
                    district: data.district,
                    subDistrict: data.subDistrict,
                    village: data.village
                },
                avatar: data.name ? data.name[0].toUpperCase() : 'U',
                rank: 0, // Will assign after sorting
                badges: data.badges || [],
                crops: data.crops || []
            });
        });

        // Manual Sort by Score (Desc) since we removed database sorting for some queries
        leaderboard.sort((a, b) => b.score - a.score);

        // Assign Ranks and Limit
        leaderboard = leaderboard.slice(0, limit).map((item, index) => ({
            ...item,
            rank: index + 1
        }));

        return leaderboard;
    } catch (error) {
        console.error('Error fetching leaderboard:', error);
        // Log to file for debugging
        const fs = require('fs');
        const path = require('path');
        const logPath = path.join(__dirname, '../../logs/error.log');
        const logMessage = `${new Date().toISOString()} - Error fetching leaderboard for scope ${scope} ${scopeValue}: ${error.message}\n`;
        try {
            if (!fs.existsSync(path.dirname(logPath))) {
                fs.mkdirSync(path.dirname(logPath), { recursive: true });
            }
            fs.appendFileSync(logPath, logMessage);
        } catch (e) {
            console.error('Failed to write to log file', e);
        }
        return [];
    }
};

module.exports = {
    awardPoints,
    updateEcoScore,
    updateStreak,
    evaluateBadges,
    getLeaderboard,
    POINTS_CONFIG,
    BADGE_DEFINITIONS
};
