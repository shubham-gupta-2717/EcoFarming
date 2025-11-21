const getLeaderboard = async (req, res) => {
    // Default to global if no specific type requested, or redirect
    return getGlobalLeaderboard(req, res);
};

const getVillageLeaderboard = async (req, res) => {
    try {
        const leaderboard = [
            { id: 1, name: 'Ramesh Kumar', location: 'Village A', ecoScore: 950, badges: 15 },
            { id: 2, name: 'Suresh Patel', location: 'Village A', ecoScore: 920, badges: 12 },
            { id: 3, name: 'Deepak Singh', location: 'Village A', ecoScore: 880, badges: 9 },
        ];
        res.json({ leaderboard });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getPanchayatLeaderboard = async (req, res) => {
    try {
        const leaderboard = [
            { id: 1, name: 'Ramesh Kumar', location: 'Rampur Panchayat', ecoScore: 950, badges: 15 },
            { id: 2, name: 'Anita Devi', location: 'Rampur Panchayat', ecoScore: 890, badges: 10 },
            { id: 3, name: 'Vikram Singh', location: 'Rampur Panchayat', ecoScore: 860, badges: 8 },
        ];
        res.json({ leaderboard });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getGlobalLeaderboard = async (req, res) => {
    try {
        const leaderboard = [
            { id: 1, name: 'Ramesh Kumar', location: 'India', ecoScore: 950, badges: 15 },
            { id: 2, name: 'John Doe', location: 'USA', ecoScore: 945, badges: 14 },
            { id: 3, name: 'Suresh Patel', location: 'India', ecoScore: 920, badges: 12 },
            { id: 4, name: 'Maria Garcia', location: 'Spain', ecoScore: 910, badges: 11 },
            { id: 5, name: 'Anita Devi', location: 'India', ecoScore: 890, badges: 10 },
        ];
        res.json({ leaderboard });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getBadges = async (req, res) => {
    try {
        // Mock Badges
        const badges = [
            { id: 1, name: 'Eco Warrior', description: 'Completed 10 missions', icon: '🏆', earned: true },
            { id: 2, name: 'Water Saver', description: 'Saved 1000L water', icon: '💧', earned: true },
            { id: 3, name: 'Soil Protector', description: 'Used organic manure', icon: '🌱', earned: false },
            { id: 4, name: 'Week Warrior', description: '7 day streak', icon: '🔥', earned: true },
        ];
        res.json({ badges });
    } catch (error) {
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
