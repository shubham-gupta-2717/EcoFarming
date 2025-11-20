const axios = require('axios');

const API_BASE = 'http://localhost:5000/api';
let authToken = '';

async function runCheck() {
    console.log('🚀 Starting EcoFarming Project Dry Run Check...\n');

    try {
        // 1. Health Check
        console.log('1️⃣  Checking Server Health...');
        try {
            const res = await axios.get('http://localhost:5000/');
            console.log(`   ✅ Server is running: "${res.data}"`);
        } catch (e) {
            console.error('   ❌ Server is NOT running or unreachable.');
            process.exit(1);
        }

        // 2. Authentication (Register & Login)
        console.log('\n2️⃣  Checking Authentication...');
        const testUser = {
            name: "DryRun User",
            email: `dryrun_${Date.now()}@example.com`,
            password: "password123",
            role: "farmer"
        };

        // Register
        try {
            await axios.post(`${API_BASE}/auth/register`, testUser);
            console.log('   ✅ Registration successful');
        } catch (e) {
            console.error('   ❌ Registration failed:', e.response?.data || e.message);
        }

        // Login
        try {
            const loginRes = await axios.post(`${API_BASE}/auth/login`, {
                email: testUser.email,
                password: testUser.password
            });
            authToken = loginRes.data.token;
            console.log('   ✅ Login successful');
        } catch (e) {
            console.error('   ❌ Login failed:', e.response?.data || e.message);
            process.exit(1); // Cannot proceed without token
        }

        const authHeaders = { headers: { Authorization: `Bearer ${authToken}` } };

        // 3. Missions
        console.log('\n3️⃣  Checking Missions...');
        try {
            const missionRes = await axios.post(`${API_BASE}/missions/generate`, {
                farmerData: { location: "Test Village", crop: "Wheat" }
            }, authHeaders);
            if (missionRes.data.mission) {
                console.log('   ✅ Mission Generation successful');
            } else {
                console.error('   ⚠️  Mission Generation returned no mission');
            }
        } catch (e) {
            console.error('   ❌ Mission Generation failed:', e.response?.data || e.message);
        }

        // 4. Gamification (Leaderboards)
        console.log('\n4️⃣  Checking Leaderboards...');
        try {
            await axios.get(`${API_BASE}/gamification/leaderboard/village`, authHeaders);
            console.log('   ✅ Village Leaderboard accessible');
            await axios.get(`${API_BASE}/gamification/leaderboard/global`, authHeaders);
            console.log('   ✅ Global Leaderboard accessible');
        } catch (e) {
            console.error('   ❌ Leaderboard check failed:', e.response?.data || e.message);
        }

        // 5. Learning Module
        console.log('\n5️⃣  Checking Learning Module...');
        try {
            const snippetRes = await axios.get(`${API_BASE}/learning/snippets`, authHeaders);
            console.log(`   ✅ Fetched ${snippetRes.data.snippets.length} learning snippets`);
        } catch (e) {
            console.error('   ❌ Learning module check failed:', e.response?.data || e.message);
        }

        // 6. Behavior Tracking
        console.log('\n6️⃣  Checking Behavior Tracking...');
        try {
            const reportRes = await axios.get(`${API_BASE}/behavior/report`, authHeaders);
            if (reportRes.data.success) {
                console.log('   ✅ Behavior Report accessible');
            }
        } catch (e) {
            console.error('   ❌ Behavior tracking check failed:', e.response?.data || e.message);
        }

        // 7. Offline Sync
        console.log('\n7️⃣  Checking Offline Sync...');
        try {
            const pullRes = await axios.get(`${API_BASE}/offline/pull`, authHeaders);
            if (pullRes.data.success) {
                console.log('   ✅ Offline Pull successful');
            }
        } catch (e) {
            console.error('   ❌ Offline sync check failed:', e.response?.data || e.message);
        }

        console.log('\n✅ Dry Run Check Completed!');

    } catch (error) {
        console.error('\n❌ Unexpected Error during Dry Run:', error.message);
    }
}

runCheck();
