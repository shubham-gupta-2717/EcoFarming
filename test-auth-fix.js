const API_URL = 'http://localhost:5000/api/auth';

async function testAuth() {
    const testUser = {
        name: 'Test User',
        email: `test${Date.now()}@example.com`,
        password: 'password123',
        location: 'Test City',
        crop: 'Wheat'
    };

    console.log('Starting Authentication Tests...');

    try {
        // Helper for requests
        const post = async (endpoint, data) => {
            const res = await fetch(`${API_URL}${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            const json = await res.json();
            return { status: res.status, data: json };
        };

        // Test 1: Register
        console.log('\n1. Testing Registration...');
        const registerRes = await post('/register', testUser);

        if (registerRes.status === 200 && registerRes.data.user.email === testUser.email) {
            console.log('✅ Registration Successful');
        } else {
            console.error('❌ Registration Failed', registerRes.data);
            return;
        }

        // Test 2: Login with new user
        console.log('\n2. Testing Login with new user...');
        const loginRes = await post('/login', {
            email: testUser.email,
            password: testUser.password
        });

        if (loginRes.status === 200 && loginRes.data.token) {
            console.log('✅ Login Successful');
        } else {
            console.error('❌ Login Failed', loginRes.data);
        }

        // Test 3: Login with demo user
        console.log('\n3. Testing Login with demo user...');
        const demoLoginRes = await post('/login', {
            email: 'demo@ecofarming.com',
            password: 'demo123'
        });

        if (demoLoginRes.status === 200 && demoLoginRes.data.token) {
            console.log('✅ Demo Login Successful');
        } else {
            console.error('❌ Demo Login Failed', demoLoginRes.data);
        }

        // Test 4: Invalid credentials
        console.log('\n4. Testing Invalid Credentials...');
        const invalidRes = await post('/login', {
            email: testUser.email,
            password: 'wrongpassword'
        });

        if (invalidRes.status === 401) {
            console.log('✅ Invalid Credentials Handled Correctly');
        } else {
            console.error('❌ Unexpected Status for Invalid Credentials:', invalidRes.status);
        }

        // Test 5: Duplicate Email
        console.log('\n5. Testing Duplicate Email...');
        const duplicateRes = await post('/register', testUser);

        if (duplicateRes.status === 400) {
            console.log('✅ Duplicate Email Handled Correctly');
        } else {
            console.error('❌ Unexpected Status for Duplicate Email:', duplicateRes.status);
        }

    } catch (error) {
        console.error('❌ Test Failed:', error.message);
    }
}

testAuth();
