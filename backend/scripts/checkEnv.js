const dotenv = require('dotenv');
const path = require('path');

// Load environment variables exactly like index.js
const envPath = path.join(__dirname, '../.env');
const result = dotenv.config({ path: envPath });

if (result.error) {
    console.error("❌ Error loading .env file:", result.error.message);
} else {
    console.log("✅ .env loaded successfully from:", envPath);
}

const apiKey = process.env.AI_API_KEY;

console.log("\n--- API Key Diagnostics ---");
if (!apiKey) {
    console.log("❌ AI_API_KEY is INVALID (Undefined or Null)");
} else if (apiKey === 'your-gemini-or-openai-key') {
    console.log("⚠️ AI_API_KEY is the DEFAULT PLACEHOLDER (Update .env!)");
} else {
    console.log("✅ AI_API_KEY is DEFINED");
    console.log(`ℹ️  Key Length: ${apiKey.length}`);
    console.log(`ℹ️  First 4 chars: ${apiKey.substring(0, 4)}...`);
}
console.log("---------------------------\n");
