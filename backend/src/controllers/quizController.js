const { db, admin } = require('../config/firebase');
const { generateQuizQuestions } = require('../services/geminiService');

// Generate a new quiz
const generateQuiz = async (req, res) => {
    try {
        const { crop, soilType, location, stage, language } = req.body;
        const userId = req.user.uid;

        if (!crop || !soilType) {
            return res.status(400).json({ message: 'Crop and Soil Type are required' });
        }

        // Generate questions using Gemini
        const questions = await generateQuizQuestions(crop, soilType, location, stage, language);

        // Create a new quiz document
        const quizData = {
            userId,
            crop,
            soilType,
            stage: stage || 'General',
            questions,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            completed: false,
            score: 0
        };

        const quizRef = await db.collection('quizzes').add(quizData);

        res.status(201).json({
            success: true,
            quizId: quizRef.id,
            questions: questions.map(q => ({
                id: q.id,
                question: q.question,
                options: q.options,
                correctAnswer: q.correctAnswer,
                explanation: q.explanation,
                visual_search_term: q.visual_search_term
            }))
        });
    } catch (error) {
        console.error('Error generating quiz:', error);
        res.status(500).json({ message: 'Failed to generate quiz', error: error.message });
    }
};

// Submit quiz answers
const submitQuiz = async (req, res) => {
    try {
        const { quizId, answers } = req.body; // answers: { questionId: selectedOption }
        const userId = req.user.uid;

        const quizRef = db.collection('quizzes').doc(quizId);
        const quizDoc = await quizRef.get();

        if (!quizDoc.exists) {
            return res.status(404).json({ message: 'Quiz not found' });
        }

        const quizData = quizDoc.data();

        // Verify user owns this quiz
        if (quizData.userId !== userId) {
            return res.status(403).json({ message: 'Unauthorized' });
        }

        let score = 0;
        const results = [];

        quizData.questions.forEach(q => {
            const selected = answers[q.id];
            const isCorrect = selected === q.correctAnswer;
            if (isCorrect) score += 5;

            results.push({
                questionId: q.id,
                question: q.question,
                selected,
                correctAnswer: q.correctAnswer,
                isCorrect,
                explanation: q.explanation
            });
        });

        // Bonus Calculation
        const totalQuestions = quizData.questions.length;
        const maxScore = totalQuestions * 5;
        const percentage = (score / maxScore) * 100;
        let bonus = 0;

        if (percentage >= 90) {
            bonus = 20;
        }

        const totalEarned = score + bonus;

        // Update Quiz Document
        await quizRef.update({
            completed: true,
            score,
            bonus,
            results,
            completedAt: admin.firestore.FieldValue.serverTimestamp()
        });

        // Update User EcoScore
        // Update User EcoScore & Credits
        // Update User EcoScore & Credits
        // Credits are now handled by updateEcoScore service automatically
        // const userRef = db.collection('users').doc(userId);
        // await userRef.update({ credits: ... }); -> REMOVED

        // Use centralized service for EcoScore to ensure history logging
        const { updateEcoScore } = require('../services/gamificationService');
        await updateEcoScore(
            userId,
            totalEarned,
            'QUIZ_COMPLETION',
            `Quiz Score: ${score} + Bonus: ${bonus}`,
            quizId
        );

        res.json({
            success: true,
            score,
            bonus,
            totalEarned,
            results,
            message: bonus > 0
                ? `Outstanding! You earned ${score} points + ${bonus} Bonus!`
                : `Quiz submitted! You earned ${score} EcoScore.`
        });

    } catch (error) {
        console.error('Error submitting quiz:', error);
        res.status(500).json({ message: 'Failed to submit quiz', error: error.message });
    }
};

// Get Quiz History
const getQuizHistory = async (req, res) => {
    try {
        const userId = req.user.uid;
        const snapshot = await db.collection('quizzes')
            .where('userId', '==', userId)
            .where('completed', '==', true)
            .orderBy('completedAt', 'desc')
            .limit(20)
            .get();

        const history = [];
        snapshot.forEach(doc => {
            history.push({ id: doc.id, ...doc.data() });
        });

        res.json({ success: true, history });
    } catch (error) {
        console.error('Error fetching quiz history:', error);
        res.status(500).json({ message: 'Failed to fetch history', error: error.message });
    }
};

module.exports = { generateQuiz, submitQuiz, getQuizHistory };
