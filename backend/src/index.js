const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
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
const userRoutes = require('./routes/userRoutes');
const weatherRoutes = require('./routes/weatherRoutes');

console.log("Mounting Auth Routes:", authRoutes);
app.use('/api/auth', authRoutes);

app.use('/api/missions', missionRoutes);
app.use('/api/gamification', gamificationRoutes);
app.use('/api/community', communityRoutes);
app.use('/api/verification', verificationRoutes);
app.use('/api/crop', cropRoutes);
app.use('/api/schemes', schemesRoutes);
app.use('/api/learning', learningRoutes);
app.use('/api/behavior', behaviorRoutes);
app.use('/api/offline', offlineRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/institutions', institutionRoutes);
app.use('/api/user', userRoutes);
app.use('/api/weather', weatherRoutes);

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
