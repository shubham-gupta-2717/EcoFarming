const API_URL = 'http://localhost:5000/api/missions/daily';

async function testDailyMission() {
    console.log('Testing Daily Mission Endpoint...');

    try {
        const res = await fetch(API_URL, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
        });

        const data = await res.json();

        console.log('Status:', res.status);
        console.log('Response:', JSON.stringify(data, null, 2));

        if (data.success && data.mission) {
            console.log('✅ Daily Mission Fetched Successfully');
        } else {
            console.error('❌ Daily Mission Fetch Failed');
        }

    } catch (error) {
        console.error('❌ Test Failed:', error.message);
    }
}

testDailyMission();
