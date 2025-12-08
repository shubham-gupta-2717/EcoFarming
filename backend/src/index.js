const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

const path = require('path');
const dotenvResult = dotenv.config({ path: path.join(__dirname, '../.env') });
if (dotenvResult.error) {
    console.error('Dotenv Error:', dotenvResult.error);
} else {
    console.log('Dotenv Loaded:', Object.keys(dotenvResult.parsed).length, 'variables');
}

const app = express();
console.log('Env PORT:', process.env.PORT);
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
    const fs = require('fs');
    const path = require('path');
    const logPath = path.join(__dirname, '../logs/requests.log');
    try {
        if (!fs.existsSync(path.dirname(logPath))) fs.mkdirSync(path.dirname(logPath), { recursive: true });
        fs.appendFileSync(logPath, `${new Date().toISOString()} - ${req.method} ${req.url}\n`);
    } catch (e) { console.error(e); }
    console.log(`[DEBUG] Incoming request: ${req.method} ${req.url}`);
    next();
});

app.get('/api/test-direct', (req, res) => {
    res.send('Direct Route Working');
});

// Routes
// Routes
const missionRoutes = require('./routes/missionRoutes');
const authRoutes = require('./routes/authRoutes');
const gamificationRoutes = require('./routes/gamificationRoutes');
const communityRoutes = require('./routes/communityRoutes');
const verificationRoutes = require('./routes/verificationRoutes');
const cropRoutes = require('./routes/cropRoutes');
const schemesRoutes = require('./routes/schemesRoutes');
const learningRoutes = require('./routes/learningRoutes');
const behaviorRoutes = require('./routes/behaviorRoutes');
const offlineRoutes = require('./routes/offlineRoutes');
const adminRoutes = require('./routes/adminRoutes');
const institutionRoutes = require('./routes/institutionRoutes');
const instituteMissionRoutes = require('./routes/instituteMissionRoutes');
const userRoutes = require('./routes/userRoutes');
const weatherRoutes = require('./routes/weatherRoutes');
const quizRoutes = require('./routes/quizRoutes');
const locationRoutes = require('./routes/locationRoutes');
const ticketRoutes = require('./routes/ticketRoutes'); // NEW
const disasterRoutes = require('./routes/disasterRoutes'); // NEW

console.log("Mounting Auth Routes:", authRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/missions', missionRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/institutions', institutionRoutes);
app.use('/api/gamification', gamificationRoutes);
app.use('/api/locations', locationRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/disaster', disasterRoutes); // NEW
app.use('/api/community', communityRoutes); // NEW: Fix missing mount
app.use('/api/verification', verificationRoutes); // Keeping this line as it was not explicitly removed by the instruction's snippet
app.use('/api/crop', cropRoutes);
app.use('/api/schemes', schemesRoutes);
app.use('/api/learning', learningRoutes);
app.use('/api/behavior', behaviorRoutes);
app.use('/api/offline', offlineRoutes);
app.use('/api/institutions', institutionRoutes);
app.use('/api/institute', instituteMissionRoutes);
app.use('/api/user', userRoutes);
app.use('/api/weather', weatherRoutes);
app.use('/api/quiz', quizRoutes);
app.use('/api/locations', locationRoutes);

app.get('/', (req, res) => {
    res.send('EcoFarming Backend is running! 🌱');
});

// Error Handling
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Something went wrong!', error: err.message });
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
});
