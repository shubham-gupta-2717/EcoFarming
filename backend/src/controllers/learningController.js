const { db, admin } = require('../config/firebase');
const { generateLearningModule, getWeatherRecommendations } = require('../services/learningService');
const { getWeatherData } = require('../services/weatherService');

/**
 * Get all learning categories
 */
const getCategories = async (req, res) => {
    try {
        const categories = [
            {
                id: 'soil-health',
                name: 'Soil Health & Fertility',
                description: 'Learn soil management, composting, and fertility techniques',
                icon: '🌱',
                moduleCount: 0
            },
            {
                id: 'water-management',
                name: 'Water & Irrigation Management',
                description: 'Efficient water usage, drip irrigation, and conservation',
                icon: '💧',
                moduleCount: 0
            },
            {
                id: 'pest-control',
                name: 'Pest & Disease Management',
                description: 'Organic pest control and disease prevention strategies',
                icon: '🐛',
                moduleCount: 0
            },
            {
                id: 'organic-farming',
                name: 'Organic & Natural Farming',
                description: 'Chemical-free farming with natural fertilizers',
                icon: '🌿',
                moduleCount: 0
            },
            {
                id: 'crop-guides',
                name: 'Crop-Specific Guides',
                description: 'Detailed growing guides for specific crops',
                icon: '🌾',
                moduleCount: 0
            },
            {
                id: 'weather-tips',
                name: 'Weather-Based Tips',
                description: 'Adapt farming to weather conditions',
                icon: '🌤️',
                moduleCount: 0
            },
            {
                id: 'success-stories',
                name: 'Farmer Success Stories',
                description: 'Learn from successful farmers',
                icon: '⭐',
                moduleCount: 0
            }
        ];

        // Count modules per category
        const modulesSnapshot = await db.collection('learningModules').get();
        const moduleCategoryMap = {}; // Map moduleId -> categoryName

        modulesSnapshot.forEach(doc => {
            const module = doc.data();
            const category = categories.find(c => c.name === module.category);
            if (category) {
                category.moduleCount++;
                moduleCategoryMap[doc.id] = module.category;
            }
        });

        // Calculate completed count if user is logged in
        if (req.user) {
            const userId = req.user.uid;
            const progressSnapshot = await db.collection('learningProgress')
                .where('farmerId', '==', userId)
                .where('status', '==', 'completed')
                .get();

            progressSnapshot.forEach(doc => {
                const data = doc.data();
                const categoryName = moduleCategoryMap[data.moduleId];
                if (categoryName) {
                    const category = categories.find(c => c.name === categoryName);
                    if (category) {
                        category.completedCount = (category.completedCount || 0) + 1;
                    }
                }
            });
        }

        res.json({ success: true, categories });
    } catch (error) {
        console.error('Error fetching categories:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * Get modules by category
 */
const getModulesByCategory = async (req, res) => {
    try {
        const { category } = req.params;

        const modulesSnapshot = await db.collection('learningModules')
            .where('category', '==', category)
            .get();

        const modules = [];
        modulesSnapshot.forEach(doc => {
            modules.push({ moduleId: doc.id, ...doc.data() });
        });

        // If user is logged in, fetch their progress
        if (req.user) {
            const userId = req.user.uid;
            const progressSnapshot = await db.collection('learningProgress')
                .where('farmerId', '==', userId)
                .get();

            const progressMap = {};
            progressSnapshot.forEach(doc => {
                const data = doc.data();
                progressMap[data.moduleId] = data;
            });

            // Merge progress into modules
            modules.forEach(module => {
                if (progressMap[module.moduleId]) {
                    module.progress = progressMap[module.moduleId];
                }
            });
        }

        res.json({ success: true, modules });
    } catch (error) {
        console.error('Error fetching modules:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * Get all modules (for admin)
 */
const getAllModules = async (req, res) => {
    try {
        const modulesSnapshot = await db.collection('learningModules')
            .orderBy('createdAt', 'desc')
            .get();

        const modules = [];
        modulesSnapshot.forEach(doc => {
            modules.push({ moduleId: doc.id, ...doc.data() });
        });

        res.json({ success: true, modules });
    } catch (error) {
        console.error('Error fetching all modules:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * Delete a module
 */
const deleteModule = async (req, res) => {
    try {
        const { id } = req.params;
        await db.collection('learningModules').doc(id).delete();
        res.json({ success: true, message: 'Module deleted successfully' });
    } catch (error) {
        console.error('Error deleting module:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * Update a module
 */
const updateModule = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        await db.collection('learningModules').doc(id).update({
            ...updates,
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });

        res.json({ success: true, message: 'Module updated successfully' });
    } catch (error) {
        console.error('Error updating module:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * Get single module details
 */
const getModule = async (req, res) => {
    try {
        const { id } = req.params;
        const moduleDoc = await db.collection('learningModules').doc(id).get();

        if (!moduleDoc.exists) {
            return res.status(404).json({ success: false, message: 'Module not found' });
        }

        const module = { moduleId: moduleDoc.id, ...moduleDoc.data() };

        // Check if user has progress on this module
        let progress = null;
        if (req.user) {
            const userId = req.user.uid;
            const progressDoc = await db.collection('learningProgress')
                .where('farmerId', '==', userId)
                .where('moduleId', '==', id)
                .limit(1)
                .get();

            if (!progressDoc.empty) {
                progress = progressDoc.docs[0].data();
            }
        }

        res.json({ success: true, module, progress });
    } catch (error) {
        console.error('Error fetching module:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * Submit quiz attempt
 */
const submitQuiz = async (req, res) => {
    try {
        const { moduleId, answers } = req.body;
        const userId = req.user.uid;

        // Check if already completed
        const existingProgress = await db.collection('learningProgress')
            .where('farmerId', '==', userId)
            .where('moduleId', '==', moduleId)
            .where('status', '==', 'completed')
            .get();

        if (!existingProgress.empty) {
            return res.json({
                success: true,
                passed: true,
                alreadyCompleted: true,
                message: 'You have already completed this module.'
            });
        }

        const moduleDoc = await db.collection('learningModules').doc(moduleId).get();
        if (!moduleDoc.exists) {
            return res.status(404).json({ success: false, message: 'Module not found' });
        }

        const module = moduleDoc.data();
        const quiz = module.quiz || [];

        let correct = 0;
        quiz.forEach((question, index) => {
            // Compare answers (ensure type consistency)
            if (String(answers[index]) === String(question.correctAnswer)) {
                correct++;
            }
        });

        const score = Math.round((correct / quiz.length) * 100);
        // STRICT CRITERIA: Must get 100% to pass
        const passed = score === 100;

        // Only save progress if passed (since they can't retry for credit if they fail? 
        // Actually user said "quiz can be solved only once". 
        // So we should save the attempt regardless, but only mark completed/award points if passed.
        // But if they fail, can they try again? User said "quiz can be solved only once".
        // This implies if they fail, they fail forever on this module? Or just don't get points?
        // "if any answer gets wrong then he will not get any EcoScore"
        // "quiz can be solved only once and module will be completed" -> Wait, "module will be completed"?
        // "after completing the quiz once, the module will be marked as completed"
        // This sounds like even if they fail, it's marked completed, but no score?
        // Let's re-read: "solve all three questions without giving incorrect answer if farmer solves it without giving any wrong answer then only he can pass that module and get the EcoScore"
        // "if any answer gets wrong then he will not get any EcoScore"
        // "after completing the quiz once, the module will be marked as completed"

        // Interpretation:
        // 1. User takes quiz.
        // 2. We calculate score.
        // 3. We mark module as "completed" in database (so they can't take it again).
        // 4. IF score == 100%, we award EcoScore.
        // 5. IF score < 100%, we do NOT award EcoScore.

        const progressRef = db.collection('learningProgress').doc();
        await progressRef.set({
            progressId: progressRef.id,
            farmerId: userId,
            moduleId,
            status: 'completed', // Always mark completed after one attempt
            quizScore: score,
            passed: passed, // Track if they actually passed the criteria
            completedAt: admin.firestore.FieldValue.serverTimestamp()
        });

        // Award Points ONLY if passed (100% score)
        if (passed) {
            const { awardPoints, POINTS_CONFIG } = require('../services/gamificationService');
            await awardPoints(
                userId,
                POINTS_CONFIG.LEARNING_MODULE,
                'learning_complete',
                `Perfect Score on Module: ${module.title}`,
                moduleId
            );
        }

        res.json({ success: true, score, passed, correct, total: quiz.length });
    } catch (error) {
        console.error('Error submitting quiz:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * Get weather-based recommendations
 */
const getRecommendations = async (req, res) => {
    try {
        const userId = req.user.uid;
        const userDoc = await db.collection('users').doc(userId).get();
        const userData = userDoc.exists ? userDoc.data() : {};

        const weatherData = await getWeatherData(userData.location || 'India');
        const recommendations = getWeatherRecommendations(weatherData);

        res.json({ success: true, recommendations, weather: weatherData.current });
    } catch (error) {
        console.error('Error getting recommendations:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * Generate AI module or save manual module
 */
const generateModule = async (req, res) => {
    try {
        const { category, crop, difficulty, title, shortDescription } = req.body;

        let moduleData;

        // Check if this is a manual module (has title) or AI generation request
        if (title && shortDescription) {
            // Manual module - use data directly from request
            const moduleRef = db.collection('learningModules').doc();
            moduleData = {
                moduleId: moduleRef.id,
                category: req.body.category,
                title: req.body.title,
                shortDescription: req.body.shortDescription,
                longDescription: req.body.longDescription,
                steps: req.body.steps || [],
                benefits: req.body.benefits || [],
                difficulty: req.body.difficulty || 'beginner',
                estimatedTime: parseInt(req.body.estimatedTime) || 2,
                media: req.body.media || { image: '', video: '' },
                quiz: req.body.quiz || [],
                relatedCrops: req.body.relatedCrops || [],
                weatherTriggers: req.body.weatherTriggers || [],
                aiGenerated: false,
                approved: true,
                createdAt: admin.firestore.FieldValue.serverTimestamp()
            };

            await moduleRef.set(moduleData);
        } else {
            // AI generation
            const weatherData = await getWeatherData('India');
            const module = await generateLearningModule({ category, crop, weather: weatherData, difficulty });

            const moduleRef = db.collection('learningModules').doc();
            moduleData = {
                moduleId: moduleRef.id,
                ...module,
                aiGenerated: true,
                approved: true,
                createdAt: admin.firestore.FieldValue.serverTimestamp()
            };

            await moduleRef.set(moduleData);
        }

        res.json({ success: true, module: moduleData });
    } catch (error) {
        console.error('Error generating module:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Legacy functions for backward compatibility
const getSnippets = async (req, res) => {
    const snippets = [
        { id: 1, title: "Water Conservation", content: "Drip irrigation saves up to 50% water", category: "Water", icon: "💧" },
        { id: 2, title: "Soil Health", content: "Compost improves soil structure", category: "Soil", icon: "🌱" }
    ];
    res.json({ success: true, snippets });
};

const getQuiz = async (req, res) => {
    const quiz = [
        { id: 1, question: "Which irrigation saves the most water?", options: ["Flood", "Drip", "Sprinkler", "Furrow"], answer: "Drip" }
    ];
    res.json({ success: true, quiz });
};

module.exports = {
    getCategories,
    getModulesByCategory,
    getAllModules,
    getModule,
    deleteModule,
    updateModule,
    submitQuiz,
    getRecommendations,
    generateModule,
    getSnippets,
    getQuiz
};
