# Proyecto_0 Makefile

.PHONY: help dev prod dev-db test-memory test-postgres clean build logs

# Default target
help:
	@echo "Available commands:"
	@echo "  dev         - Start PostgreSQL for development (no API container)"
	@echo "  prod        - Start full production environment (PostgreSQL + API)"
	@echo "  dev-db      - Start only PostgreSQL database for development"
	@echo "  test-memory - Run API locally with in-memory database"
	@echo "  test-postgres - Run API locally with PostgreSQL (requires dev-db to be running)"
	@echo "  build       - Build the Go application"
	@echo "  logs        - Show logs from all containers"
	@echo "  clean       - Stop and remove all containers and volumes"

# Development: Start PostgreSQL only (run Go app locally)
dev:
	@echo "Starting PostgreSQL for development..."
	docker-compose -f docker-compose.dev.yml up -d
	@echo "PostgreSQL is running on localhost:5432"
	@echo "Adminer (DB admin) is available at http://localhost:8081"
	@echo "To connect: Server=postgres, Username=postgres, Password=password, Database=proyecto_0"
	@echo ""
	@echo "Now run the Go app locally with:"
	@echo "  cd backend && DB_DRIVER=postgres DB_HOST=localhost go run cmd/api/main.go"

# Production: Full environment
prod:
	@echo "Starting full production environment..."
	docker-compose up -d
	@echo "API is running on http://localhost:8080"
	@echo "PostgreSQL is running on localhost:5432"

# Development database only
dev-db:
	@echo "Starting PostgreSQL database only..."
	docker-compose -f docker-compose.dev.yml up -d postgres
	@echo "PostgreSQL is ready on localhost:5432"

# Test with in-memory database
test-memory:
	@echo "Starting API with in-memory database..."
	cd backend && DB_DRIVER=memory go run cmd/api/main.go

# Test with PostgreSQL (requires dev-db to be running)
test-postgres:
	@echo "Starting API with PostgreSQL..."
	cd backend && DB_DRIVER=postgres DB_HOST=localhost go run cmd/api/main.go

# Build the Go application
build:
	@echo "Building Go application..."
	cd backend && go build -o bin/api cmd/api/main.go
	@echo "Binary created at backend/bin/api"

# Show logs
logs:
	docker-compose logs -f

# Clean up everything
clean:
	@echo "Stopping and removing all containers..."
	docker-compose down -v
	docker-compose -f docker-compose.dev.yml down -v
	@echo "Cleaning up Docker images..."
	docker image prune -f
	@echo "Cleanup complete!"

# Quick test endpoints (requires jq)
test-endpoints:
	@echo "Testing API endpoints..."
	@echo "1. Health check:"
	@curl -s http://localhost:8080/api/protected/me || echo "API not running"
	@echo "\n2. Register user:"
	@curl -s -X POST http://localhost:8080/api/auth/register \
		-H 'Content-Type: application/json' \
		-d '{"username":"testuser","password":"testpass"}' | jq . || echo "Failed"
	@echo "3. Login:"
	@TOKEN=$$(curl -s -X POST http://localhost:8080/api/auth/login \
		-H 'Content-Type: application/json' \
		-d '{"username":"testuser","password":"testpass"}' | jq -r .token 2>/dev/null); \
	if [ "$$TOKEN" != "null" ] && [ "$$TOKEN" != "" ]; then \
		echo "Login successful, testing protected endpoint:"; \
		curl -s http://localhost:8080/api/protected/me \
			-H "Authorization: Bearer $$TOKEN" | jq .; \
	else \
		echo "Login failed"; \
	fi
