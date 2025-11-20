# EcoFarming Deployment Guide 🚀

## 1. Backend Deployment (Render)

1.  **Create a Render Account**: Go to [render.com](https://render.com).
2.  **New Web Service**: Connect your GitHub repository.
3.  **Settings**:
    *   **Root Directory**: `backend`
    *   **Build Command**: `npm install`
    *   **Start Command**: `node src/index.js`
4.  **Environment Variables**:
    *   Add all variables from `backend/.env.example`.
    *   For `FIREBASE_PRIVATE_KEY`, ensure you copy the entire key including `-----BEGIN...` and `...END-----`.
5.  **Deploy**: Click "Create Web Service".

## 2. Frontend Deployment (Vercel)

1.  **Create a Vercel Account**: Go to [vercel.com](https://vercel.com).
2.  **New Project**: Import your GitHub repository.
3.  **Settings**:
    *   **Root Directory**: `frontend`
    *   **Framework Preset**: Vite
    *   **Build Command**: `npm run build`
    *   **Output Directory**: `dist`
4.  **Environment Variables**:
    *   Add all variables from `frontend/.env.example`.
    *   Set `VITE_API_BASE_URL` to your Render Backend URL (e.g., `https://ecofarming-backend.onrender.com/api`).
5.  **Deploy**: Click "Deploy".

## 3. Firebase Setup

1.  Go to [console.firebase.google.com](https://console.firebase.google.com).
2.  Create a new project "EcoFarming".
3.  **Firestore**: Create Database (Start in Test Mode).
4.  **Authentication**: Enable Email/Password and Google Auth.
5.  **Storage**: Enable Storage.
6.  **Service Account**:
    *   Project Settings -> Service Accounts -> Generate New Private Key.
    *   Use this for `FIREBASE_PRIVATE_KEY` in Backend.
