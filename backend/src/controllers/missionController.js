const { generateMissionFromAI, generateMissionForCrop } = require('../services/missionService');
const { db, admin } = require('../config/firebase');
const { getWeatherData, getWeatherSummary, getWeatherBasedMissionType, getCoordinatesFromIP } = require('../services/weatherService');

const generateMission = async (req, res) => {
    try {
        const farmerData = req.body;
        const mission = await generateMissionFromAI(farmerData);

        if (db) {
            // await db.collection('missions').add({ ...mission, userId: req.user.uid, createdAt: new Date() });
        }

        res.status(200).json({ success: true, mission });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const getDailyMission = async (req, res) => {
    return generateMission(req, res);
};

const getWeeklyMission = async (req, res) => {
    try {
        const farmerData = { ...req.body, missionType: 'weekly' };
        const mission = await generateMissionFromAI(farmerData);

        // Weekly missions have higher credits and difficulty
        mission.credits = mission.credits * 2;
        mission.difficulty = mission.difficulty === 'Easy' ? 'Medium' : 'Hard';
        mission.seasonalTag = 'Weekly Challenge';

        res.status(200).json({ success: true, mission });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const getSeasonalMission = async (req, res) => {
    try {
        const farmerData = { ...req.body, missionType: 'seasonal' };
        const mission = await generateMissionFromAI(farmerData);

        // Seasonal missions have highest credits
        mission.credits = mission.credits * 3;
        mission.difficulty = 'Hard';
        mission.ecoScoreImpact = mission.ecoScoreImpact * 2;

        res.status(200).json({ success: true, mission });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const submitMission = async (req, res) => {
    try {
        const { missionId, proofImage, proofVideo, notes } = req.body;

        // In real app, save to Firestore
        const submission = {
            missionId,
            userId: req.user?.uid || 'demo-user',
            proofImage,
            proofVideo,
            notes,
            status: 'pending',
            submittedAt: new Date()
        };

        res.status(200).json({
            success: true,
            message: 'Mission submitted for verification',
            submission
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};



/**
 * Generate mission for specific crop
 */
const generateForCrop = async (req, res) => {
    try {
        const { selectedCrop } = req.body;
        const farmerId = req.user.uid;

        if (!selectedCrop) {
            return res.status(400).json({ message: 'Selected crop is required' });
        }

        // 1. Fetch farmer data from Firestore
        const userDoc = await db.collection('users').doc(farmerId).get();

        let userData;
        let crops = [];

        if (!userDoc.exists) {
            // User doesn't exist in Firestore - create with demo crops
            console.log('User not found in Firestore, creating with demo crops');

            const demoCrops = [
                { cropName: 'Tomato', stage: 'Flowering', landSize: 0.6 },
                { cropName: 'Brinjal', stage: 'Vegetative', landSize: 0.4 },
                { cropName: 'Sugarcane', stage: 'Early Growth', landSize: 1.2 }
            ];

            userData = {
                uid: farmerId,
                email: req.user.email || 'demo@farmer.com',
                name: req.user.name || 'Demo Farmer',
                role: 'farmer',
                crops: demoCrops,
                location: 'India',
                preferredLanguage: 'en',
                credits: 0,
                ecoScore: 0,
                createdAt: admin.firestore.FieldValue.serverTimestamp()
            };

            // Save user document
            await db.collection('users').doc(farmerId).set(userData);
            crops = demoCrops;
        } else {
            userData = userDoc.data();
            crops = userData.crops || [];

            // If user exists but has no crops, add demo crops
            if (crops.length === 0) {
                const demoCrops = [
                    { cropName: 'Tomato', stage: 'Flowering', landSize: 0.6 },
                    { cropName: 'Brinjal', stage: 'Vegetative', landSize: 0.4 },
                    { cropName: 'Sugarcane', stage: 'Early Growth', landSize: 1.2 }
                ];
                crops = demoCrops;
                await db.collection('users').doc(farmerId).update({ crops: demoCrops });
            }
        }

        // 2. Find selected crop in farmer's crop list
        const selectedCropData = crops.find(c => c.cropName === selectedCrop);

        if (!selectedCropData) {
            return res.status(404).json({
                message: 'Crop not found in your profile',
                availableCrops: crops.map(c => c.cropName)
            });
        }

        // 3. Handle location automatically: GPS → IP → Profile
        let locationForWeather;

        if (req.body.lat && req.body.lon) {
            // Browser geolocation provided
            locationForWeather = {
                lat: req.body.lat,
                lon: req.body.lon,
                name: 'GPS Location'
            };
            console.log('Using GPS coordinates:', locationForWeather);
        } else if (req.body.useIpFallback) {
            // IP-based geolocation fallback
            locationForWeather = await getCoordinatesFromIP();
            console.log('Using IP-based location:', locationForWeather);
        } else {
            // Fall back to user profile location (geocode it)
            locationForWeather = userData.location || 'India';
            console.log('Using profile location:', locationForWeather);
        }

        // Fetch weather data for the determined location
        const weatherData = await getWeatherData(locationForWeather);
        const weatherSummary = getWeatherSummary(weatherData);
        const weatherTrigger = getWeatherBasedMissionType(weatherData);

        // 4. Build context for AI (with weather)
        const context = {
            cropName: selectedCropData.cropName,
            cropStage: selectedCropData.stage || 'Growing',
            landSize: selectedCropData.landSize || 1,
            location: weatherData.location, // Use actual detected location name
            coordinates: weatherData.coordinates, // Store coordinates
            season: getCurrentSeason(),
            language: userData.preferredLanguage || 'en',
            weather: weatherSummary,
            weatherTrigger: weatherTrigger
        };

        // --- NEW: Fetch Context for AI (Badges & History) ---

        // A. Get Badges Context
        const { BADGE_DEFINITIONS } = require('../services/gamificationService');
        const earnedBadgeIds = userData.badges || [];
        const availableBadges = BADGE_DEFINITIONS.map(b => ({
            ...b,
            earned: earnedBadgeIds.includes(b.id)
        }));

        // B. Get Last Mission History
        const lastMissionSnapshot = await db.collection('user_missions')
            .where('userId', '==', farmerId)
            .where('crop', '==', selectedCropData.cropName)
            .orderBy('createdAt', 'desc')
            .limit(1)
            .get();

        let lastMission = null;
        if (!lastMissionSnapshot.empty) {
            lastMission = lastMissionSnapshot.docs[0].data();
        }

        // 5. Generate crop-specific mission using AI (with extended context)
        const mission = await generateMissionForCrop(context, availableBadges, lastMission);

        // 6. Save mission to Firestore with weather snapshot
        const missionRef = db.collection('user_missions').doc();
        const missionData = {
            userId: farmerId,
            title: mission.task,
            description: mission.benefits,
            steps: mission.steps,
            crop: selectedCropData.cropName,
            category: mission.behaviorCategory || 'general',
            difficulty: mission.difficulty || 'medium',
            points: mission.credits || 20,
            status: 'active',
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            requiresProof: true,
            weatherSnapshot: {
                temp: weatherData.current.temp,
                humidity: weatherData.current.humidity,
                weather: weatherData.current.weather,
                rainProbability: weatherData.current.rainProbability,
                location: weatherData.location
            },
            weatherAlerts: weatherData.alerts,
            microLearning: mission.microLearning,
            verification: mission.verification
        };

        await missionRef.set(missionData);

        res.status(200).json({
            success: true,
            mission: {
                ...mission,
                missionId: missionRef.id,
                cropTarget: selectedCropData.cropName,
                cropStage: selectedCropData.cropStage,
                weatherSnapshot: {
                    temp: weatherData.current.temp,
                    humidity: weatherData.current.humidity,
                    weather: weatherData.current.weather,
                    rainProbability: weatherData.current.rainProbability,
                    location: weatherData.location
                },
                weatherAlerts: weatherData.alerts
            }
        });
    } catch (error) {
        console.error('Error generating crop-specific mission:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * Helper: Get current season based on month
 */
function getCurrentSeason() {
    const month = new Date().getMonth() + 1; // 1-12

    if (month >= 3 && month <= 6) return 'Summer';
    if (month >= 7 && month <= 10) return 'Monsoon';
    return 'Winter';
}

const deleteMission = async (req, res) => {
    try {
        const { missionId } = req.params;
        const userId = req.user.uid;

        const missionRef = db.collection('user_missions').doc(missionId);
        const doc = await missionRef.get();

        if (!doc.exists) {
            return res.status(404).json({ message: 'Mission not found' });
        }

        if (doc.data().userId !== userId) {
            return res.status(403).json({ message: 'Unauthorized' });
        }

        await missionRef.delete();

        res.json({ message: 'Mission deleted successfully' });
    } catch (error) {
        console.error('Error deleting mission:', error);
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    generateMission,
    getDailyMission,
    getWeeklyMission,
    getSeasonalMission,
    submitMission,
    generateForCrop,  // NEW
    deleteMission
};
