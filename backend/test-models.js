const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config({ path: './.env' });

const apiKey = process.env.AI_API_KEY;

async function listModels() {
    try {
        const genAI = new GoogleGenerativeAI(apiKey);

        // Try to list models
        console.log('Attempting to list available models...\n');

        // Try different model names that might work
        const modelsToTry = [
            'gemini-pro',
            'gemini-1.0-pro',
            'gemini-1.5-pro',
            'gemini-1.5-flash',
            'models/gemini-pro',
            'models/gemini-1.0-pro'
        ];

        for (const modelName of modelsToTry) {
            try {
                const model = genAI.getGenerativeModel({ model: modelName });
                const result = await model.generateContent('Hello');
                console.log(`✅ ${modelName} - WORKS!`);
                break; // Found a working model
            } catch (error) {
                console.log(`❌ ${modelName} - ${error.message.split('\n')[0]}`);
            }
        }
    } catch (error) {
        console.error('Error:', error.message);
    }
}

listModels();
