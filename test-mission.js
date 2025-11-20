const API_URL = 'http://localhost:5000/api/missions/generate';

async function testMissionGeneration() {
    console.log('Testing Mission Generation...');

    try {
        const farmerData = {
            crop: 'Wheat',
            location: 'Punjab',
            season: 'Rabi',
            landSize: '5 acres'
        };

        const res = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(farmerData)
        });

        const data = await res.json();

        console.log('Status:', res.status);
        console.log('Response:', JSON.stringify(data, null, 2));

        if (data.success && data.mission) {
            console.log('✅ Mission Generated Successfully');
        } else {
            console.error('❌ Mission Generation Failed');
        }

    } catch (error) {
        console.error('❌ Test Failed:', error.message);
    }
}

testMissionGeneration();
