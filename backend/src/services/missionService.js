const axios = require('axios');

const generateMissionFromAI = async (farmerData) => {
    const apiKey = process.env.AI_API_KEY;

    console.log("DEBUG: AI_API_KEY value:", apiKey ? "EXISTS (Length: " + apiKey.length + ")" : "MISSING");
    console.log("DEBUG: Using AI Model: gemini-2.5-flash-lite"); // Explicit Log
    if (apiKey === 'your-gemini-or-openai-key') console.log("DEBUG: Key is default placeholder!");

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
            `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash-lite:generateContent?key=${apiKey}`,
            {
                contents: [{
                    parts: [{ text: prompt }]
                }]
            },
            { timeout: 15000 }
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

    console.log("DEBUG: AI_API_KEY value in ForCrop:", apiKey ? "EXISTS (Length: " + apiKey.length + ")" : "MISSING");
    console.log("DEBUG: Using AI Model: gemini-2.5-flash-lite"); // Explicit Log
    if (apiKey === 'your-gemini-or-openai-key') console.log("DEBUG: Key is placeholder in ForCrop");

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

        // Calculate days since sowing if available
        let growthContext = `- Growth Stage: ${context.cropStage}`;
        if (context.sowingDate) {
            const sowing = new Date(context.sowingDate);
            const now = new Date();
            const diffTime = Math.abs(now - sowing);
            const daysSinceSowing = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            growthContext = `
- Sowing Date: ${context.sowingDate}
- Days Since Sowing: ${daysSinceSowing} days
- Farmer Notes: ${context.notes || 'None'}
            `;
        }

        const prompt = `
You are an expert agricultural advisor for the EcoFarming platform.
Generate a personalized sustainability mission for a farmer.

Farmer Context:
- Crop: ${context.cropName}
${growthContext}
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
1. FIRST, infer the **Current Crop Stage** based on the Days Since Sowing and standard lifecycle for ${context.cropName}.
2. The task MUST be appropriate for this inferred stage.
3. PRIORITIZE weather-appropriate tasks based on current conditions.
4. ALIGN with one of the Target Badges if possible.
5. Make it sustainable and eco-friendly.

VISUAL LEARNING ENHANCEMENT:
For each step, intelligently determine if a visual aid (video or image) would significantly help.

Output strictly in this JSON format (NO markdown formatting):
{
  "detectedStageName": "Inferred Stage Name (e.g. Vegetative, Flowering)",
  "detectedStageNumber": 2, 
  "cropTarget": "${context.cropName}",
  "task": "Actionable task title",
  "steps": [
    {
      "text": "Step description",
      "needsVisual": true,
      "videoQuery": "how to prune wheat seedlings tutorial",
      "imageQuery": null
    }
  ],
  "benefits": "Why this helps ${context.cropName}",
  "why": "Detailed rationale for why this mission is important right now",
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
  "behaviorCategory": "Soil Health/Water/Pest/etc"
}

IMPORTANT: Use videoQuery and imageQuery (search terms), NOT videoUrl or imageUrl.
Do NOT include markdown code blocks. Return only raw JSON.
`;

        const response = await axios.post(
            `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash-lite:generateContent?key=${apiKey}`,
            {
                contents: [{
                    parts: [{ text: prompt }]
                }]
            },
            { timeout: 15000 }
        );

        const text = response.data.candidates[0].content.parts[0].text;
        const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();

        const missionData = JSON.parse(cleanText);

        // Backward compatibility for steps
        if (missionData.steps && Array.isArray(missionData.steps)) {
            missionData.steps = missionData.steps.map(step => {
                if (typeof step === 'object' && step.text) return step;
                if (typeof step === 'string') {
                    return {
                        text: step,
                        needsVisual: false,
                        videoQuery: null,
                        imageQuery: null
                    };
                }
                return step;
            });
        }

        // Ensure key fields are set
        missionData.cropTarget = context.cropName;
        // Use AI detected stage if available, else fallback
        missionData.cropStage = missionData.detectedStageName || context.cropStage;

        console.log(`✅ AI Generated Mission for ${context.cropName} (Stage: ${missionData.cropStage})`);
        return missionData;

    } catch (error) {
        const errorMsg = error.response?.data?.error?.message || error.message;
        console.error("AI Generation Error for crop:", errorMsg);
        console.log('⚠️ Falling back to mock mission for:', context.cropName);
        return getMockCropMission(context.cropName, errorMsg);
    }
};

/**
 * Get mock mission for specific crop (when AI unavailable)
 * Returns a random mission from a set of templates to ensure variety.
 */
const getMockCropMission = (cropName, debugError = null) => {
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
        task: debugError ? `[DEBUG ERROR] ${debugError.substring(0, 50)}...` : randomTemplate.task,
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
        behaviorCategory: randomTemplate.category,
        cropStage: 'General'
    };
};

module.exports = { generateMissionFromAI, generateMissionForCrop };
