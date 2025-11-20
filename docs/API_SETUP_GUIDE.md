# API & Authentication Setup Guide 🔐

This comprehensive guide will help you set up all APIs and authentication for the EcoFarming platform.

## Table of Contents
1. [Environment Variables Setup](#environment-variables-setup)
2. [Firebase Authentication & Database](#firebase-authentication--database)
3. [Google Gemini AI API](#google-gemini-ai-api)
4. [JWT Authentication](#jwt-authentication)
5. [Testing the Setup](#testing-the-setup)
6. [Troubleshooting](#troubleshooting)

---

## Environment Variables Setup

### Step 1: Create Environment Files

Create `.env` files in both backend and frontend directories:

```bash
# From project root
cp backend/.env.example backend/.env
```

### Step 2: Configure Backend Environment

Edit `backend/.env` with your actual credentials:

```env
PORT=5000
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=your-client-email@your-project-id.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_ACTUAL_PRIVATE_KEY_HERE\n-----END PRIVATE KEY-----\n"
AI_API_KEY=your-gemini-api-key
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
```

> [!IMPORTANT]
> Never commit `.env` files to version control. They are already in `.gitignore`.

---

## Firebase Authentication & Database

Firebase provides authentication and Firestore database for the EcoFarming platform.

### Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **"Add project"**
3. Enter project name: `ecofarming` (or your preferred name)
4. Disable Google Analytics (optional for development)
5. Click **"Create project"**

### Step 2: Enable Authentication

1. In Firebase Console, go to **Build → Authentication**
2. Click **"Get started"**
3. Enable **Email/Password** sign-in method:
   - Click on "Email/Password"
   - Toggle "Enable"
   - Click "Save"

### Step 3: Create Firestore Database

1. Go to **Build → Firestore Database**
2. Click **"Create database"**
3. Choose **"Start in test mode"** (for development)
4. Select your preferred location (e.g., `asia-south1` for India)
5. Click **"Enable"**

> [!WARNING]
> Test mode allows unrestricted access. For production, configure proper security rules.

### Step 4: Generate Service Account Key

1. Go to **Project Settings** (gear icon) → **Service accounts**
2. Click **"Generate new private key"**
3. Click **"Generate key"** - a JSON file will download
4. Open the downloaded JSON file and extract:
   - `project_id` → `FIREBASE_PROJECT_ID`
   - `client_email` → `FIREBASE_CLIENT_EMAIL`
   - `private_key` → `FIREBASE_PRIVATE_KEY`

### Step 5: Update Backend .env

```env
FIREBASE_PROJECT_ID=ecofarming-12345
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@ecofarming-12345.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQE...\n-----END PRIVATE KEY-----\n"
```

> [!TIP]
> The private key must include `\n` for line breaks. Keep the quotes around it.

### Step 6: Configure Firestore Collections

The app uses these collections:
- `users` - User profiles and stats
- `missions` - Generated missions
- `posts` - Community feed posts
- `verifications` - Mission verification requests

These will be created automatically when data is first written.

---

## Google Gemini AI API

Gemini AI generates personalized farming missions based on crop, location, and season.

### Step 1: Get Gemini API Key

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click **"Create API Key"**
4. Select **"Create API key in new project"** or choose existing project
5. Copy the generated API key

### Step 2: Update Backend .env

```env
AI_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

### Step 3: Test AI Integration

The mission service (`backend/src/services/missionService.js`) automatically:
- Uses Gemini AI if `AI_API_KEY` is configured
- Falls back to mock data if API key is missing or invalid

**Test endpoint:**
```bash
curl http://localhost:5000/api/missions/generate \
  -H "Content-Type: application/json" \
  -d '{"crop": "wheat", "location": "Punjab", "season": "Rabi"}'
```

> [!NOTE]
> Mock missions work without an API key, perfect for development and testing.

---

## JWT Authentication

JWT (JSON Web Tokens) secure API endpoints and manage user sessions.

### Step 1: Generate JWT Secret

Generate a strong secret key:

```bash
# On Mac/Linux
openssl rand -base64 32

# Or use Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### Step 2: Update Backend .env

```env
JWT_SECRET=your-generated-secret-key-here
```

> [!CAUTION]
> Use a strong, unique secret for production. Never use the example value.

### Step 3: Understanding Authentication Flow

#### For Development (Mock Auth)
```javascript
// Login with demo credentials
POST /api/auth/login
{
  "email": "demo@ecofarming.com",
  "password": "demo123"
}

// Response
{
  "token": "mock-jwt-token-123",
  "user": {
    "uid": "demo-user-1",
    "email": "demo@ecofarming.com",
    "name": "Demo Farmer",
    "role": "farmer"
  }
}
```

#### For Production (Firebase Auth)
1. **Client-side**: User signs in with Firebase Client SDK
2. **Client receives**: Firebase ID token
3. **Client sends**: Token in `Authorization: Bearer <token>` header
4. **Backend verifies**: Token using Firebase Admin SDK
5. **Backend grants**: Access to protected routes

### Step 4: Protected Routes

All routes except `/api/auth/login` and `/api/auth/register` require authentication:

```javascript
// Example: Get user profile
GET /api/auth/profile
Authorization: Bearer <your-token>
```

The `authMiddleware` automatically:
- Extracts token from `Authorization` header
- Verifies token with Firebase (or uses mock in development)
- Attaches user data to `req.user`
- Rejects invalid/missing tokens with 401/403

---

## Testing the Setup

### Step 1: Start the Backend

```bash
cd backend
npm run dev
```

Expected output:
```
Firebase Admin Initialized
Server running on port 5000
```

> [!WARNING]
> If you see "FIREBASE_PRIVATE_KEY not found", Firebase features won't work. Mock auth will be used instead.

### Step 2: Test Authentication

**Login:**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "demo@ecofarming.com", "password": "demo123"}'
```

**Expected response:**
```json
{
  "token": "mock-jwt-token-123",
  "user": {
    "uid": "demo-user-1",
    "email": "demo@ecofarming.com",
    "name": "Demo Farmer",
    "role": "farmer"
  }
}
```

### Step 3: Test Protected Endpoint

```bash
curl http://localhost:5000/api/auth/profile \
  -H "Authorization: Bearer mock-jwt-token-123"
```

### Step 4: Test AI Mission Generation

```bash
curl http://localhost:5000/api/missions/generate \
  -H "Content-Type: application/json" \
  -d '{"crop": "rice", "location": "Kerala", "season": "Kharif", "landSize": "3 acres"}'
```

### Step 5: Test Government Schemes API

```bash
curl "http://localhost:5000/api/schemes/recommended?crop=wheat&location=Punjab&landSize=5"
```

### Step 6: Test Crop Calendar API

```bash
curl "http://localhost:5000/api/crops/calendar?crop=wheat"
```

---

## Troubleshooting

### Issue: "Firebase not initialized"

**Cause:** Missing or invalid Firebase credentials

**Solution:**
1. Verify `.env` file exists in `backend/` directory
2. Check `FIREBASE_PRIVATE_KEY` includes `\n` for line breaks
3. Ensure no extra spaces in environment variables
4. Restart the server after changing `.env`

### Issue: "AI Generation Error"

**Cause:** Invalid Gemini API key or quota exceeded

**Solution:**
1. Verify API key at [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Check API quota limits
3. App automatically falls back to mock missions

### Issue: "Invalid token" on protected routes

**Cause:** Token expired or malformed

**Solution:**
1. Login again to get a fresh token
2. Ensure token is sent in `Authorization: Bearer <token>` format
3. Check JWT_SECRET matches between token generation and verification

### Issue: CORS errors from frontend

**Cause:** Backend not allowing frontend origin

**Solution:**
Backend already configured with CORS. Ensure:
```javascript
// backend/src/index.js
app.use(cors()); // Already present
```

### Issue: Port 5000 already in use

**Solution:**
```bash
# Find and kill process using port 5000
lsof -ti:5000 | xargs kill -9

# Or change port in backend/.env
PORT=5001
```

---

## API Endpoints Reference

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/auth/profile` - Get user profile (protected)

### Missions
- `POST /api/missions/generate` - Generate AI mission
- `GET /api/missions/:id` - Get mission details
- `POST /api/missions/:id/complete` - Mark mission complete

### Gamification
- `GET /api/gamification/leaderboard` - Get leaderboard
- `GET /api/gamification/badges` - Get user badges
- `POST /api/gamification/claim-reward` - Claim reward

### Community
- `GET /api/community/feed` - Get community posts
- `POST /api/community/post` - Create new post

### Verification (Admin/NGO)
- `GET /api/verification/pending` - Get pending verifications
- `POST /api/verification/:id/approve` - Approve mission
- `POST /api/verification/:id/reject` - Reject mission

### Government Schemes
- `GET /api/schemes/recommended` - Get recommended schemes

### Crop Calendar
- `GET /api/crops/calendar` - Get crop calendar

---

## Production Deployment Checklist

- [ ] Use strong, unique `JWT_SECRET`
- [ ] Configure Firebase security rules
- [ ] Set up Firebase Authentication on client
- [ ] Enable HTTPS for all API calls
- [ ] Set `NODE_ENV=production`
- [ ] Configure rate limiting
- [ ] Set up monitoring and logging
- [ ] Secure environment variables (use secrets manager)
- [ ] Enable Firebase App Check
- [ ] Configure CORS for specific origins only

---

## Additional Resources

- [Firebase Admin SDK Documentation](https://firebase.google.com/docs/admin/setup)
- [Google Gemini AI Documentation](https://ai.google.dev/docs)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)
- [Express.js Security Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)

---

## Quick Reference: Environment Variables

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `PORT` | No | Backend server port | `5000` |
| `FIREBASE_PROJECT_ID` | Yes* | Firebase project ID | `ecofarming-12345` |
| `FIREBASE_CLIENT_EMAIL` | Yes* | Service account email | `firebase-adminsdk-xxx@...` |
| `FIREBASE_PRIVATE_KEY` | Yes* | Service account private key | `-----BEGIN PRIVATE KEY-----...` |
| `AI_API_KEY` | No | Gemini API key | `AIzaSy...` |
| `JWT_SECRET` | Yes | JWT signing secret | `random-32-byte-string` |

*Required for production. Development works with mock data if missing.

---

## Need Help?

If you encounter issues not covered here:
1. Check the [main README](../README.md)
2. Review [DEPLOYMENT.md](./DEPLOYMENT.md)
3. Check backend logs for detailed error messages
4. Verify all environment variables are set correctly
