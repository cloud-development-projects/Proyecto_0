# Proyecto_0 Makefile

.PHONY: help local clean build logs

# Default target
help:
	@echo "Available commands:"
	@echo "  local       - Start full local environment (PostgreSQL + API)"
	@echo "  build       - Build the Go application"
	@echo "  logs        - Show logs from all containers"
	@echo "  clean       - Stop and remove all containers and volumes"

# Local: Full local environment with everything
local:
	@echo "Starting full local environment..."
	docker-compose -f docker-compose.local.yml up -d
	@echo "API is running on http://localhost:8080"
	@echo "PostgreSQL is running on localhost:5432"
	@echo "Database initialized with tables and dummy data"

# Build the Go application
build:
	@echo "Building Go application..."
	cd backend && go build -o bin/api cmd/api/main.go
	@echo "Binary created at backend/bin/api"

# Show logs
logs:
	docker-compose -f docker-compose.local.yml logs -f

# Clean up everything
clean:
	@echo "Stopping and removing all containers..."
	docker-compose -f docker-compose.local.yml down -v
	@echo "Cleaning up Docker images..."
	docker image prune -f
	@echo "Cleanup complete!"
