const axios = require('axios');
require('dotenv').config({ path: './.env' });

const apiKey = process.env.AI_API_KEY;

async function testModels() {
    const modelsToTest = [
        'models/gemini-1.5-flash',
        'models/gemini-1.5-flash-8b',
        'models/gemini-1.5-pro',
        'models/gemini-pro'
    ];

    console.log('Testing API Key:', apiKey.substring(0, 20) + '...\n');

    for (const model of modelsToTest) {
        try {
            console.log(`Testing ${model}...`);
            const response = await axios.post(
                `https://generativelanguage.googleapis.com/v1/${model}:generateContent?key=${apiKey}`,
                {
                    contents: [{
                        parts: [{ text: 'Hello' }]
                    }]
                }
            );
            console.log(`✅ ${model} - WORKS!`);
            console.log('Response:', response.data.candidates[0].content.parts[0].text);
            break; // Found a working model
        } catch (error) {
            console.log(`❌ ${model} - ${error.response?.data?.error?.message || error.message}`);
        }
    }
}

testModels();
