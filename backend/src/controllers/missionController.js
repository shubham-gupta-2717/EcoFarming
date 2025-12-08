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
    try {
        const userId = req.user.uid;
        const startOfToday = new Date();
        startOfToday.setHours(0, 0, 0, 0);

        // Check for existing mission created today
        const snapshot = await db.collection('user_missions')
            .where('userId', '==', userId)
            .where('createdAt', '>=', startOfToday)
            .orderBy('createdAt', 'desc')
            .limit(1)
            .get();

        if (!snapshot.empty) {
            const missionDoc = snapshot.docs[0];
            return res.status(200).json({
                success: true,
                mission: { id: missionDoc.id, ...missionDoc.data() },
                fromCache: true
            });
        }

        // If no mission exists for today, generate a new one
        return generateMission(req, res);
    } catch (error) {
        console.error('Error fetching daily mission:', error);
        return res.status(500).json({ success: false, message: error.message });
    }
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
            // Pass sowingDate if available, otherwise fallback to stage or 'Growing'
            sowingDate: selectedCropData.sowingDate,
            notes: selectedCropData.notes,
            cropStage: selectedCropData.stage || 'Detected by AI', // AI will override this based on dates
            landSize: selectedCropData.landSize || selectedCropData.area || 1,
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

        // B. Get Last Mission History (fetch all and sort in JavaScript to avoid index)
        const lastMissionSnapshot = await db.collection('user_missions')
            .where('userId', '==', farmerId)
            .where('crop', '==', selectedCropData.cropName)
            .get();

        let lastMission = null;
        if (!lastMissionSnapshot.empty) {
            // Sort by createdAt in JavaScript
            const missions = lastMissionSnapshot.docs
                .map(doc => ({ id: doc.id, ...doc.data() }))
                .sort((a, b) => {
                    if (!a.createdAt || !b.createdAt) return 0;
                    return b.createdAt.toMillis() - a.createdAt.toMillis();
                });
            lastMission = missions[0];
        }

        // 5. [NEW] PIPELINE LOGIC: Fetch Mission from Pipeline Data instead of AI
        const { getPipelineForCrop } = require('../data/cropPipelines');
        const pipeline = getPipelineForCrop(selectedCropData.cropName);

        let missionDataPayload;
        let cropStageName = selectedCropData.stage || 'Detected by AI';

        if (pipeline) {
            // Get current stage from user profile (default to 1 if missing)
            const currentStageId = selectedCropData.currentStage || 1;

            // Find the mission object for this stage
            const pipelineMission = pipeline.find(s => s.id === currentStageId);

            if (pipelineMission) {
                console.log(`Using Pipeline Mission for ${selectedCropData.cropName} Stage ${currentStageId}`);

                // Construct mission payload from hardcoded data
                missionDataPayload = {
                    task: pipelineMission.title,
                    benefits: pipelineMission.description,
                    steps: [pipelineMission.task], // Single step task for simplicity in strict pipeline
                    behaviorCategory: pipelineMission.category,
                    difficulty: pipelineMission.difficulty,
                    credits: pipelineMission.points,
                    why: 'This is the mandatory next step in your crop lifecycle.',
                    languageAudioUrl: '', // TTS will generate this on frontend
                    microLearning: [pipelineMission.description],
                    verification: pipelineMission.verification,
                    cropStage: `Stage ${pipelineMission.id}: ${pipelineMission.title}`
                };
                cropStageName = pipelineMission.title;
            } else {
                // Fallback if stage out of bounds (e.g. completed)
                missionDataPayload = {
                    task: 'Crop Lifecycle Completed',
                    benefits: 'You have completed all stages for this crop.',
                    steps: ['Review your harvest records'],
                    behaviorCategory: 'harvest',
                    difficulty: 'Easy',
                    credits: 0,
                    verification: 'None',
                    cropStage: 'Completed'
                };
            }
        } else {
            // Fallback to old AI system if crop not in pipeline (backward compatibility)
            console.log("Pipeline not found, falling back to AI for:", selectedCropData.cropName);
            const mission = await generateMissionForCrop(context, availableBadges, lastMission);
            missionDataPayload = mission;
        }

        // 6. Save mission to Firestore
        const missionRef = db.collection('user_missions').doc();
        const missionData = {
            userId: farmerId,
            title: missionDataPayload.task,
            description: missionDataPayload.benefits,
            steps: missionDataPayload.steps,
            crop: selectedCropData.cropName,
            category: missionDataPayload.behaviorCategory || 'general',
            difficulty: missionDataPayload.difficulty || 'medium',
            points: missionDataPayload.credits || 20,
            status: 'active',
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            requiresProof: true,
            why: missionDataPayload.why || '',
            languageAudioUrl: missionDataPayload.languageAudioUrl || '',
            weatherSnapshot: {
                temp: weatherData.current.temp,
                humidity: weatherData.current.humidity,
                weather: weatherData.current.weather,
                rainProbability: weatherData.current.rainProbability,
                location: weatherData.location
            },
            weatherAlerts: weatherData.alerts,
            microLearning: missionDataPayload.microLearning,
            verification: missionDataPayload.verification,
            cropStage: missionDataPayload.cropStage || 'General',
            pipelineStageId: selectedCropData.currentStage || 1 // Track ID for ordering
        };

        await missionRef.set(missionData);

        // 7. Update User's Crop with the AI-detected stage (Improvement)
        if (missionDataPayload.cropStage) {
            try {
                // We need to fetch fresh crops to ensure we don't overwrite concurrent changes (though rare for single user)
                const freshUserDoc = await db.collection('users').doc(farmerId).get();
                if (freshUserDoc.exists) {
                    let freshCrops = freshUserDoc.data().crops || [];
                    const cropIndex = freshCrops.findIndex(c => c.cropName === selectedCrop);

                    if (cropIndex !== -1) {
                        freshCrops[cropIndex] = {
                            ...freshCrops[cropIndex],
                            stage: missionDataPayload.cropStage,
                            lastMissionDate: new Date().toISOString()
                        };
                        await db.collection('users').doc(farmerId).update({ crops: freshCrops });
                        console.log(`Updated crop '${selectedCrop}' stage to '${missionDataPayload.cropStage}'`);
                    }
                }
            } catch (updateErr) {
                console.error("Failed to update crop stage in profile:", updateErr);
                // Non-blocking error
            }
        }

        res.status(200).json({
            success: true,
            mission: {
                ...missionDataPayload,
                title: missionDataPayload.task, // Ensure title is present for frontend
                missionId: missionRef.id,
                cropTarget: selectedCropData.cropName,
                cropStage: missionDataPayload.cropStage, // Use the detailed string "Stage X: Title"
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

/**
 * Submit mission with photo proof
 */
const submitMissionProof = async (req, res) => {
    try {
        const { id: missionId } = req.params;
        const { notes } = req.body;
        const userId = req.user.uid;
        const file = req.file;

        if (!file) {
            return res.status(400).json({ message: 'Image is required' });
        }

        // Get mission
        const missionRef = db.collection('user_missions').doc(missionId);
        const missionDoc = await missionRef.get();

        if (!missionDoc.exists) {
            return res.status(404).json({ message: 'Mission not found' });
        }

        const mission = missionDoc.data();

        // Verify ownership
        if (mission.userId !== userId) {
            return res.status(403).json({ message: 'Unauthorized' });
        }

        // Check if already submitted
        const currentStatus = mission.status?.toLowerCase();
        if (currentStatus !== 'assigned' && currentStatus !== 'active' && currentStatus !== 'rejected') {
            return res.status(400).json({ message: 'Mission already submitted or completed' });
        }

        // Upload image to Cloudinary
        const cloudinary = require('cloudinary').v2;
        const streamifier = require('streamifier');

        const result = await new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                {
                    folder: 'mission_proofs',
                    resource_type: 'image',
                },
                (error, result) => {
                    if (error) reject(error);
                    else resolve(result);
                }
            );
            streamifier.createReadStream(file.buffer).pipe(uploadStream);
        });

        const imageUrl = result.secure_url;

        // Update mission with submission
        await missionRef.update({
            imageUrl,
            notes: notes || '',
            status: 'SUBMITTED',
            submittedAt: admin.firestore.FieldValue.serverTimestamp()
        });

        // Trigger AI verification asynchronously
        const { processMissionVerification } = require('../services/missionVerificationService');
        processMissionVerification(missionId).catch(error => {
            console.error('Verification failed:', error);
        });

        res.json({
            success: true,
            message: 'Mission submitted successfully. AI verification in progress.',
            mission: {
                id: missionId,
                status: 'SUBMITTED',
                imageUrl
            }
        });

    } catch (error) {
        console.error('Error submitting mission:', error);
        res.status(500).json({ message: error.message });
    }
};

