# Proyecto_0 Makefile

.PHONY: help local clean build logs

# Default target
help:
	@echo "Available commands:"
	@echo "  local       - Start full local environment (PostgreSQL + API)"
	@echo "  build       - Build the Go application"
	@echo "  logs        - Show logs from all containers"
	@echo "  clean       - NUCLEAR: Stop and remove EVERYTHING (containers, volumes, networks, images)"

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

# NUCLEAR CLEANUP - Destroys absolutely everything
clean:
	@echo "🚨 NUCLEAR CLEANUP - DESTROYING EVERYTHING..."
	@echo "Stopping and removing all project containers..."
	docker-compose -f docker-compose.local.yml down -v --remove-orphans
	@echo "Removing ALL project images..."
	docker-compose -f docker-compose.local.yml down --rmi all
	@echo "Pruning ALL unused Docker resources..."
	docker system prune -a -f --volumes
	@echo "Removing any leftover proyecto_0 containers..."
	docker ps -aq --filter "name=proyecto_0" | xargs -r docker rm -f
	@echo "Removing any leftover proyecto_0 images..."
	docker images --filter "reference=*proyecto*" -q | xargs -r docker rmi -f
	@echo "Removing any leftover proyecto_0 volumes..."
	docker volume ls --filter "name=proyecto_0" -q | xargs -r docker volume rm
	@echo "Removing any leftover proyecto_0 networks..."
	docker network ls --filter "name=proyecto_0" -q | xargs -r docker network rm
	@echo "💥 NUCLEAR CLEANUP COMPLETE - Everything obliterated!"