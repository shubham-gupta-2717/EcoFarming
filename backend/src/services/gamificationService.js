// EcoScore Calculation Logic
const calculateEcoScore = (missions, streaks, badges) => {
    const missionPoints = missions * 10;
    const streakBonus = streaks * 5;
    const badgeBonus = badges * 20;

    return Math.min(1000, missionPoints + streakBonus + badgeBonus);
};

// Badge Assignment Logic
const checkAndAwardBadges = (userStats) => {
    const badges = [];

    if (userStats.missionsCompleted >= 10) {
        badges.push({ id: 'eco-warrior', name: 'Eco Warrior', icon: '🏆' });
    }

    if (userStats.waterSaved >= 1000) {
        badges.push({ id: 'water-saver', name: 'Water Saver', icon: '💧' });
    }

    if (userStats.organicMissionsCompleted >= 5) {
        badges.push({ id: 'soil-protector', name: 'Soil Protector', icon: '🌱' });
    }

    if (userStats.streak >= 7) {
        badges.push({ id: 'week-warrior', name: 'Week Warrior', icon: '🔥' });
    }

    if (userStats.streak >= 30) {
        badges.push({ id: 'month-master', name: 'Month Master', icon: '⭐' });
    }

    return badges;
};

// Streak Tracking Logic
const updateStreak = (lastActivityDate) => {
    const today = new Date();
    const lastActivity = new Date(lastActivityDate);

    const diffTime = Math.abs(today - lastActivity);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
        // Continue streak
        return { continue: true, reset: false };
    } else if (diffDays > 1) {
        // Reset streak
        return { continue: false, reset: true };
    } else {
        // Same day
        return { continue: true, reset: false };
    }
};

// Level Calculation
const calculateLevel = (ecoScore) => {
    if (ecoScore < 100) return { level: 1, title: 'Beginner Farmer' };
    if (ecoScore < 300) return { level: 2, title: 'Growing Farmer' };
    if (ecoScore < 500) return { level: 3, title: 'Skilled Farmer' };
    if (ecoScore < 700) return { level: 4, title: 'Expert Farmer' };
    if (ecoScore < 900) return { level: 5, title: 'Eco Champion' };
    return { level: 6, title: 'Eco Master' };
};

module.exports = {
    calculateEcoScore,
    checkAndAwardBadges,
    updateStreak,
    calculateLevel
};
