const getLeaderboard = async (req, res) => {
    // Default to global if no specific type requested, or redirect
    return getGlobalLeaderboard(req, res);
};

const getVillageLeaderboard = async (req, res) => {
    // For now, return global leaderboard as per requirement
    return getGlobalLeaderboard(req, res);
};

const getPanchayatLeaderboard = async (req, res) => {
    // For now, return global leaderboard as per requirement
    return getGlobalLeaderboard(req, res);
};

const getGlobalLeaderboard = async (req, res) => {
    try {
        const { db } = require('../config/firebase');
        const usersRef = db.collection('users');

        // Fetch ALL users ordered by ecoScore
        const snapshot = await usersRef
            .orderBy('ecoScore', 'desc')
            .get();

        const leaderboard = [];
        let rank = 1;

        snapshot.forEach(doc => {
            const userData = doc.data();
            leaderboard.push({
                id: doc.id,
                name: userData.name || 'Anonymous Farmer',
                location: userData.location || 'India',
                ecoScore: userData.ecoScore || 0,
                badges: userData.badges ? userData.badges.length : 0,
                rank: rank++
            });
        });

        res.json({ leaderboard });
    } catch (error) {
        console.error('Error fetching leaderboard:', error);
        res.status(500).json({ message: error.message });
    }
};

const getBadges = async (req, res) => {
    try {
        const userId = req.user.uid;
        const { db } = require('../config/firebase');

        // Fetch user to see earned badges
        const userDoc = await db.collection('users').doc(userId).get();
        const userData = userDoc.exists ? userDoc.data() : {};
        const earnedBadges = userData.badges || []; // Array of badge IDs or names

        // Mock Badges Definition
        const allBadges = [
            { id: 1, name: 'Eco Warrior', description: 'Completed 10 missions', icon: '🏆' },
            { id: 2, name: 'Water Saver', description: 'Saved 1000L water', icon: '💧' },
            { id: 3, name: 'Soil Protector', description: 'Used organic manure', icon: '🌱' },
            { id: 4, name: 'Week Warrior', description: '7 day streak', icon: '🔥' },
        ];

        // Map to add 'earned' status
        const badges = allBadges.map(badge => ({
            ...badge,
            earned: earnedBadges.includes(badge.id) || earnedBadges.includes(badge.name)
        }));

        res.json({ badges });
    } catch (error) {
        console.error('Error fetching badges:', error);
        res.status(500).json({ message: error.message });
    }
};

const getUserStats = async (req, res) => {
    try {
        const userId = req.user.uid;

        // Fetch user data from Firestore
        const { db } = require('../config/firebase');
        const userDoc = await db.collection('users').doc(userId).get();

        if (!userDoc.exists) {
            // Return default stats for new users
            return res.json({
                stats: {
                    ecoScore: 0,
                    badges: 0,
                    streak: 0,
                    currentStreak: 0,
                    missionsCompleted: 0,
                    credits: 0,
                    level: 1,
                    levelTitle: 'Beginner Farmer'
                }
            });
        }

        const userData = userDoc.data();

        // Calculate level based on ecoScore
        const ecoScore = userData.ecoScore || 0;
        let level = 1;
        let levelTitle = 'Beginner Farmer';

        if (ecoScore >= 1000) {
            level = 5;
            levelTitle = 'Eco Master';
        } else if (ecoScore >= 700) {
            level = 4;
            levelTitle = 'Advanced Farmer';
        } else if (ecoScore >= 400) {
            level = 3;
            levelTitle = 'Expert Farmer';
        } else if (ecoScore >= 150) {
            level = 2;
            levelTitle = 'Intermediate Farmer';
        }

        const stats = {
            ecoScore: ecoScore,
            badges: userData.badges || 0,
            streak: userData.currentStreak || 0,
            currentStreak: userData.currentStreak || 0,
            longestStreak: userData.longestStreak || 0,
            missionsCompleted: userData.completedMissions || 0,
            credits: userData.credits || 0,
            level: level,
            levelTitle: levelTitle
        };

        res.json({ stats });
    } catch (error) {
        console.error('Error fetching user stats:', error);
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getLeaderboard, getBadges, getUserStats, getVillageLeaderboard, getPanchayatLeaderboard, getGlobalLeaderboard };
