# API Architecture Overview

## System Architecture

```mermaid
graph LR
    subgraph "Frontend (React + Vite)"
        UI[User Interface]
        Auth[Auth Context]
        API[API Client]
    end
    
    subgraph "Backend (Express.js)"
        Routes[API Routes]
        Middleware[Auth Middleware]
        Controllers[Controllers]
        Services[Services]
    end
    
    subgraph "External APIs"
        Firebase[(Firebase)]
        Gemini[Gemini AI]
    end
    
    UI --> Auth
    Auth --> API
    API -->|HTTP/JSON| Routes
    Routes --> Middleware
    Middleware --> Controllers
    Controllers --> Services
    Services --> Firebase
    Services --> Gemini
    
    style UI fill:#e1f5ff
    style Routes fill:#fff4e1
    style Services fill:#e1ffe1
    style Firebase fill:#ffe1e1
    style Gemini fill:#f0e1ff
```

## Authentication Flow

```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant Backend
    participant Firebase
    
    User->>Frontend: Enter credentials
    Frontend->>Backend: POST /api/auth/login
    
    alt Firebase Configured
        Backend->>Firebase: Verify credentials
        Firebase-->>Backend: User data + token
    else Mock Mode
        Backend->>Backend: Check demo credentials
        Backend-->>Backend: Generate mock token
    end
    
    Backend-->>Frontend: JWT token + user data
    Frontend->>Frontend: Store token in localStorage
    
    Note over Frontend,Backend: Subsequent requests
    
    Frontend->>Backend: API request + Bearer token
    Backend->>Backend: Verify token (authMiddleware)
    
    alt Valid Token
        Backend->>Backend: Process request
        Backend-->>Frontend: Response data
    else Invalid Token
        Backend-->>Frontend: 401 Unauthorized
        Frontend->>Frontend: Redirect to login
    end
```

## API Endpoints Structure

### Authentication Endpoints
- **POST** `/api/auth/login` - User login
- **POST** `/api/auth/register` - User registration  
- **GET** `/api/auth/profile` - Get user profile (🔒 Protected)

### Mission Endpoints
- **POST** `/api/missions/generate` - Generate AI-powered mission
- **GET** `/api/missions/:id` - Get mission details
- **POST** `/api/missions/:id/complete` - Mark mission as complete (🔒 Protected)

### Gamification Endpoints
- **GET** `/api/gamification/leaderboard` - Get panchayat leaderboard
- **GET** `/api/gamification/badges` - Get user badges (🔒 Protected)
- **POST** `/api/gamification/claim-reward` - Claim reward (🔒 Protected)

### Community Endpoints
- **GET** `/api/community/feed` - Get community posts
- **POST** `/api/community/post` - Create new post (🔒 Protected)

### Verification Endpoints (Admin/NGO)
- **GET** `/api/verification/pending` - Get pending verifications (🔒 Protected)
- **POST** `/api/verification/:id/approve` - Approve mission (🔒 Protected)
- **POST** `/api/verification/:id/reject` - Reject mission (🔒 Protected)

### Government Schemes Endpoints
- **GET** `/api/schemes/recommended` - Get recommended schemes based on crop/location

### Crop Calendar Endpoints
- **GET** `/api/crops/calendar` - Get crop-specific calendar

🔒 = Requires authentication token

## Data Flow: Mission Generation

```mermaid
flowchart TD
    A[User clicks Generate Mission] --> B[Frontend sends request]
    B --> C{AI API Key configured?}
    
    C -->|Yes| D[Call Gemini AI]
    C -->|No| E[Use Mock Mission]
    
    D --> F[Generate personalized mission]
    F --> G{Valid response?}
    
    G -->|Yes| H[Parse JSON response]
    G -->|No| E
    
    H --> I[Return mission to user]
    E --> I
    
    I --> J[Display mission in UI]
    J --> K[User completes mission]
    K --> L[Submit for verification]
    L --> M[NGO/Admin approves]
    M --> N[Award EcoPoints & Badges]
    
    style A fill:#e1f5ff
    style D fill:#f0e1ff
    style E fill:#ffe1e1
    style N fill:#e1ffe1
```

## Environment Configuration

### Development Mode
- Mock authentication enabled
- Mock AI missions
- No Firebase required
- Perfect for testing

### Production Mode
- Firebase authentication required
- Real AI mission generation
- Firestore database
- Secure JWT tokens

## Security Layers

```mermaid
graph TB
    A[Incoming Request] --> B{Has Authorization Header?}
    B -->|No| C[401 Unauthorized]
    B -->|Yes| D{Valid JWT Token?}
    D -->|No| E[403 Forbidden]
    D -->|Yes| F{Firebase Configured?}
    F -->|Yes| G[Verify with Firebase]
    F -->|No| H{Development Mode?}
    H -->|Yes| I[Use Mock User]
    H -->|No| E
    G --> J{Token Valid?}
    J -->|Yes| K[Attach user to request]
    J -->|No| E
    I --> K
    K --> L[Process Request]
    L --> M[Return Response]
    
    style C fill:#ffe1e1
    style E fill:#ffe1e1
    style K fill:#e1ffe1
    style M fill:#e1ffe1
```

## API Response Format

### Success Response
```json
{
  "success": true,
  "data": {
    // Response data
  }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error (development only)"
}
```

## Rate Limiting & Performance

Currently not implemented, but recommended for production:
- Rate limiting: 100 requests/minute per IP
- Request timeout: 30 seconds
- Response caching for static data
- Database query optimization

## Monitoring & Logging

Console logging enabled for:
- ✅ Firebase initialization status
- ✅ AI API errors (with fallback)
- ✅ Authentication errors
- ✅ Server startup confirmation

For production, integrate:
- Error tracking (e.g., Sentry)
- Performance monitoring (e.g., New Relic)
- Request logging (e.g., Morgan)
- Analytics (e.g., Google Analytics)
