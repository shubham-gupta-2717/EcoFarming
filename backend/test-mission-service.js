const { generateMissionFromAI } = require('./src/services/missionService');
const dotenv = require('dotenv');
dotenv.config({ path: './backend/.env' });

async function test() {
    try {
        console.log("Testing Existing Mission Service...");
        const result = await generateMissionFromAI({ crop: 'Rice', location: 'India' });
        console.log("Result:", JSON.stringify(result, null, 2));
    } catch (error) {
        console.error("Mission Service Test Failed:", error);
    }
}

test();
