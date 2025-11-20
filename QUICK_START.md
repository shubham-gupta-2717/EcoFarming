# 🚀 Quick Start: API & Authentication Setup

## Option 1: Interactive Setup (Recommended)

Run the automated setup script:

```bash
./setup-env.sh
```

This will guide you through configuring:
- ✅ Backend port
- ✅ JWT secret (auto-generated)
- ✅ Firebase credentials
- ✅ Gemini AI API key

## Option 2: Manual Setup

1. **Copy environment template:**
   ```bash
   cp backend/.env.example backend/.env
   ```

2. **Edit `backend/.env`** with your credentials

3. **Required variables:**
   - `JWT_SECRET` - Generate with: `openssl rand -base64 32`
   - `PORT` - Default: 5000

4. **Optional variables** (app works without these):
   - `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY`
   - `AI_API_KEY`

## Get Your API Keys

### Firebase (Authentication & Database)
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create project → Enable Authentication → Enable Firestore
3. Project Settings → Service Accounts → Generate new private key
4. Copy credentials to `.env`

### Google Gemini AI (Mission Generation)
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create API Key
3. Copy to `AI_API_KEY` in `.env`

## Test Your Setup

```bash
# Install dependencies
npm install
cd backend && npm install

# Start backend
npm run dev

# Test login endpoint
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "demo@ecofarming.com", "password": "demo123"}'
```

## Development Mode

The app works **without any API keys** using mock data:
- ✅ Mock authentication
- ✅ Mock AI missions
- ✅ Mock database

Perfect for development and testing!

## Need Help?

📚 **Full Documentation:** [docs/API_SETUP_GUIDE.md](./docs/API_SETUP_GUIDE.md)

Common issues:
- **"Firebase not initialized"** → Check `.env` file exists and has valid credentials
- **"Port already in use"** → Change `PORT` in `.env` or kill process: `lsof -ti:5000 | xargs kill -9`
- **CORS errors** → Already configured, ensure backend is running

## API Endpoints

All endpoints available at `http://localhost:5000/api/`

**Authentication:**
- `POST /auth/login` - Login
- `POST /auth/register` - Register
- `GET /auth/profile` - Get profile (protected)

**Missions:**
- `POST /missions/generate` - Generate AI mission
- `POST /missions/:id/complete` - Complete mission

**Other:**
- `GET /gamification/leaderboard` - Leaderboard
- `GET /community/feed` - Community posts
- `GET /schemes/recommended` - Government schemes
- `GET /crops/calendar` - Crop calendar

---

**Demo Credentials:**
- Email: `demo@ecofarming.com`
- Password: `demo123`
