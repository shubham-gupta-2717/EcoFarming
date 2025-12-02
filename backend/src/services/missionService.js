const axios = require('axios');

const generateMissionFromAI = async (farmerData) => {
    const apiKey = process.env.AI_API_KEY;

    if (!apiKey || apiKey === 'your-gemini-or-openai-key') {
        console.warn("Using Mock Mission Data (No API Key)");
        return getMockMission();
    }

    try {
        const prompt = `
      You are an expert agricultural advisor for the EcoFarming platform.
      Generate a personalized daily farming mission for a farmer with the following profile:
      - Crop: ${farmerData?.crop || 'Wheat'}
      - Location: ${farmerData?.location || 'India'}
      - Season: ${farmerData?.season || 'Rabi'}
      - Land Size: ${farmerData?.landSize || '2 acres'}
      
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

        const response = await axios.post(
            `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
            {
                contents: [{
                    parts: [{ text: prompt }]
                }]
            }
        );

        const text = response.data.candidates[0].content.parts[0].text;
        const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();

        return JSON.parse(cleanText);

    } catch (error) {
        console.error("AI Generation Error:", error.response?.data || error.message);
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
/**
 * Generate mission specifically for a selected crop
 * @param {Object} context - Crop-specific context
 * @param {Array} availableBadges - List of badges the user can earn (optional)
 * @param {Object} lastMission - The last completed mission (optional)
 * @returns {Promise<Object>} - Generated mission
 */
const generateMissionForCrop = async (context, availableBadges = [], lastMission = null) => {
    const apiKey = process.env.AI_API_KEY;

    if (!apiKey || apiKey === 'your-gemini-or-openai-key') {
        console.warn("Using Mock Mission Data (No API Key)");
        return getMockCropMission(context.cropName);
    }

    try {
        // Filter relevant badges to show to AI (top 5 unearned)
        const targetBadges = availableBadges
            .filter(b => !b.earned)
            .slice(0, 5)
            .map(b => `${b.name} (${b.description})`)
            .join(', ');

        const lastMissionContext = lastMission
            ? `User just completed: "${lastMission.title}". Do NOT repeat this task.`
            : 'This is the first mission.';

        const prompt = `
You are an expert agricultural advisor for the EcoFarming platform.
Generate a personalized sustainability mission for a farmer.

Farmer Context:
- Crop: ${context.cropName}
- Growth Stage: ${context.cropStage}
- Land Size: ${context.landSize} hectares
- Season: ${context.season}
- Location: ${context.location}

GAMIFICATION CONTEXT:
- Target Badges (Help user earn these): ${targetBadges || 'General Sustainability'}
- History: ${lastMissionContext}

WEATHER CONTEXT (CRITICAL):
${context.weather}

${context.weatherTrigger ? `⚠️ WEATHER ALERT: ${context.weatherTrigger.type} - ${context.weatherTrigger.suggestion}` : ''}

IMPORTANT RULES:
1. The task MUST be specific to ${context.cropName} in the ${context.cropStage} stage.
2. PRIORITIZE weather-appropriate tasks based on current conditions.
3. ALIGN with one of the Target Badges if possible (e.g., if "Soil Saver" is target, suggest a soil test).
4. Make it sustainable and eco-friendly.
5. Make it actionable and specific.
6. VARY the tasks. Do not just suggest mulching. Consider: Pest management, Soil health, Water conservation, Intercropping, etc.

Output strictly in this JSON format (NO markdown formatting):
{
  "cropTarget": "${context.cropName}",
  "task": "Actionable task title",
  "steps": ["Step 1", "Step 2", "Step 3"],
  "benefits": "Why this helps ${context.cropName}",
  "why": "Detailed rationale for why this mission is important right now (e.g. 'Due to high humidity, fungal risk is high...')",
  "verification": "How to verify completion (photo/video description)",
  "credits": 20,
  "difficulty": "Easy/Medium/Hard",
  "ecoScoreImpact": 5,
  "seasonalTag": "${context.season}",
  "language": "${context.language}",
  "languageAudioUrl": "mock-audio-url", 
  "weatherInfluenced": true,
  "microLearning": "Did you know? ...",
  "quiz": [{"question": "...", "options": ["A", "B"], "answer": "A"}],
  "weatherResponse": "${context.weatherTrigger ? context.weatherTrigger.type : 'NORMAL'}",
  "behaviorCategory": "One of: Soil Health, Water Conservation, Pest Management, Crop Practices, Climate Resilience, Institute Special, Emergency"
}

Do NOT include markdown code blocks. Return only raw JSON.
`;

        const response = await axios.post(
            `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
            {
                contents: [{
                    parts: [{ text: prompt }]
                }]
            }
        );

        const text = response.data.candidates[0].content.parts[0].text;
        const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();

        const missionData = JSON.parse(cleanText);

        // Ensure cropTarget is set
        missionData.cropTarget = context.cropName;
        missionData.cropStage = context.cropStage;

        console.log('✅ AI-generated mission successfully for:', context.cropName);
        return missionData;

    } catch (error) {
        console.error("AI Generation Error for crop:", error.response?.data || error.message);
        console.log('⚠️ Falling back to mock mission for:', context.cropName);
        return getMockCropMission(context.cropName);
    }
};

/**
 * Get mock mission for specific crop (when AI unavailable)
 * Returns a random mission from a set of templates to ensure variety.
 */
const getMockCropMission = (cropName) => {
    const templates = [
        {
            task: `Mulching Around ${cropName}`,
            steps: [`Prepare organic mulch`, `Spread 2-3 inch layer`, `Keep away from stem`],
            benefits: `Retains moisture and prevents weeds.`,
            category: "Water Conservation"
        },
        {
            task: `Check ${cropName} for Pests`,
            steps: [`Inspect under leaves`, `Look for discoloration`, `Remove visible pests`],
            benefits: `Early detection prevents crop loss.`,
            category: "Pest Management"
        },
        {
            task: `Soil Moisture Check for ${cropName}`,
            steps: [`Dig 2 inches deep`, `Check if soil sticks to hand`, `Water only if dry`],
            benefits: `Prevents over-watering and root rot.`,
            category: "Soil Management"
        },
        {
            task: `Prepare Bio-Pesticide for ${cropName}`,
            steps: [`Mix neem oil with water`, `Add a drop of soap`, `Spray on leaves`],
            benefits: `Natural protection against insects.`,
            category: "Organic Farming"
        }
    ];

    const randomTemplate = templates[Math.floor(Math.random() * templates.length)];

    return {
        cropTarget: cropName,
        task: randomTemplate.task,
        steps: randomTemplate.steps,
        benefits: randomTemplate.benefits,
        verification: `Take a photo of the activity.`,
        credits: 20,
        difficulty: "Easy",
        ecoScoreImpact: 5,
        seasonalTag: "All Season",
        language: "English",
        microLearning: `Sustainable practices increase yield by 20% over time.`,
        quiz: [{
            question: `Why is this task important?`,
            options: ["Saves money", "Improves health", "Both"],
            answer: "Both"
        }],
        behaviorCategory: randomTemplate.category
    };
};

module.exports = { generateMissionFromAI, generateMissionForCrop };
