const { GoogleGenerativeAI } = require("@google/generative-ai");

const generateMissionFromAI = async (farmerData) => {
    const apiKey = process.env.AI_API_KEY;

    if (!apiKey || apiKey === 'your-gemini-or-openai-key') {
        console.warn("Using Mock Mission Data (No API Key)");
        return getMockMission();
    }

    try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

        const prompt = `
      You are an expert agricultural advisor for the EcoFarming platform.
      Generate a personalized daily farming mission for a farmer with the following profile:
      - Crop: ${farmerData.crop || 'Wheat'}
      - Location: ${farmerData.location || 'India'}
      - Season: ${farmerData.season || 'Rabi'}
      - Land Size: ${farmerData.landSize || '2 acres'}
      
      Output strictly in this JSON format:
      {
        "task": "Title of the task",
        "steps": ["Step 1", "Step 2"],
        "benefits": "Why this is good",
        "verification": "How to verify (e.g. Take a photo of...)",
        "credits": 20,
        "difficulty": "Easy/Medium/Hard",
        "ecoScoreImpact": 5,
        "seasonalTag": "Rabi Special",
        "language": "English",
        "microLearning": "Did you know? ...",
        "quiz": [{"question": "...", "options": ["A", "B"], "answer": "A"}]
      }
      Do not include markdown formatting like \`\`\`json. Just the raw JSON.
    `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        // Clean up potential markdown code blocks
        const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();

        return JSON.parse(cleanText);

    } catch (error) {
        console.error("AI Generation Error:", error);
        return getMockMission();
    }
};

const getMockMission = () => ({
    task: "Inspect for Termites",
    steps: ["Walk through the field", "Look for mud tunnels on stems", "Apply neem cake if needed"],
    benefits: "Prevents crop damage naturally.",
    verification: "Take a photo of the inspected area.",
    credits: 15,
    difficulty: "Easy",
    ecoScoreImpact: 3,
    seasonalTag: "General",
    language: "English",
    microLearning: "Termites can destroy 30% of crop yield if unchecked.",
    quiz: [{
        question: "What is a sign of termites?",
        options: ["Mud tunnels", "Yellow leaves"],
        answer: "Mud tunnels"
    }]
});

module.exports = { generateMissionFromAI };
