const { GoogleGenerativeAI } = require('@google/generative-ai');

const AI_API_KEY = process.env.AI_API_KEY;

/**
 * Generate learning module using AI
 */
async function generateLearningModule({ category, crop, weather, difficulty = 'beginner' }) {
    const apiKey = AI_API_KEY;

    if (!apiKey || apiKey === 'your-gemini-or-openai-key') {
        console.warn("Using Mock Learning Module (No API Key)");
        return getMockModule(category);
    }

    try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

        const weatherContext = weather ? `
Current Weather: ${weather.current.temp}°C, ${weather.current.humidity}% humidity, ${weather.current.weather}
Rain probability: ${weather.current.rainProbability}%
` : 'No specific weather context';

        const prompt = `
You are an agricultural education expert for the EcoFarming platform.
Generate a micro-learning module for farmers.

Context:
- Category: ${category}
- Crop: ${crop || 'General'}
- Difficulty: ${difficulty}
${weatherContext}

Requirements:
- Simple, practical, actionable content
- 1-2 minute read time
- 3-5 clear steps
- 2-3 key benefits
- Include 3 quiz questions

Output strictly in this JSON format (NO markdown):
{
  "title": "Short catchy title under 50 characters",
  "shortDescription": "One-sentence summary",
  "longDescription": "2-3 sentence detailed explanation",
  "steps": ["Step 1", "Step 2", "Step 3"],
  "benefits": ["Benefit 1", "Benefit 2"],
  "difficulty": "${difficulty}",
  "estimatedTime": 2,
  "quiz": [
    {
      "question": "Quiz question about the topic",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": 0
    },
    {
      "question": "Second quiz question",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": 1
    },
    {
      "question": "Third quiz question",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": 2
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
        return getMockModule(category);
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
 * Mock learning module
 */
function getMockModule(category) {
    return {
        title: `Introduction to ${category}`,
        shortDescription: `Learn the basics of ${category} for sustainable farming.`,
        longDescription: `This module covers fundamental concepts and practical techniques in ${category}. You'll learn actionable steps to improve your farming practices.`,
        steps: [
            "Understand the core principles",
            "Learn practical implementation techniques",
            "Apply methods on your farm"
        ],
        benefits: [
            "Improved crop yield",
            "Sustainable farming practices"
        ],
        difficulty: 'beginner',
        estimatedTime: 2,
        category,
        media: {
            image: getDefaultImage(category),
            video: ''
        },
        quiz: [
            {
                question: `What is the main goal of ${category}?`,
                options: ["Increase yield", "Reduce costs", "Sustainability", "All of above"],
                correctAnswer: 3
            },
            {
                question: "How often should you apply these techniques?",
                options: ["Daily", "Weekly", "Seasonally", "As needed"],
                correctAnswer: 3
            },
            {
                question: "What is the key benefit?",
                options: ["Quick results", "Long-term sustainability", "No effort", "Guaranteed profit"],
                correctAnswer: 1
            }
        ],
        relatedCrops: [],
        weatherTriggers: []
    };
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
