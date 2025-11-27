const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const { getLeaderboard } = require('../src/services/gamificationService');
const { db } = require('../src/config/firebase');

async function run() {
    console.log('--- Triggering State Leaderboard Error ---');
    try {
        // Use a dummy state value, it doesn't matter if it exists, the index error will happen anyway
        await getLeaderboard('state', 'BIHAR');
        console.log('Success? (Unexpected if index is missing)');
    } catch (error) {
        console.error('Caught Error:', error);
    }

    console.log('--- Triggering District Leaderboard Error ---');
    try {
        await getLeaderboard('district', 'NAWADA');
        console.log('Success? (Unexpected if index is missing)');
    } catch (error) {
        console.error('Caught Error:', error);
    }

    console.log('--- Triggering SubDistrict Leaderboard Error ---');
    try {
        await getLeaderboard('subDistrict', 'Hisua');
        console.log('Success? (Unexpected if index is missing)');
    } catch (error) {
        console.error('Caught Error:', error);
    }

    process.exit(0);
}

run();
