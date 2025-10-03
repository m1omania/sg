#!/bin/bash

# SolarGroup Deployment Script
# Usage: ./scripts/deploy.sh [environment] [version]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Default values
ENVIRONMENT=${1:-staging}
VERSION=${2:-latest}
NAMESPACE="solar-group"
REGISTRY="ghcr.io"
IMAGE_NAME="solar-group"

# Functions
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

success() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

warning() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

# Check if required tools are installed
check_dependencies() {
    log "Checking dependencies..."
    
    if ! command -v kubectl &> /dev/null; then
        error "kubectl is not installed"
        exit 1
    fi
    
    if ! command -v docker &> /dev/null; then
        error "docker is not installed"
        exit 1
    fi
    
    success "All dependencies are installed"
}

# Build Docker image
build_image() {
    log "Building Docker image..."
    
    docker build -t ${REGISTRY}/${IMAGE_NAME}:${VERSION} .
    docker tag ${REGISTRY}/${IMAGE_NAME}:${VERSION} ${REGISTRY}/${IMAGE_NAME}:latest
    
    success "Docker image built successfully"
}

# Push Docker image
push_image() {
    log "Pushing Docker image to registry..."
    
    docker push ${REGISTRY}/${IMAGE_NAME}:${VERSION}
    docker push ${REGISTRY}/${IMAGE_NAME}:latest
    
    success "Docker image pushed successfully"
}

# Deploy to Kubernetes
deploy_k8s() {
    log "Deploying to Kubernetes..."
    
    # Create namespace if it doesn't exist
    kubectl create namespace ${NAMESPACE} --dry-run=client -o yaml | kubectl apply -f -
    
    # Apply ConfigMap
    kubectl apply -f k8s/configmap.yaml
    
    # Apply Secret
    kubectl apply -f k8s/secret.yaml
    
    # Apply Service
    kubectl apply -f k8s/service.yaml
    
    # Update deployment with new image
    kubectl set image deployment/solar-group-app app=${REGISTRY}/${IMAGE_NAME}:${VERSION} -n ${NAMESPACE}
    
    # Wait for rollout to complete
    kubectl rollout status deployment/solar-group-app -n ${NAMESPACE} --timeout=300s
    
    success "Deployment completed successfully"
}

# Deploy with Docker Compose
deploy_compose() {
    log "Deploying with Docker Compose..."
    
    # Stop existing containers
    docker-compose down
    
    # Build and start new containers
    docker-compose up -d --build
    
    # Wait for services to be ready
    sleep 30
    
    # Check if services are running
    docker-compose ps
    
    success "Docker Compose deployment completed"
}

# Run health checks
health_check() {
    log "Running health checks..."
    
    if [ "$ENVIRONMENT" = "production" ]; then
        # Production health check
        curl -f https://solar-group.com/api/health || {
            error "Health check failed"
            exit 1
        }
    else
        # Staging/development health check
        curl -f http://localhost:3000/api/health || {
            error "Health check failed"
            exit 1
        }
    fi
    
    success "Health checks passed"
}

# Run tests
run_tests() {
    log "Running tests..."
    
    # Backend tests
    cd server
    npm ci
    npm run test:ci
    cd ..
    
    # Frontend tests
    npm ci
    npm run test:e2e
    
    success "All tests passed"
}

# Rollback deployment
rollback() {
    log "Rolling back deployment..."
    
    kubectl rollout undo deployment/solar-group-app -n ${NAMESPACE}
    kubectl rollout status deployment/solar-group-app -n ${NAMESPACE}
    
    success "Rollback completed"
}

# Cleanup old images
cleanup() {
    log "Cleaning up old Docker images..."
    
    # Remove unused images
    docker image prune -f
    
    # Remove old versions (keep last 3)
    docker images ${REGISTRY}/${IMAGE_NAME} --format "table {{.Tag}}\t{{.CreatedAt}}" | \
    tail -n +4 | head -n -3 | awk '{print $1}' | \
    xargs -r -I {} docker rmi ${REGISTRY}/${IMAGE_NAME}:{}
    
    success "Cleanup completed"
}

# Main deployment function
main() {
    log "Starting deployment to ${ENVIRONMENT} environment with version ${VERSION}"
    
    # Check dependencies
    check_dependencies
    
    # Run tests
    run_tests
    
    # Build and push image
    build_image
    push_image
    
    # Deploy based on environment
    case $ENVIRONMENT in
        "production")
            deploy_k8s
            ;;
        "staging")
            deploy_k8s
            ;;
        "development")
            deploy_compose
            ;;
        *)
            error "Unknown environment: $ENVIRONMENT"
            exit 1
            ;;
    esac
    
    # Run health checks
    health_check
    
    # Cleanup
    cleanup
    
    success "Deployment to ${ENVIRONMENT} completed successfully!"
}

# Handle command line arguments
case "${1:-}" in
    "rollback")
        rollback
        ;;
    "health")
        health_check
        ;;
    "test")
        run_tests
        ;;
    "cleanup")
        cleanup
        ;;
    *)
        main
        ;;
esac
