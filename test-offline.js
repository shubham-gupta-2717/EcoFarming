const API_BASE = 'http://localhost:5000/api/offline';

async function testOfflineSync() {
    console.log('Testing Offline Sync APIs...');

    try {
        // Test Pull
        console.log('\n1. Testing /pull...');
        const pullRes = await fetch(`${API_BASE}/pull`);
        const pullData = await pullRes.json();
        if (pullRes.ok && pullData.success && pullData.data.missions) {
            console.log('✅ Offline Data Pulled successfully');
            console.log(`   Missions to cache: ${pullData.data.missions.length}`);
        } else {
            console.error('❌ Failed to pull offline data');
        }

        // Test Push
        console.log('\n2. Testing /push...');
        const pushRes = await fetch(`${API_BASE}/push`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                offlineActions: [{ id: 1, action: "Test Action" }]
            })
        });
        const pushData = await pushRes.json();
        if (pushRes.ok && pushData.success) {
            console.log('✅ Offline Data Pushed successfully');
            console.log(`   Message: ${pushData.message}`);
        } else {
            console.error('❌ Failed to push offline data');
        }

    } catch (error) {
        console.error('❌ Test Failed:', error.message);
    }
}

testOfflineSync();
