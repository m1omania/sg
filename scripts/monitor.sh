#!/bin/bash

# SolarGroup Monitoring Script
# Usage: ./scripts/monitor.sh [action] [options]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
NAMESPACE="solar-group"
APP_NAME="solar-group-app"
MONITORING_URL="http://localhost:3000/api/monitoring"

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

# Check application health
check_health() {
    log "Checking application health..."
    
    # Check if application is running
    if ! curl -f -s "$MONITORING_URL/health" > /dev/null; then
        error "Application health check failed"
        return 1
    fi
    
    # Get detailed health status
    local health_status=$(curl -s "$MONITORING_URL/health" | jq -r '.status')
    
    if [ "$health_status" = "healthy" ]; then
        success "Application is healthy"
    else
        warning "Application health status: $health_status"
    fi
}

# Check Kubernetes resources
check_k8s_resources() {
    log "Checking Kubernetes resources..."
    
    # Check pods
    local pod_status=$(kubectl get pods -n $NAMESPACE -l app=$APP_NAME --no-headers | awk '{print $3}')
    
    if [[ "$pod_status" == *"Running"* ]]; then
        success "Pods are running"
    else
        error "Some pods are not running: $pod_status"
    fi
    
    # Check services
    local service_status=$(kubectl get svc -n $NAMESPACE -l app=$APP_NAME --no-headers | awk '{print $2}')
    
    if [ -n "$service_status" ]; then
        success "Services are available"
    else
        error "No services found"
    fi
}

# Check database performance
check_database() {
    log "Checking database performance..."
    
    # Get database metrics
    local db_metrics=$(curl -s "$MONITORING_URL/metrics" | jq '.database')
    
    if [ -n "$db_metrics" ]; then
        success "Database metrics retrieved"
        echo "$db_metrics" | jq '.'
    else
        warning "Could not retrieve database metrics"
    fi
}

# Check system resources
check_system_resources() {
    log "Checking system resources..."
    
    # Get system metrics
    local system_metrics=$(curl -s "$MONITORING_URL/metrics" | jq '.system')
    
    if [ -n "$system_metrics" ]; then
        success "System metrics retrieved"
        echo "$system_metrics" | jq '.'
    else
        warning "Could not retrieve system metrics"
    fi
}

# Check alerts
check_alerts() {
    log "Checking alerts..."
    
    # Get active alerts
    local alerts=$(curl -s "$MONITORING_URL/alerts" | jq '.alerts[] | select(.status == "active")')
    
    if [ -n "$alerts" ]; then
        warning "Active alerts found:"
        echo "$alerts" | jq '.'
    else
        success "No active alerts"
    fi
}

# Monitor logs
monitor_logs() {
    local lines=${1:-100}
    
    log "Monitoring application logs (last $lines lines)..."
    
    if command -v kubectl &> /dev/null; then
        kubectl logs -n $NAMESPACE -l app=$APP_NAME --tail=$lines -f
    else
        # Fallback to local logs
        tail -f server/logs/app.log | head -n $lines
    fi
}

# Generate report
generate_report() {
    local report_file="monitoring_report_$(date +%Y%m%d_%H%M%S).json"
    
    log "Generating monitoring report..."
    
    # Collect all metrics
    local report=$(curl -s "$MONITORING_URL/dashboard" | jq '.')
    
    # Save to file
    echo "$report" > "$report_file"
    
    success "Report generated: $report_file"
}

# Setup monitoring
setup_monitoring() {
    log "Setting up monitoring..."
    
    # Check if monitoring endpoints are available
    if ! curl -f -s "$MONITORING_URL/health" > /dev/null; then
        error "Monitoring endpoints not available"
        exit 1
    fi
    
    # Create monitoring dashboard
    if [ ! -f "monitoring.html" ]; then
        warning "Monitoring dashboard not found"
    else
        success "Monitoring dashboard available"
    fi
    
    success "Monitoring setup completed"
}

# Cleanup old logs
cleanup_logs() {
    local days=${1:-7}
    
    log "Cleaning up logs older than $days days..."
    
    find server/logs -name "*.log" -mtime +$days -delete
    
    success "Log cleanup completed"
}

# Performance test
performance_test() {
    local duration=${1:-60}
    local concurrency=${2:-10}
    
    log "Running performance test for ${duration}s with ${concurrency} concurrent users..."
    
    # Install wrk if not available
    if ! command -v wrk &> /dev/null; then
        warning "wrk not found, installing..."
        if command -v brew &> /dev/null; then
            brew install wrk
        else
            error "Please install wrk manually"
            exit 1
        fi
    fi
    
    # Run performance test
    wrk -t$concurrency -c$concurrency -d${duration}s --latency http://localhost:3000/api/health
    
    success "Performance test completed"
}

# Main function
main() {
    case "${1:-status}" in
        "health")
            check_health
            ;;
        "k8s")
            check_k8s_resources
            ;;
        "database")
            check_database
            ;;
        "system")
            check_system_resources
            ;;
        "alerts")
            check_alerts
            ;;
        "logs")
            monitor_logs "$2"
            ;;
        "report")
            generate_report
            ;;
        "setup")
            setup_monitoring
            ;;
        "cleanup")
            cleanup_logs "$2"
            ;;
        "test")
            performance_test "$2" "$3"
            ;;
        "status")
            check_health
            check_k8s_resources
            check_alerts
            ;;
        *)
            echo "Usage: $0 [action] [options]"
            echo ""
            echo "Commands:"
            echo "  health      - Check application health"
            echo "  k8s         - Check Kubernetes resources"
            echo "  database    - Check database performance"
            echo "  system      - Check system resources"
            echo "  alerts      - Check active alerts"
            echo "  logs [n]    - Monitor logs (last n lines)"
            echo "  report      - Generate monitoring report"
            echo "  setup       - Setup monitoring"
            echo "  cleanup [d] - Cleanup old logs (older than d days)"
            echo "  test [d] [c]- Run performance test (duration, concurrency)"
            echo "  status      - Check overall status"
            exit 1
            ;;
    esac
}

main "$@"
