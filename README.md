# EcoFarming 🌱

**EcoFarming** is a gamified sustainable farming platform designed for the **Smart India Hackathon 2025**. It motivates farmers to adopt eco-friendly practices through AI-generated missions, rewards, and community engagement.

## 🚀 Features
- **AI-Powered Missions**: Personalized daily farming tasks based on crop, weather, and season
- **Gamification**: Earn EcoPoints, badges, and streaks for completing sustainable actions
- **Leaderboard**: Compete with farmers in your Panchayat
- **Community Feed**: Share progress and achievements
- **Verification System**: NGO/Admin dashboard to verify and approve missions
- **User Profiles**: Track your stats, level, and earned badges
- **Authentication**: Secure login with protected routes
- **Multilingual Ready**: Support for English, Hindi, and Marathi (framework in place)

## 🏗 Architecture
- **Frontend**: React 19, Vite, Tailwind CSS v4
- **Backend**: Node.js, Express
- **Database**: Firebase Firestore (ready to integrate)
- **AI**: Gemini / OpenAI API (with mock fallback)

## 🛠 Setup & Installation

### Prerequisites
- Node.js (v18+)
- npm or yarn

### Quick Start

**Option 1: Interactive Setup (Recommended)**
```bash
# Clone and install
npm install
cd backend && npm install
cd ../frontend && npm install

# Run interactive setup
./setup-env.sh

# Start the application
npm run dev
```

**Option 2: Manual Setup**
```bash
# Install dependencies
npm install
cd backend && npm install
cd ../frontend && npm install

# Configure environment
cp backend/.env.example backend/.env
# Edit backend/.env with your credentials

# Start the application
npm run dev
```

This starts both backend (port 5000) and frontend (port 5173)

### Login
Open [http://localhost:5173](http://localhost:5173) and login with:
- Email: `demo@ecofarming.com`
- Password: `demo123`

### Test Your Setup
```bash
./test-api.sh
```

📚 **Detailed Setup Guides:**
- [Quick Start Guide](QUICK_START.md) - Fast setup instructions
- [API & Authentication Setup](docs/API_SETUP_GUIDE.md) - Complete configuration guide
- [API Architecture](docs/auth-flow.md) - System architecture and flows

## 📱 Pages
- **Dashboard**: Overview of EcoScore, streaks, and daily missions
- **Missions**: Generate and complete farming tasks
- **Community**: Social feed with farmer posts
- **Leaderboard**: Panchayat rankings
- **Verification**: Admin panel for mission approval
- **Profile**: User stats and badges

## 🧪 Testing
```bash
cd backend && npm test
```

## 🚀 Deployment
See [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) for deployment instructions.

## 📄 Documentation
- [Quick Start Guide](QUICK_START.md) - Get started quickly
- [API & Authentication Setup](docs/API_SETUP_GUIDE.md) - Complete API configuration
- [API Architecture](docs/auth-flow.md) - System architecture and flows
- [Deployment Guide](docs/DEPLOYMENT.md) - Production deployment
- [SIH Presentation](docs/SIH_PRESENTATION.md) - Project presentation
- [Complete Walkthrough](walkthrough.md) - Feature walkthrough

## 🤝 Contributing
Built for Smart India Hackathon 2025

## 📧 Support
For questions or issues, please refer to the documentation or create an issue.