/**
 * Get pending missions for admin review
 */
const getPendingMissions = async (req, res) => {
    try {
        const snapshot = await db.collection('user_missions')
            .where('status', 'in', ['SUBMITTED', 'VERIFIED', 'REJECTED'])
            .get();

        const missions = [];
        for (const doc of snapshot.docs) {
            const data = doc.data();

            // Get farmer info
            const userDoc = await db.collection('users').doc(data.userId).get();
            const userData = userDoc.exists ? userDoc.data() : {};

            missions.push({
                id: doc.id,
                ...data,
                farmerName: userData.name || 'Unknown',
                farmerEmail: userData.email || ''
            });
        }

        // Sort by submission time (newest first)
        missions.sort((a, b) => {
            if (!a.submittedAt || !b.submittedAt) return 0;
            return b.submittedAt.toMillis() - a.submittedAt.toMillis();
        });

        res.json({ success: true, missions });

    } catch (error) {
        console.error('Error fetching pending missions:', error);
        res.status(500).json({ message: error.message });
    }
};

/**
 * Manually approve mission (admin override)
 */
const approveManually = async (req, res) => {
    try {
        const { id: missionId } = req.params;
        const { reason } = req.body;

        const missionRef = db.collection('user_missions').doc(missionId);
        const missionDoc = await missionRef.get();

        if (!missionDoc.exists) {
            return res.status(404).json({ message: 'Mission not found' });
        }

        const mission = missionDoc.data();

        // Update mission status
        await missionRef.update({
            status: 'VERIFIED',
            aiVerified: true,
            verificationReason: reason || 'Manually approved by admin',
            verifiedAt: admin.firestore.FieldValue.serverTimestamp(),
            manualOverride: true
        });

        // Award points
        const { awardPoints } = require('../services/missionVerificationService');
        await awardPoints(mission.userId, missionId, mission.points);

        // [NEW] UNLOCK NEXT STAGE
        // If this mission belongs to a crop pipeline, increment the user's currentStage for that crop
        if (mission.crop && mission.userId) {
            const userRef = db.collection('users').doc(mission.userId);
            const userDoc = await userRef.get();
            if (userDoc.exists) {
                let crops = userDoc.data().crops || [];
                const cropIndex = crops.findIndex(c => c.cropName === mission.crop);

                if (cropIndex !== -1) {
                    const currentStage = crops[cropIndex].currentStage || 1;
                    // Only increment if not already ahead (prevents double increment on duplicate approval)
                    // And only if mission provides a pipelineStageId that matches current
                    if (!mission.pipelineStageId || mission.pipelineStageId === currentStage) {
                        crops[cropIndex] = {
                            ...crops[cropIndex],
                            currentStage: currentStage + 1,
                            lastMissionDate: new Date().toISOString()
                        };
                        await userRef.update({ crops });
                        console.log(`Unlocked Stage ${currentStage + 1} for user ${mission.userId} crop ${mission.crop}`);
                    }
                }
            }
        }

        res.json({
            success: true,
            message: 'Mission approved and points awarded'
        });

    } catch (error) {
        console.error('Error approving mission:', error);
        res.status(500).json({ message: error.message });
    }
};

