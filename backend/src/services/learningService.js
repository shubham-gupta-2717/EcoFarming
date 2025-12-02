const { GoogleGenerativeAI } = require('@google/generative-ai');

const AI_API_KEY = process.env.AI_API_KEY;

/**
 * Generate learning module using AI
 */
/**
 * Generate learning module using AI
 */
async function generateLearningModule({ category, crop, weather, difficulty = 'beginner' }) {
    const apiKey = AI_API_KEY;

    if (!apiKey || apiKey === 'your-gemini-or-openai-key') {
        throw new Error("AI_API_KEY is missing or invalid. Cannot generate learning module.");
    }

    try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

        const weatherContext = weather ? `
Current Weather: ${weather.current.temp}°C, ${weather.current.humidity}% humidity, ${weather.current.weather}
Rain probability: ${weather.current.rainProbability}%
` : 'No specific weather context';

        const prompt = `
You are a friendly and knowledgeable Agricultural Guide for the EcoFarming platform.
Your goal is to teach farmers about "${category}" in a simple, engaging, and professional way.

Context:
- Category: ${category}
- Crop: ${crop || 'General Farming'}
- Difficulty: ${difficulty}
${weatherContext}

CRITICAL INSTRUCTIONS FOR CONTENT QUALITY:
1. **Tone**: Use simple, conversational English. Avoid complex scientific jargon. Speak directly to the farmer (use "You").
2. **Structure**: Make it look professional but easy to read.
3. **Interactive**: Ask rhetorical questions or encourage observation (e.g., "Check your soil...", "Look at the leaves...").
4. **Formatting**: Use Emojis 🌾💧🚜 to make it visually appealing and easier to understand.

Output strictly in this JSON format (NO markdown):
{
  "title": "A clear, professional title (e.g., 'Mastering Water Management for Rice')",
  "shortDescription": "A catchy, one-sentence summary that makes the farmer want to learn.",
  "longDescription": "A friendly, engaging introduction. Explain WHY this topic matters. Use 2-3 short paragraphs. Use emojis.",
  "steps": [
    "Step 1: [Action Verb] - Detailed instruction with an emoji. (e.g., '🔍 Check Soil Moisture: Dig your finger 2 inches deep...')",
    "Step 2: [Action Verb] - Detailed instruction...",
    "Step 3: [Action Verb] - Detailed instruction...",
    "Step 4: [Action Verb] - Detailed instruction..."
  ],
  "benefits": [
    "💰 Benefit 1 (Focus on profit/savings)",
    "🌱 Benefit 2 (Focus on crop health)",
    "⏳ Benefit 3 (Focus on time/effort)"
  ],
  "difficulty": "${difficulty}",
  "estimatedTime": 3,
  "quiz": [
    {
      "question": "A practical scenario-based question (e.g., 'If your leaves turn yellow, what should you do?')",
      "options": ["Wrong Option", "Correct Action", "Wrong Option", "Wrong Option"],
      "correctAnswer": 1,
      "explanation": "Briefly explain why the correct answer is right and why the others are wrong."
    },
    {
      "question": "Another practical question",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": 0,
      "explanation": "Explanation for this question."
    },
    {
      "question": "Third practical question",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": 2,
      "explanation": "Explanation for this question."
    }
  ],
  "relatedCrops": ["${crop || 'All crops'}"],
  "weatherTriggers": []
}
`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
        const moduleData = JSON.parse(cleanText);

        return {
            ...moduleData,
            category,
            media: {
                image: getDefaultImage(category),
                video: '' // Admin can add later
            }
        };
    } catch (error) {
        console.error("AI Generation Error for learning module:", error);
        throw new Error("Failed to generate learning module via AI: " + error.message);
    }
}

/**
 * Get default image for category
 */
function getDefaultImage(category) {
    const images = {
        'Soil Health': 'https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=400',
        'Water Management': 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400',
        'Pest Control': 'https://images.unsplash.com/photo-1592419044706-39796d40f9s4c?w=400',
        'Organic Farming': 'https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=400',
        'Crop Guides': 'https://images.unsplash.com/photo-1560493676-04071c5f467b?w=400',
        'Weather Tips': 'https://images.unsplash.com/photo-1534088568595-a066f410bcda?w=400',
        'Government Schemes': 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=400',
        'Success Stories': 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=400'
    };
    return images[category] || 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=400';
}

/**
 * Get weather-based module recommendations
 */
function getWeatherRecommendations(weatherData) {
    const recommendations = [];
    const { current } = weatherData;

    // High humidity → Fungal disease
    if (current.humidity > 80) {
        recommendations.push({
            moduleTitle: 'Fungal Disease Prevention',
            category: 'Pest Control',
            reason: 'High humidity detected - Risk of fungal diseases',
            urgency: 'high'
        });
    }

    // High temperature → Heat protection
    if (current.temp > 35) {
        recommendations.push({
            moduleTitle: 'Heat Protection for Crops',
            category: 'Weather Tips',
            reason: 'Extreme heat - Protect your crops',
            urgency: 'critical'
        });
    }

    // High rain probability → Drainage
    if (current.rainProbability > 70) {
        recommendations.push({
            moduleTitle: 'Drainage Systems',
            category: 'Water Management',
            reason: 'Heavy rain expected - Prepare drainage',
            urgency: 'high'
        });
    }

    // Low humidity → Irrigation
    if (current.humidity < 30) {
        recommendations.push({
            moduleTitle: 'Efficient Irrigation Techniques',
            category: 'Water Management',
            reason: 'Low humidity - Increase watering',
            urgency: 'medium'
        });
    }

    return recommendations;
}

module.exports = {
    generateLearningModule,
    getWeatherRecommendations
};
