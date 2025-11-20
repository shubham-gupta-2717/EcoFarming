const request = require('supertest');
const express = require('express');

// Mock app for testing
const app = express();
app.use(express.json());

// Import routes
const missionRoutes = require('../src/routes/missionRoutes');
app.use('/api/missions', missionRoutes);

describe('Mission API Tests', () => {
    test('POST /api/missions/generate should return a mission', async () => {
        const response = await request(app)
            .post('/api/missions/generate')
            .send({
                crop: 'Wheat',
                location: 'Punjab',
                season: 'Rabi'
            });

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.mission).toBeDefined();
        expect(response.body.mission.task).toBeDefined();
    });

    test('GET /api/missions/daily should return a mission', async () => {
        const response = await request(app).get('/api/missions/daily');

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
    });
});

describe('Auth API Tests', () => {
    test('POST /api/auth/login with valid credentials should succeed', async () => {
        const authRoutes = require('../src/routes/authRoutes');
        const authApp = express();
        authApp.use(express.json());
        authApp.use('/api/auth', authRoutes);

        const response = await request(authApp)
            .post('/api/auth/login')
            .send({
                email: 'demo@ecofarming.com',
                password: 'demo123'
            });

        expect(response.status).toBe(200);
        expect(response.body.token).toBeDefined();
        expect(response.body.user).toBeDefined();
    });
});
