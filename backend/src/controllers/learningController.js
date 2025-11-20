const getSnippets = async (req, res) => {
    try {
        // Mock Micro-Learning Snippets
        // TODO: In production, fetch from database or generate via AI
        const snippets = [
            {
                id: 1,
                title: "Water Conservation",
                content: "Drip irrigation can save up to 50% of water compared to flood irrigation.",
                category: "Water",
                icon: "💧"
            },
            {
                id: 2,
                title: "Soil Health",
                content: "Adding organic matter like compost improves soil structure and water retention.",
                category: "Soil",
                icon: "🌱"
            },
            {
                id: 3,
                title: "Pest Management",
                content: "Neem oil is a natural pesticide that repels over 200 species of insects.",
                category: "Pest",
                icon: "🐛"
            },
            {
                id: 4,
                title: "Crop Rotation",
                content: "Rotating crops helps prevent soil depletion and breaks pest cycles.",
                category: "Farming",
                icon: "🔄"
            }
        ];

        res.json({ success: true, snippets });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const getQuiz = async (req, res) => {
    try {
        // Mock Quiz Questions
        // TODO: In production, fetch from database or generate via AI
        const quiz = [
            {
                id: 1,
                question: "Which irrigation method saves the most water?",
                options: ["Flood Irrigation", "Drip Irrigation", "Sprinkler Irrigation", "Furrow Irrigation"],
                answer: "Drip Irrigation",
                explanation: "Drip irrigation delivers water directly to the plant roots, minimizing evaporation and runoff."
            },
            {
                id: 2,
                question: "What is the primary benefit of crop rotation?",
                options: ["Increases water usage", "Depletes soil nutrients", "Breaks pest and disease cycles", "Requires more fertilizer"],
                answer: "Breaks pest and disease cycles",
                explanation: "Different crops attract different pests; rotating them disrupts the pests' life cycles."
            },
            {
                id: 3,
                question: "Which of these is a natural fertilizer?",
                options: ["Urea", "DAP", "Compost", "Potash"],
                answer: "Compost",
                explanation: "Compost is organic matter that has decomposed and is used as a fertilizer and soil amendment."
            }
        ];

        res.json({ success: true, quiz });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = { getSnippets, getQuiz };
