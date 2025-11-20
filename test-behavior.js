const API_BASE = 'http://localhost:5000/api/behavior';

async function testBehavior() {
    console.log('Testing Behavior Tracking APIs...');

    try {
        // Test Report
        console.log('\n1. Testing /report...');
        const reportRes = await fetch(`${API_BASE}/report`);
        const reportData = await reportRes.json();
        if (reportRes.ok && reportData.success && reportData.report) {
            console.log('✅ Behavior Report fetched successfully');
            console.log(`   Water Saved: ${reportData.report.totalWaterSaved}`);
        } else {
            console.error('❌ Failed to fetch behavior report');
        }

        // Test Timeline
        console.log('\n2. Testing /timeline...');
        const timelineRes = await fetch(`${API_BASE}/timeline`);
        const timelineData = await timelineRes.json();
        if (timelineRes.ok && timelineData.success && timelineData.timeline.length > 0) {
            console.log('✅ Behavior Timeline fetched successfully');
            console.log(`   Count: ${timelineData.timeline.length}`);
        } else {
            console.error('❌ Failed to fetch behavior timeline');
        }

    } catch (error) {
        console.error('❌ Test Failed:', error.message);
    }
}

testBehavior();
