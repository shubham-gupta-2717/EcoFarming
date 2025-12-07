const { db, admin } = require('../config/firebase');
const gamificationService = require('../services/gamificationService');
const missionService = require('../services/missionService');

// --- Dashboard ---

const getDashboard = async (req, res) => {
    try {
        const userId = req.user.uid;

        // 1. Update Streak (Daily Check)
        await gamificationService.updateStreak(userId);

        // 2. Fetch User Data
        const userDoc = await db.collection('users').doc(userId).get();
        const userData = userDoc.data();

        // 3. Fetch All Missions (including submitted, verified, completed, rejected)
        const missionsSnapshot = await db.collection('user_missions')
            .where('userId', '==', userId)
            .get();

        const missions = [];
        missionsSnapshot.forEach(doc => {
            missions.push({ id: doc.id, ...doc.data() });
        });

        // 4. Get Badges Details
        const earnedBadgeIds = userData.badges || [];
        const badges = gamificationService.BADGE_DEFINITIONS.map(b => ({
            ...b,
            earned: earnedBadgeIds.includes(b.id)
        }));

        res.json({
            stats: {
                score: userData.ecoScore || 0,
                streak: userData.currentStreakDays || 0,
                longestStreak: userData.longestStreakDays || 0,
                credits: userData.credits || 0
            },
            missions,
            badges
        });

    } catch (error) {
        console.error('Error fetching dashboard:', error);
        res.status(500).json({ message: error.message });
    }
};

// --- Missions ---

const assignMission = async (req, res) => {
    try {
        const userId = req.user.uid;
        const { crop, category, difficulty, location } = req.body;

        // Use AI Service to generate mission content
        // Note: We reuse the existing mission generation logic but wrap it in the new structure
        const context = {
            cropName: crop || 'General',
            cropStage: 'Growing', // Default
            landSize: '2 acres',
            season: 'Rabi',
            location: location || 'India',
            weather: 'Clear sky, 25°C' // Mock for now, ideally fetch real weather
        };

        const missionContent = await missionService.generateMissionForCrop(context);

        const newMission = {
            userId,
            title: missionContent.task,
            description: missionContent.steps.join('\n'),
            steps: missionContent.steps,
            crop: context.cropName,
            category: category || 'general',
            difficulty: difficulty || 'medium',
            points: missionContent.credits || 30,
            status: 'pending',
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            requiresProof: true
        };

        const docRef = await db.collection('user_missions').add(newMission);

        res.status(201).json({
            message: 'Mission assigned successfully',
            mission: { id: docRef.id, ...newMission }
        });

    } catch (error) {
        console.error('Error assigning mission:', error);
        res.status(500).json({ message: error.message });
    }
};

