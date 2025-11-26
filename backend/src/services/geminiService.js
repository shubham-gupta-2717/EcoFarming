const axios = require('axios');
const dotenv = require('dotenv');

dotenv.config();

const generateQuizQuestions = async (crop, soilType, location = 'India', stage = 'General', language = 'en') => {
    const apiKey = process.env.AI_API_KEY;

    if (!apiKey) {
        console.warn("⚠️ No API Key. Using Mock Quiz Data.");
        return getMockQuizQuestions(crop, soilType);
    }

    try {
        const prompt = `
            You are a Professional Agricultural Expert and Agronomist.
            Generate 10 multiple-choice questions for a farmer growing ${crop} in ${soilType} soil in ${location}.
            The current growth stage of the crop is: ${stage}.
            
            CRITICAL INSTRUCTION: Output the questions, options, and explanations in the following language code: "${language}". 
            If the language is not English, translate everything EXCEPT the JSON keys.

            CRITICAL INSTRUCTIONS:
            1. **Tone**: Professional, encouraging, and clear. Do NOT use slang like "bhai", "bro", or casual street language. Use respectful, simple language suitable for a farmer.
            2. **Stage Relevance**: Focus strictly on the "${stage}" stage. 
               - If stage is "Sowing", ask about seed treatment, spacing, and germination. DO NOT ask about harvesting or fruit color.
               - If stage is "Vegetative", ask about irrigation, weeding, and early pest signs.
               - If stage is "Harvesting", ask about maturity signs and post-harvest storage.
            3. **Conflict Detection**: Check if ${crop} works in ${soilType}. If not, ask about soil amendments.
            4. **Visuals**: Provide a short, precise search term for finding a relevant image/video (Keep this in English for better search results).
            
            Return ONLY a valid JSON array of objects (no markdown). Structure:
            {
                "id": 1,
                "question": "Clear, practical question in ${language}?",
                "options": ["Option A", "Option B", "Option C", "Option D"],
                "correctAnswer": "Option A",
                "explanation": "Professional explanation of why in ${language}. Focus on best practices.",
                "visual_search_term": "Tomato seedling damping off"
            }
        `;

        // Using the same endpoint/model as missionService.js which is confirmed to work
        const response = await axios.post(
            `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
            {
                contents: [{
                    parts: [{ text: prompt }]
                }]
            }
        );

        const text = response.data.candidates[0].content.parts[0].text;
        const cleanedText = text.replace(/```json/g, '').replace(/```/g, '').trim();

        return JSON.parse(cleanedText);

    } catch (error) {
        console.error("Error generating quiz:", error.response?.data || error.message);
        console.warn("⚠️ API Failed. Using Mock Quiz Data.");
        return getMockQuizQuestions(crop, soilType);
    }
};

const getMockQuizQuestions = (crop, soilType) => {
    return [
        {
            "id": 1,
            "question": `Which irrigation method is best for ${crop} in ${soilType} soil to save water?`,
            "options": ["Flood Irrigation", "Drip Irrigation", "Sprinkler System", "Rainfed only"],
            "correctAnswer": "Drip Irrigation",
            "explanation": "Drip irrigation delivers water directly to roots, minimizing evaporation, especially important for sustainable farming."
        },
        {
            "id": 2,
            "question": `What is a natural way to control pests in ${crop}?`,
            "options": ["Chemical Spray", "Neem Oil", "Burning residue", "Over-watering"],
            "correctAnswer": "Neem Oil",
            "explanation": "Neem oil is a natural biopesticide that repels pests without harming beneficial insects or soil health."
        },
        {
            "id": 3,
            "question": "Why is crop rotation important?",
            "options": ["It looks good", "Breaks pest cycles & improves soil", "Uses more fertilizer", "Requires less labor"],
            "correctAnswer": "Breaks pest cycles & improves soil",
            "explanation": "Rotating crops prevents soil nutrient depletion and disrupts the life cycles of pests and diseases."
        },
        {
            "id": 4,
            "question": "What is the benefit of mulching?",
            "options": ["Increases weeds", "Retains soil moisture", "Cools the air", "Attracts pests"],
            "correctAnswer": "Retains soil moisture",
            "explanation": "Mulching covers the soil, reducing evaporation and suppressing weed growth."
        },
        {
            "id": 5,
            "question": "Which fertilizer is organic?",
            "options": ["Urea", "DAP", "Vermicompost", "Potash"],
            "correctAnswer": "Vermicompost",
            "explanation": "Vermicompost is made from earthworms and organic waste, enriching the soil naturally."
        }
    ];
};

module.exports = { generateQuizQuestions };
