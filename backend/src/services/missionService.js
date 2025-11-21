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

/**
 * Generate mission specifically for a selected crop
 * @param {Object} context - Crop-specific context
 * @returns {Promise<Object>} - Generated mission
 */
const generateMissionForCrop = async (context) => {
    const apiKey = process.env.AI_API_KEY;

    if (!apiKey || apiKey === 'your-gemini-or-openai-key') {
        console.warn("Using Mock Mission Data (No API Key)");
        return getMockCropMission(context.cropName);
    }

    try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

        const prompt = `
You are an expert agricultural advisor for the EcoFarming platform.
Generate a personalized sustainability mission for a farmer.

Farmer Context:
- Crop: ${context.cropName}
- Growth Stage: ${context.cropStage}
- Land Size: ${context.landSize} hectares
- Season: ${context.season}
- Location: ${context.location}

WEATHER CONTEXT (CRITICAL):
${context.weather}

${context.weatherTrigger ? `⚠️ WEATHER ALERT: ${context.weatherTrigger.type} - ${context.weatherTrigger.suggestion}` : ''}

IMPORTANT RULES:
1. The task MUST be specific to ${context.cropName} in the ${context.cropStage} stage.
2. PRIORITIZE weather-appropriate tasks based on current conditions:
   - High temperature (>35°C) → shade nets, mulching, increased watering
   - Heavy rain expected (>70% probability) → drainage preparation, crop covering
   - Low humidity (<30%) → irrigation systems, moisture retention
   - High humidity (>85%) → fungal disease prevention, ventilation
   - Weather alerts → urgent protective measures
3. Make it sustainable and eco-friendly
4. Make it actionable and specific
5. Tasks should help the farmer respond to current/upcoming weather conditions

Output strictly in this JSON format (NO markdown formatting):
{
  "cropTarget": "${context.cropName}",
  "task": "Weather-appropriate task for ${context.cropName}",
  "steps": ["Step 1 considering weather", "Step 2", "Step 3"],
  "benefits": "Benefits for ${context.cropName} given current weather",
  "verification": "How to verify completion (photo/video description)",
  "credits": 15-30,
  "difficulty": "Easy/Medium/Hard",
  "ecoScoreImpact": 3-8,
  "seasonalTag": "${context.season}",
  "language": "${context.language}",
  "weatherInfluenced": true,
  "microLearning": "Weather-related farming tip for ${context.cropName}",
  "quiz": [{"question": "Weather-related quiz for ${context.cropName}", "options": ["Option A", "Option B", "Option C"], "answer": "Option A"}],
  "weatherResponse": "${context.weatherTrigger ? context.weatherTrigger.type : 'NORMAL'}",
  "behaviorCategory": "Water Conservation/Soil Health/Pest Management/Organic Farming"
}

Do NOT include markdown code blocks. Return only raw JSON.
`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        // Clean up potential markdown code blocks
        const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();

        const missionData = JSON.parse(cleanText);

        // Ensure cropTarget is set
        missionData.cropTarget = context.cropName;
        missionData.cropStage = context.cropStage;

        return missionData;

    } catch (error) {
        console.error("AI Generation Error for crop:", error);
        return getMockCropMission(context.cropName);
    }
};

/**
 * Get mock mission for specific crop (when AI unavailable)
 */
const getMockCropMission = (cropName) => ({
    cropTarget: cropName,
    task: `Mulching Around ${cropName} Plants`,
    steps: [
        `Prepare organic mulch materials (straw, leaves)`,
        `Spread 2-3 inch layer around ${cropName} base`,
        `Keep mulch 2 inches away from stem`,
        `Water gently after mulching`
    ],
    benefits: `Retains moisture, prevents weeds, and improves soil health for ${cropName}.`,
    verification: `Take a photo of mulched ${cropName} plants.`,
    credits: 20,
    difficulty: "Easy",
    ecoScoreImpact: 5,
    seasonalTag: "All Season",
    language: "English",
    microLearning: `Mulching can reduce water usage by up to 25% for ${cropName} cultivation.`,
    quiz: [{
        question: `What is the ideal mulch depth for ${cropName}?`,
        options: ["1 inch", "2-3 inches", "6 inches"],
        answer: "2-3 inches"
    }],
    behaviorCategory: "Water Conservation"
});

module.exports = { generateMissionFromAI, generateMissionForCrop };
