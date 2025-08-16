#!/bin/bash

# Example script showing how to test both in-memory and PostgreSQL databases

echo "=== Testing In-Memory Database ==="
echo "Starting server with in-memory database..."

# Start with in-memory database
DB_DRIVER=memory go run cmd/api/main.go &
SERVER_PID=$!
sleep 2

# Test registration and login
echo "Testing registration..."
curl -s -X POST http://localhost:8080/api/auth/register \
  -H 'Content-Type: application/json' \
  -d '{"username":"testuser","password":"testpass"}' | jq .

echo "Testing login..."
TOKEN=$(curl -s -X POST http://localhost:8080/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"username":"testuser","password":"testpass"}' | jq -r .token)

echo "Testing protected endpoint..."
curl -s http://localhost:8080/api/protected/me \
  -H "Authorization: Bearer $TOKEN" | jq .

# Kill the server
kill $SERVER_PID

echo ""
echo "=== Testing PostgreSQL Database ==="
echo "Note: This requires PostgreSQL to be running on localhost:5432"
echo "Start PostgreSQL with: docker run --name postgres-test -e POSTGRES_DB=proyecto_0 -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=password -p 5432:5432 -d postgres:15"
echo ""

read -p "Press Enter to continue with PostgreSQL test (or Ctrl+C to exit)..."

# Start with PostgreSQL
DB_DRIVER=postgres \
DB_HOST=localhost \
DB_PORT=5432 \
DB_NAME=proyecto_0 \
DB_USER=postgres \
DB_PASSWORD=password \
DB_SSL_MODE=disable \
go run cmd/api/main.go &
SERVER_PID=$!
sleep 3

# Test registration and login with PostgreSQL
echo "Testing registration with PostgreSQL..."
curl -s -X POST http://localhost:8080/api/auth/register \
  -H 'Content-Type: application/json' \
  -d '{"username":"pguser","password":"pgpass"}' | jq .

echo "Testing login with PostgreSQL..."
TOKEN=$(curl -s -X POST http://localhost:8080/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"username":"pguser","password":"pgpass"}' | jq -r .token)

echo "Testing protected endpoint with PostgreSQL..."
curl -s http://localhost:8080/api/protected/me \
  -H "Authorization: Bearer $TOKEN" | jq .

# Kill the server
kill $SERVER_PID

echo ""
echo "=== Test Complete ==="
echo "Both databases tested successfully!"
