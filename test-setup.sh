#!/bin/bash

echo "🚀 Testing Proyecto_0 Setup"
echo "=========================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to wait for service
wait_for_service() {
    local url=$1
    local service_name=$2
    local max_attempts=30
    local attempt=1
    
    echo "⏳ Waiting for $service_name to be ready..."
    
    while [ $attempt -le $max_attempts ]; do
        if curl -s "$url" >/dev/null 2>&1; then
            echo -e "${GREEN}✅ $service_name is ready!${NC}"
            return 0
        fi
        echo "   Attempt $attempt/$max_attempts - waiting..."
        sleep 2
        attempt=$((attempt + 1))
    done
    
    echo -e "${RED}❌ $service_name failed to start${NC}"
    return 1
}

# Check prerequisites
echo "📋 Checking prerequisites..."

if ! command_exists docker; then
    echo -e "${RED}❌ Docker is not installed${NC}"
    exit 1
fi

if ! command_exists docker-compose; then
    echo -e "${RED}❌ Docker Compose is not installed${NC}"
    exit 1
fi

if ! command_exists curl; then
    echo -e "${RED}❌ curl is not installed${NC}"
    exit 1
fi

if ! command_exists jq; then
    echo -e "${YELLOW}⚠️  jq is not installed (optional, for prettier JSON output)${NC}"
fi

echo -e "${GREEN}✅ All prerequisites met${NC}"
echo ""

# Start services
echo "🐳 Starting Docker services..."
docker-compose up -d

echo ""
echo "⏳ Waiting for services to start..."
sleep 5

# Wait for PostgreSQL
if ! wait_for_service "http://localhost:5432" "PostgreSQL"; then
    echo "Checking PostgreSQL with pg_isready..."
    docker-compose exec postgres pg_isready -U postgres -d proyecto_0
fi

# Wait for API
if ! wait_for_service "http://localhost:8080/api/protected/me" "API"; then
    echo "API might still be starting up..."
fi

echo ""
echo "🧪 Testing API endpoints..."

# Test 1: Register a user
echo "1️⃣ Testing user registration..."
REGISTER_RESPONSE=$(curl -s -X POST http://localhost:8080/api/auth/register \
    -H 'Content-Type: application/json' \
    -d '{"username":"testuser","password":"testpass"}')

if echo "$REGISTER_RESPONSE" | grep -q "testuser"; then
    echo -e "${GREEN}✅ User registration successful${NC}"
else
    echo -e "${RED}❌ User registration failed${NC}"
    echo "Response: $REGISTER_RESPONSE"
fi

# Test 2: Login
echo "2️⃣ Testing user login..."
LOGIN_RESPONSE=$(curl -s -X POST http://localhost:8080/api/auth/login \
    -H 'Content-Type: application/json' \
    -d '{"username":"testuser","password":"testpass"}')

TOKEN=""
if command_exists jq; then
    TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.token // empty')
else
    TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"token":"[^"]*"' | cut -d'"' -f4)
fi

if [ -n "$TOKEN" ] && [ "$TOKEN" != "null" ]; then
    echo -e "${GREEN}✅ User login successful${NC}"
    echo "   Token: ${TOKEN:0:20}..."
else
    echo -e "${RED}❌ User login failed${NC}"
    echo "Response: $LOGIN_RESPONSE"
fi

# Test 3: Protected endpoint
if [ -n "$TOKEN" ] && [ "$TOKEN" != "null" ]; then
    echo "3️⃣ Testing protected endpoint..."
    PROTECTED_RESPONSE=$(curl -s http://localhost:8080/api/protected/me \
        -H "Authorization: Bearer $TOKEN")
    
    if echo "$PROTECTED_RESPONSE" | grep -q "testuser"; then
        echo -e "${GREEN}✅ Protected endpoint access successful${NC}"
    else
        echo -e "${RED}❌ Protected endpoint access failed${NC}"
        echo "Response: $PROTECTED_RESPONSE"
    fi
else
    echo "3️⃣ Skipping protected endpoint test (no valid token)"
fi

# Test 4: Database connection
echo "4️⃣ Testing database connection..."
DB_TEST=$(docker-compose exec -T postgres psql -U postgres -d proyecto_0 -c "\dt" 2>/dev/null)

if echo "$DB_TEST" | grep -q "users"; then
    echo -e "${GREEN}✅ Database connection and auth tables verified${NC}"
else
    echo -e "${YELLOW}⚠️  Auth tables might not be created yet${NC}"
fi

if echo "$DB_TEST" | grep -q "usuario"; then
    echo -e "${GREEN}✅ Project tables verified${NC}"
else
    echo -e "${YELLOW}⚠️  Project tables might not be created yet${NC}"
fi

echo ""
echo "🎯 Test Summary"
echo "==============="
echo "API URL: http://localhost:8080"
echo "Database Admin: http://localhost:8081 (username: postgres, password: password)"
echo ""
echo "To stop services: docker-compose down"
echo "To clean up: make clean"
echo ""
echo -e "${GREEN}🎉 Setup test completed!${NC}"
