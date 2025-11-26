const { generateQuizQuestions } = require('./src/services/geminiService');
const dotenv = require('dotenv');
dotenv.config({ path: './backend/.env' });

async function test() {
    try {
        console.log("Testing Quiz Generation with Visual Search Terms...");
        // Test Case: Tomato in Loamy Soil
        const questions = await generateQuizQuestions('Tomato', 'Loamy Soil', 'Maharashtra, India');
        console.log("Generated Questions:", JSON.stringify(questions, null, 2));

        // Validation
        if (questions && questions.length > 0 && questions[0].visual_search_term) {
            console.log("✅ Visual Search Term present:", questions[0].visual_search_term);
        } else {
            console.error("❌ Visual Search Term MISSING or API Failed");
        }
    } catch (error) {
        console.error("Test Failed:", error);
    }
}

test();
