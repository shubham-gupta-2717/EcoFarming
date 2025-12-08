const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');
const path = require('path');

const API_URL = 'http://localhost:5000/api';

// Admin Credentials (seeded in authController.js)
const adminCreds = {
    email: 'admin@ecofarming.com',
    password: 'admin123'
};

const cropData = {
    cropName: 'Wheat',
    sowingDate: '2023-10-01',
    area: 5,
    startingStage: 1
};

async function runTest() {
    try {
        console.log('🚀 Starting Pipeline Verification Test (via Admin Flow)...');

        // 1. Login as Admin
        console.log('\n1. Logging in as Admin...');
        let token;
        try {
            const loginRes = await axios.post(`${API_URL}/auth/admin/login`, adminCreds);
            token = loginRes.data.token;
            console.log('✅ Admin logged in. UID:', loginRes.data.user.uid);
        } catch (e) {
            console.error('Login Failed:', e.response ? e.response.data : e.message);
            throw e;
        }

        const headers = { Authorization: `Bearer ${token}` };

        // 2. Add Crop with Stage 1
        console.log('\n2. Adding Crop (Wheat, Stage 1)...');

        // Try to add. If it exists, we might get 400. Ideally we should wipe it first but DELETE crop route might not exist or be needed.
        // Let's try to Add. If 400 (exists), we assume it's there.
        // Actually, if it exists, we might want to update it to Stage 1 to reset the test state.

        try {
            await axios.post(`${API_URL}/user/crops`, cropData, { headers });
            console.log('✅ Crop added');
        } catch (e) {
            if (e.response && e.response.data.message === 'Crop already exists') {
                console.log('ℹ️ Crop exists. Updating to reset specific fields via update endpoint if possible, or just proceeding...');
                // If crop exists, we should try to reset its stage to 1 via some way? 
                // We don't have a direct "set stage" endpoint for users.
                // But we can just work with whatever stage it is if we read it first.
                // However, for clean verification, let's try to DELETE it first.
                try {
                    await axios.delete(`${API_URL}/user/crops/Wheat`, { headers });
                    console.log('🗑️ Old crop deleted. Re-adding...');
                    await axios.post(`${API_URL}/user/crops`, cropData, { headers });
                    console.log('✅ Crop added fresh');
                } catch (delErr) {
                    console.warn('⚠️ Could not delete/re-add crop:', delErr.message);
                }
            } else {
                throw e;
            }
        }

        // 3. Generate Mission (Should be Stage 1)
        console.log('\n3. Generating Mission...');
        const missionRes = await axios.post(`${API_URL}/missions/generateForCrop`, {
            selectedCrop: 'Wheat',
            useIpFallback: true
        }, { headers });

        const mission = missionRes.data.mission;
        console.log('✅ Mission Generated:', mission.title);
        console.log('   Stage:', mission.cropStage);
        console.log('   Mission ID:', mission.missionId);

        if (!mission.cropStage.includes('Stage 1')) {
            console.warn('⚠️ WARNING: Expected Stage 1, got:', mission.cropStage);
        }

        // 4. Submit Proof
        console.log('\n4. Submitting Proof for Mission:', mission.missionId);

        // Create dummy image (Valid 1x1 PNG)
        const dummyImagePath = path.join(__dirname, 'test_proof.png');
        const pngBuffer = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==', 'base64');
        fs.writeFileSync(dummyImagePath, pngBuffer);

        const formData = new FormData();
        formData.append('image', fs.createReadStream(dummyImagePath));
        formData.append('notes', 'Verifying pipeline flow');

        const submitRes = await axios.post(`${API_URL}/missions/${mission.missionId}/submit`, formData, {
            headers: {
                ...headers,
                ...formData.getHeaders()
            }
        });
        console.log('✅ Proof Submitted:', submitRes.data.message);

        // 5. Approve Mission (Admin)
        console.log('\n5. Approving Mission (Manually)...');
        const approveRes = await axios.post(`${API_URL}/missions/${mission.missionId}/approve-manual`, {
            reason: 'Automated Test Verification'
        }, { headers });
        console.log('✅ Mission Approved:', approveRes.data.message);

        // 6. Check User Profile for Stage Increment
        console.log('\n6. Verifying Stage Increment...');
        const profileRes = await axios.get(`${API_URL}/user/crops`, { headers });
        const wheat = profileRes.data.crops.find(c => c.cropName === 'Wheat');

        console.log('   Current Stage:', wheat.currentStage);

        if (wheat.currentStage === 2) {
            console.log('🎉 SUCCESS: Stage incremented to 2!');
        } else {
            // It might be possible that local latency or concurrent update didn't reflect yet? 
            // Or logic issue.
            console.error('❌ FAILURE: Stage did not increment. Current:', wheat.currentStage);
            process.exit(1);
        }

        console.log('\n✅ Verification Test Passed!');

        // Cleanup
        if (fs.existsSync(dummyImagePath)) fs.unlinkSync(dummyImagePath);

    } catch (error) {
        console.error('❌ Test Failed:', error.response ? error.response.data : error.message);
        process.exit(1);
    }
}

runTest();