/**
 * Manually reject mission (admin override)
 */
const rejectManually = async (req, res) => {
    try {
        const { id: missionId } = req.params;
        const { reason } = req.body;

        if (!reason) {
            return res.status(400).json({ message: 'Rejection reason is required' });
        }

        const missionRef = db.collection('user_missions').doc(missionId);
        const missionDoc = await missionRef.get();

        if (!missionDoc.exists) {
            return res.status(404).json({ message: 'Mission not found' });
        }

        const mission = missionDoc.data();

        // Delete old image from Cloudinary to allow re-submission
        if (mission.imageUrl) {
            try {
                const cloudinary = require('cloudinary').v2;
                // Extract public_id from Cloudinary URL
                const urlParts = mission.imageUrl.split('/');
                const publicIdWithExt = urlParts.slice(-2).join('/'); // folder/filename.ext
                const publicId = publicIdWithExt.replace(/\.[^/.]+$/, ''); // Remove extension

                await cloudinary.uploader.destroy(publicId);
                console.log('🗑️ Deleted old image from Cloudinary:', publicId);
            } catch (error) {
                console.error('Warning: Failed to delete image from Cloudinary:', error);
                // Don't fail the rejection if image deletion fails
            }
        }

        // Update mission status (keep imageUrl for admin review)
        await missionRef.update({
            status: 'REJECTED',
            aiVerified: false,
            verificationReason: reason,
            verifiedAt: admin.firestore.FieldValue.serverTimestamp(),
            manualOverride: true
            // Note: Keep imageUrl and notes so admin can review them
        });

        res.json({
            success: true,
            message: 'Mission rejected. Farmer can re-submit with a new photo.'
        });

    } catch (error) {
        console.error('Error rejecting mission:', error);
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    generateMission,
    getDailyMission,
    getWeeklyMission,
    getSeasonalMission,
    submitMission,
    generateForCrop,
    deleteMission,
    submitMissionProof,      // NEW
    getPendingMissions,      // NEW
    approveManually,         // NEW
    rejectManually          // NEW
};
