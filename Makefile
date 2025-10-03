# SolarGroup Makefile
# Usage: make [target]

.PHONY: help install build test deploy clean

# Default target
help:
	@echo "SolarGroup Investment Platform - Available Commands:"
	@echo ""
	@echo "Development:"
	@echo "  install     - Install all dependencies"
	@echo "  dev         - Start development server"
	@echo "  build       - Build production assets"
	@echo "  test        - Run all tests"
	@echo "  test:unit   - Run unit tests"
	@echo "  test:e2e    - Run E2E tests"
	@echo "  test:coverage - Run tests with coverage"
	@echo ""
	@echo "Database:"
	@echo "  db:migrate  - Run database migrations"
	@echo "  db:backup   - Create database backup"
	@echo "  db:restore  - Restore database from backup"
	@echo "  db:monitor  - Monitor database performance"
	@echo ""
	@echo "Docker:"
	@echo "  docker:build - Build Docker image"
	@echo "  docker:run   - Run Docker container"
	@echo "  docker:stop  - Stop Docker container"
	@echo "  compose:up   - Start with Docker Compose"
	@echo "  compose:down - Stop Docker Compose"
	@echo ""
	@echo "Kubernetes:"
	@echo "  k8s:deploy  - Deploy to Kubernetes"
	@echo "  k8s:status  - Check Kubernetes status"
	@echo "  k8s:logs    - View application logs"
	@echo "  k8s:scale   - Scale application"
	@echo "  k8s:delete  - Delete from Kubernetes"
	@echo ""
	@echo "Monitoring:"
	@echo "  monitor:health - Check application health"
	@echo "  monitor:logs   - View application logs"
	@echo "  monitor:report - Generate monitoring report"
	@echo ""
	@echo "Maintenance:"
	@echo "  clean       - Clean build artifacts"
	@echo "  backup      - Create full backup"
	@echo "  restore     - Restore from backup"

# Development
install:
	@echo "Installing dependencies..."
	npm ci
	cd server && npm ci

dev:
	@echo "Starting development server..."
	npm run dev

build:
	@echo "Building production assets..."
	npm run build

# Testing
test:
	@echo "Running all tests..."
	npm run test
	cd server && npm run test

test:unit:
	@echo "Running unit tests..."
	cd server && npm run test

test:e2e:
	@echo "Running E2E tests..."
	npm run test:e2e

test:coverage:
	@echo "Running tests with coverage..."
	cd server && npm run test:coverage

# Database
db:migrate:
	@echo "Running database migrations..."
	cd server && npm run migrate

db:backup:
	@echo "Creating database backup..."
	./scripts/backup.sh full

db:restore:
	@echo "Restoring database..."
	./scripts/backup.sh restore $(BACKUP_FILE)

db:monitor:
	@echo "Monitoring database performance..."
	cd server && npm run db:monitor

# Docker
docker:build:
	@echo "Building Docker image..."
	docker build -t solar-group:latest .

docker:run:
	@echo "Running Docker container..."
	docker run -d -p 3000:3000 --name solar-group solar-group:latest

docker:stop:
	@echo "Stopping Docker container..."
	docker stop solar-group || true
	docker rm solar-group || true

compose:up:
	@echo "Starting with Docker Compose..."
	docker-compose up -d

compose:down:
	@echo "Stopping Docker Compose..."
	docker-compose down

# Kubernetes
k8s:deploy:
	@echo "Deploying to Kubernetes..."
	kubectl apply -f k8s/

k8s:status:
	@echo "Checking Kubernetes status..."
	kubectl get pods -n solar-group
	kubectl get svc -n solar-group
	kubectl get ingress -n solar-group

k8s:logs:
	@echo "Viewing application logs..."
	kubectl logs -f deployment/solar-group-app -n solar-group

k8s:scale:
	@echo "Scaling application..."
	kubectl scale deployment solar-group-app --replicas=$(REPLICAS) -n solar-group

k8s:delete:
	@echo "Deleting from Kubernetes..."
	kubectl delete -f k8s/

# Monitoring
monitor:health:
	@echo "Checking application health..."
	./scripts/monitor.sh health

monitor:logs:
	@echo "Viewing application logs..."
	./scripts/monitor.sh logs

monitor:report:
	@echo "Generating monitoring report..."
	./scripts/monitor.sh report

# Maintenance
clean:
	@echo "Cleaning build artifacts..."
	rm -rf dist/
	rm -rf server/logs/*
	rm -rf coverage/
	rm -rf node_modules/.cache/

backup:
	@echo "Creating full backup..."
	./scripts/backup.sh full

restore:
	@echo "Restoring from backup..."
	./scripts/backup.sh restore $(BACKUP_FILE)

# Production deployment
deploy:prod:
	@echo "Deploying to production..."
	./scripts/deploy.sh production $(VERSION)

deploy:staging:
	@echo "Deploying to staging..."
	./scripts/deploy.sh staging $(VERSION)

# Quick start
start: install build
	@echo "Starting SolarGroup Investment Platform..."
	npm start

# Full setup
setup: install db:migrate
	@echo "Setup completed successfully!"
	@echo "Run 'make start' to start the application"
