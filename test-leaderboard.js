const API_BASE = 'http://localhost:5000/api/gamification/leaderboard';

async function testLeaderboards() {
    console.log('Testing Leaderboard APIs...');

    try {
        // Test Village
        console.log('\n1. Testing /village...');
        const villageRes = await fetch(`${API_BASE}/village`);
        const villageData = await villageRes.json();
        if (villageRes.ok && villageData.leaderboard) {
            console.log('✅ Village Leaderboard fetched successfully');
            console.log(`   Count: ${villageData.leaderboard.length}`);
        } else {
            console.error('❌ Failed to fetch village leaderboard');
        }

        // Test Panchayat
        console.log('\n2. Testing /panchayat...');
        const panchayatRes = await fetch(`${API_BASE}/panchayat`);
        const panchayatData = await panchayatRes.json();
        if (panchayatRes.ok && panchayatData.leaderboard) {
            console.log('✅ Panchayat Leaderboard fetched successfully');
            console.log(`   Count: ${panchayatData.leaderboard.length}`);
        } else {
            console.error('❌ Failed to fetch panchayat leaderboard');
        }

        // Test Global
        console.log('\n3. Testing /global...');
        const globalRes = await fetch(`${API_BASE}/global`);
        const globalData = await globalRes.json();
        if (globalRes.ok && globalData.leaderboard) {
            console.log('✅ Global Leaderboard fetched successfully');
            console.log(`   Count: ${globalData.leaderboard.length}`);
        } else {
            console.error('❌ Failed to fetch global leaderboard');
        }

    } catch (error) {
        console.error('❌ Test Failed:', error.message);
    }
}

testLeaderboards();
