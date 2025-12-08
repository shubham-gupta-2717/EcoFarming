const dotenv = require('dotenv');
const result = dotenv.config({ path: 'backend/.env', debug: true });
if (result.error) {
    console.error('Dotenv Error:', result.error);
} else {
    console.log('Parsed Env:', Object.keys(result.parsed));
    console.log('Private Key Found:', !!result.parsed.FIREBASE_PRIVATE_KEY);
    console.log('Private Key Length:', result.parsed.FIREBASE_PRIVATE_KEY ? result.parsed.FIREBASE_PRIVATE_KEY.length : 0);
}
