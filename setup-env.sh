#!/bin/bash

# EcoFarming Environment Setup Script
# This script helps you set up environment variables for the project

echo "🌱 EcoFarming Environment Setup"
echo "================================"
echo ""

# Check if backend/.env already exists
if [ -f "backend/.env" ]; then
    echo "⚠️  backend/.env already exists!"
    read -p "Do you want to overwrite it? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Setup cancelled. Your existing .env file is preserved."
        exit 0
    fi
fi

# Create backend/.env from example
if [ -f "backend/.env.example" ]; then
    cp backend/.env.example backend/.env
    echo "✅ Created backend/.env from template"
else
    echo "❌ backend/.env.example not found!"
    exit 1
fi

echo ""
echo "📝 Let's configure your environment variables..."
echo ""

# Function to update env variable
update_env() {
    local key=$1
    local value=$2
    local file="backend/.env"
    
    # Escape special characters for sed
    escaped_value=$(echo "$value" | sed 's/[&/\]/\\&/g')
    
    # Update the value in .env file
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        sed -i '' "s|^${key}=.*|${key}=${escaped_value}|" "$file"
    else
        # Linux
        sed -i "s|^${key}=.*|${key}=${escaped_value}|" "$file"
    fi
}

# Port configuration
echo "1️⃣  Backend Port (default: 5000)"
read -p "   Enter port or press Enter for default: " PORT
PORT=${PORT:-5000}
update_env "PORT" "$PORT"
echo "   ✅ Port set to: $PORT"
echo ""

# JWT Secret
echo "2️⃣  JWT Secret"
echo "   Generating a secure random secret..."
JWT_SECRET=$(openssl rand -base64 32)
update_env "JWT_SECRET" "$JWT_SECRET"
echo "   ✅ JWT Secret generated and saved"
echo ""

# Firebase Configuration
echo "3️⃣  Firebase Configuration"
read -p "   Do you want to configure Firebase now? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo ""
    echo "   📋 You'll need your Firebase service account JSON file"
    echo "   Get it from: Firebase Console > Project Settings > Service Accounts"
    echo ""
    
    read -p "   Enter Firebase Project ID: " FIREBASE_PROJECT_ID
    update_env "FIREBASE_PROJECT_ID" "$FIREBASE_PROJECT_ID"
    
    read -p "   Enter Firebase Client Email: " FIREBASE_CLIENT_EMAIL
    update_env "FIREBASE_CLIENT_EMAIL" "$FIREBASE_CLIENT_EMAIL"
    
    echo "   Enter Firebase Private Key (paste the entire key including BEGIN/END lines):"
    echo "   Press Ctrl+D when done:"
    FIREBASE_PRIVATE_KEY=$(cat)
    # Escape newlines for .env format
    FIREBASE_PRIVATE_KEY_ESCAPED=$(echo "$FIREBASE_PRIVATE_KEY" | awk '{printf "%s\\n", $0}' | sed 's/\\n$//')
    update_env "FIREBASE_PRIVATE_KEY" "\"$FIREBASE_PRIVATE_KEY_ESCAPED\""
    
    echo "   ✅ Firebase configuration saved"
else
    echo "   ⏭️  Skipping Firebase configuration (app will use mock auth)"
fi
echo ""

# Gemini AI API Key
echo "4️⃣  Google Gemini AI API Key"
read -p "   Do you want to configure Gemini AI now? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo ""
    echo "   Get your API key from: https://makersuite.google.com/app/apikey"
    echo ""
    read -p "   Enter Gemini API Key: " AI_API_KEY
    update_env "AI_API_KEY" "$AI_API_KEY"
    echo "   ✅ Gemini AI API key saved"
else
    echo "   ⏭️  Skipping AI configuration (app will use mock missions)"
fi
echo ""

echo "================================"
echo "✅ Environment setup complete!"
echo ""
echo "📄 Your configuration has been saved to: backend/.env"
echo ""
echo "Next steps:"
echo "1. Review backend/.env to verify all settings"
echo "2. Install dependencies: npm install && cd backend && npm install"
echo "3. Start the server: npm run dev"
echo ""
echo "📚 For detailed setup instructions, see: docs/API_SETUP_GUIDE.md"
echo ""