const startMission = async (req, res) => {
    try {
        const { missionId } = req.body;
        const userId = req.user.uid;

        const missionRef = db.collection('user_missions').doc(missionId);
        const doc = await missionRef.get();

        if (!doc.exists) return res.status(404).json({ message: 'Mission not found' });
        if (doc.data().userId !== userId) return res.status(403).json({ message: 'Unauthorized' });

        await missionRef.update({
            status: 'active',
            startDate: admin.firestore.FieldValue.serverTimestamp()
        });

        res.json({ message: 'Mission started' });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const checkInMission = async (req, res) => {
    try {
        const { missionId, note, proofUrl } = req.body;
        const userId = req.user.uid;

        const missionRef = db.collection('user_missions').doc(missionId);

        // Log activity
        await gamificationService.awardPoints(
            userId,
            gamificationService.POINTS_CONFIG.DAILY_CHECKIN,
            'checkin',
            `Mission Check-in: ${note || 'No note'}`,
            missionId
        );

        // Update mission
        await missionRef.update({
            lastCheckIn: admin.firestore.FieldValue.serverTimestamp(),
            checkInCount: admin.firestore.FieldValue.increment(1)
        });

        res.json({ message: 'Check-in successful', points: gamificationService.POINTS_CONFIG.DAILY_CHECKIN });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const completeMission = async (req, res) => {
    try {
        const { missionId } = req.body;
        const userId = req.user.uid;

        const missionRef = db.collection('user_missions').doc(missionId);
        const doc = await missionRef.get();

        if (!doc.exists) return res.status(404).json({ message: 'Mission not found' });
        const missionData = doc.data();

        if (missionData.status === 'completed') {
            return res.status(400).json({ message: 'Mission already completed' });
        }

        // Mark completed
        await missionRef.update({
            status: 'completed',
            completedAt: admin.firestore.FieldValue.serverTimestamp()
        });

        // Award Points
        const points = missionData.points || 30;
        await gamificationService.awardPoints(userId, points, 'mission_complete', `Completed: ${missionData.title}`, missionId);

        res.json({ message: 'Mission completed!', pointsAwarded: points });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// --- Stats & Leaderboard ---

const getStats = async (req, res) => {
    try {
        const userId = req.user.uid;
        const userDoc = await db.collection('users').doc(userId).get();
        res.json(userDoc.data());
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getBadges = async (req, res) => {
    try {
        const userId = req.user.uid;
        const userDoc = await db.collection('users').doc(userId).get();
        const userData = userDoc.data();
        const earnedIds = userData.badges || [];

        // Fetch stats needed for progress calculation
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

        // Fetch post count (mock/simplified for now as in evaluateBadges)
        const postsSnapshot = await db.collection('communityPosts')
            .where('authorId', '==', userId)
            .get();
        const postCount = postsSnapshot.size;

        const badges = gamificationService.BADGE_DEFINITIONS.map(b => {
            const isEarned = earnedIds.includes(b.id);
            let progress = 0;
            let total = 0;
            const c = b.criteria;

            // Calculate Progress
            switch (c.type) {
                case 'mission_count':
                    if (c.category === 'any') {
                        progress = totalMissions;
                    } else if (c.category) {
                        progress = missionCounts[c.category] || 0;
                    }
                    total = c.threshold;
                    break;
                case 'streak':
                    progress = userData.currentStreakDays || 0;
                    total = c.threshold;
                    break;
                case 'community_posts':
                case 'community_replies':
                    progress = postCount;
                    total = c.threshold;
                    break;
                case 'learning_modules':
                    progress = userData.learningModulesCompleted || 0;
                    total = c.threshold;
                    break;
                case 'level':
                    progress = Math.floor((userData.ecoScore || 0) / 100) + 1;
                    total = c.threshold;
                    break;
                case 'eco_score_gain':
                    progress = userData.ecoScore || 0;
                    total = c.threshold;
                    break;
                case 'quiz_score':
                    progress = userData.highScoreQuizzes || 0;
                    total = c.threshold;
                    break;
                case 'legend_status':
                    // Complex criteria, just use score as proxy for progress visualization
                    progress = userData.ecoScore || 0;
                    total = 1000;
                    break;
                default:
                    progress = 0;
                    total = 1;
            }

            // Cap progress at total
            if (progress > total) progress = total;

            return {
                ...b,
                earned: isEarned,
                progress,
                total,
                percentage: total > 0 ? Math.round((progress / total) * 100) : 0
            };
        });

        res.json({ badges });
    } catch (error) {
        console.error('Error fetching badges:', error);
        res.status(500).json({ message: error.message });
    }
};

const getLeaderboard = async (req, res) => {
    try {
        const { scope, value } = req.query;
        const leaderboard = await gamificationService.getLeaderboard(scope, value);
        res.json({ leaderboard });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getHistory = async (req, res) => {
    try {
        const userId = req.user.uid;
        const snapshot = await db.collection('ecoscore_history')
            .where('userId', '==', userId)
            .orderBy('timestamp', 'desc')
            .get();

        const history = [];
        snapshot.forEach(doc => history.push({ id: doc.id, ...doc.data() }));

        res.json({ history });
    } catch (error) {
        console.error('Error fetching history:', error);
        res.status(500).json({ message: error.message });
    }
};

const getCreditHistory = async (req, res) => {
    try {
        const userId = req.user.uid;
        const snapshot = await db.collection('credit_history')
            .where('userId', '==', userId)
            .orderBy('timestamp', 'desc')
            .get();

        const history = [];
        snapshot.forEach(doc => history.push({ id: doc.id, ...doc.data() }));

        res.json({ history });
    } catch (error) {
        console.error('Error fetching credit history:', error);
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getDashboard,
    assignMission,
    startMission,
    checkInMission,
    completeMission,
    getStats,
    getBadges,
    getLeaderboard,
    getHistory,
    getCreditHistory
};
