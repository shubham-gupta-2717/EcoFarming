const axios = require('axios');
const dotenv = require('dotenv');
dotenv.config({ path: './backend/.env' });

async function test() {
    const apiKey = process.env.AI_API_KEY;
    try {
        console.log("Testing Gemini 1.5 Flash...");
        const prompt = "Generate 3 quiz questions about Wheat farming.";

        const response = await axios.post(
            `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
            {
                contents: [{
                    parts: [{ text: prompt }]
                }]
            }
        );

        console.log("Success!");
        console.log(response.data.candidates[0].content.parts[0].text);
    } catch (error) {
        console.error("Test Failed:", error.response?.data || error.message);
    }
}

test();
