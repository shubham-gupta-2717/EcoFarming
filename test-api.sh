#!/bin/bash

# EcoFarming API & Authentication Test Script
# Tests all major endpoints to verify setup

echo "🧪 EcoFarming API Test Suite"
echo "============================"
echo ""

# Configuration
BASE_URL="http://localhost:5000"
TOKEN=""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test counter
PASSED=0
FAILED=0

# Function to test endpoint
test_endpoint() {
    local name=$1
    local method=$2
    local endpoint=$3
    local data=$4
    local auth=$5
    
    echo -n "Testing: $name... "
    
    if [ "$method" == "GET" ]; then
        if [ -n "$auth" ]; then
            response=$(curl -s -w "\n%{http_code}" -H "Authorization: Bearer $TOKEN" "$BASE_URL$endpoint")
        else
            response=$(curl -s -w "\n%{http_code}" "$BASE_URL$endpoint")
        fi
    else
        if [ -n "$auth" ]; then
            response=$(curl -s -w "\n%{http_code}" -X "$method" -H "Content-Type: application/json" -H "Authorization: Bearer $TOKEN" -d "$data" "$BASE_URL$endpoint")
        else
            response=$(curl -s -w "\n%{http_code}" -X "$method" -H "Content-Type: application/json" -d "$data" "$BASE_URL$endpoint")
        fi
    fi
    
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | sed '$d')
    
    if [ "$http_code" -ge 200 ] && [ "$http_code" -lt 300 ]; then
        echo -e "${GREEN}✅ PASSED${NC} (HTTP $http_code)"
        PASSED=$((PASSED + 1))
        return 0
    else
        echo -e "${RED}❌ FAILED${NC} (HTTP $http_code)"
        echo "   Response: $body"
        FAILED=$((FAILED + 1))
        return 1
    fi
}

# Check if server is running
echo "Checking if server is running..."
if ! curl -s "$BASE_URL" > /dev/null; then
    echo -e "${RED}❌ Server is not running at $BASE_URL${NC}"
    echo ""
    echo "Please start the server first:"
    echo "  cd backend && npm run dev"
    exit 1
fi
echo -e "${GREEN}✅ Server is running${NC}"
echo ""

# Test 1: Login
echo "1️⃣  Authentication Tests"
echo "------------------------"
login_data='{"email":"demo@ecofarming.com","password":"demo123"}'
response=$(curl -s -X POST -H "Content-Type: application/json" -d "$login_data" "$BASE_URL/api/auth/login")
TOKEN=$(echo "$response" | grep -o '"token":"[^"]*' | cut -d'"' -f4)

if [ -n "$TOKEN" ]; then
    echo -e "Login: ${GREEN}✅ PASSED${NC}"
    echo "   Token: ${TOKEN:0:20}..."
    PASSED=$((PASSED + 1))
else
    echo -e "Login: ${RED}❌ FAILED${NC}"
    echo "   Response: $response"
    FAILED=$((FAILED + 1))
fi

# Test 2: Get Profile (Protected)
test_endpoint "Get Profile" "GET" "/api/auth/profile" "" "auth"
echo ""

# Test 3: Mission Generation
echo "2️⃣  Mission Tests"
echo "----------------"
mission_data='{"crop":"wheat","location":"Punjab","season":"Rabi","landSize":"5 acres"}'
test_endpoint "Generate Mission" "POST" "/api/missions/generate" "$mission_data" ""
echo ""

# Test 4: Gamification
echo "3️⃣  Gamification Tests"
echo "---------------------"
test_endpoint "Get Leaderboard" "GET" "/api/gamification/leaderboard" "" ""
echo ""

# Test 5: Community
echo "4️⃣  Community Tests"
echo "------------------"
test_endpoint "Get Community Feed" "GET" "/api/community/feed" "" ""
echo ""

# Test 6: Government Schemes
echo "5️⃣  Government Schemes Tests"
echo "---------------------------"
test_endpoint "Get Recommended Schemes" "GET" "/api/schemes/recommend?crop=wheat&location=Punjab" "" ""
echo ""

# Test 7: Crop Calendar
echo "6️⃣  Crop Calendar Tests"
echo "----------------------"
test_endpoint "Get Crop Calendar" "GET" "/api/crop/calendar?crop=wheat" "" ""
echo ""

# Test 8: Verification (Admin)
echo "7️⃣  Verification Tests"
echo "---------------------"
test_endpoint "Get Pending Verifications" "GET" "/api/verification/pending" "" ""
echo ""

# Summary
echo "============================"
echo "📊 Test Summary"
echo "============================"
echo -e "Passed: ${GREEN}$PASSED${NC}"
echo -e "Failed: ${RED}$FAILED${NC}"
echo "Total:  $((PASSED + FAILED))"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}🎉 All tests passed!${NC}"
    echo ""
    echo "Your EcoFarming API is working correctly!"
    exit 0
else
    echo -e "${YELLOW}⚠️  Some tests failed${NC}"
    echo ""
    echo "Common issues:"
    echo "  • Check backend/.env configuration"
    echo "  • Verify Firebase credentials (if using)"
    echo "  • Check server logs for errors"
    echo ""
    echo "See docs/API_SETUP_GUIDE.md for troubleshooting"
    exit 1
fi
