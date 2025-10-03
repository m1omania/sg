#!/bin/bash

# SolarGroup Backup Script
# Usage: ./scripts/backup.sh [action] [options]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
BACKUP_DIR="/backups/solar-group"
DB_PATH="server/database.sqlite"
S3_BUCKET="solar-group-backups"
RETENTION_DAYS=30

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

# Create backup directory
create_backup_dir() {
    mkdir -p ${BACKUP_DIR}
}

# Create database backup
backup_database() {
    local timestamp=$(date +%Y%m%d_%H%M%S)
    local backup_file="${BACKUP_DIR}/database_${timestamp}.sqlite"
    
    log "Creating database backup..."
    
    if [ ! -f "$DB_PATH" ]; then
        error "Database file not found: $DB_PATH"
        exit 1
    fi
    
    cp "$DB_PATH" "$backup_file"
    
    # Compress backup
    gzip "$backup_file"
    
    success "Database backup created: ${backup_file}.gz"
    echo "${backup_file}.gz"
}

# Create application backup
backup_application() {
    local timestamp=$(date +%Y%m%d_%H%M%S)
    local backup_file="${BACKUP_DIR}/application_${timestamp}.tar.gz"
    
    log "Creating application backup..."
    
    # Exclude node_modules and other unnecessary files
    tar -czf "$backup_file" \
        --exclude=node_modules \
        --exclude=.git \
        --exclude=*.log \
        --exclude=coverage \
        --exclude=dist \
        --exclude=build \
        .
    
    success "Application backup created: $backup_file"
    echo "$backup_file"
}

# Upload to S3
upload_to_s3() {
    local file_path="$1"
    
    if ! command -v aws &> /dev/null; then
        warning "AWS CLI not found, skipping S3 upload"
        return
    fi
    
    log "Uploading to S3..."
    
    aws s3 cp "$file_path" "s3://${S3_BUCKET}/$(basename $file_path)"
    
    success "Uploaded to S3: s3://${S3_BUCKET}/$(basename $file_path)"
}

# List backups
list_backups() {
    log "Listing backups..."
    
    echo "Database backups:"
    ls -la ${BACKUP_DIR}/database_*.sqlite.gz 2>/dev/null || echo "No database backups found"
    
    echo -e "\nApplication backups:"
    ls -la ${BACKUP_DIR}/application_*.tar.gz 2>/dev/null || echo "No application backups found"
}

# Cleanup old backups
cleanup_backups() {
    log "Cleaning up backups older than ${RETENTION_DAYS} days..."
    
    find ${BACKUP_DIR} -name "*.gz" -mtime +${RETENTION_DAYS} -delete
    
    success "Cleanup completed"
}

# Restore database
restore_database() {
    local backup_file="$1"
    
    if [ -z "$backup_file" ]; then
        error "Backup file not specified"
        exit 1
    fi
    
    if [ ! -f "$backup_file" ]; then
        error "Backup file not found: $backup_file"
        exit 1
    fi
    
    log "Restoring database from $backup_file..."
    
    # Stop application if running
    pkill -f "node.*server.js" || true
    
    # Create backup of current database
    if [ -f "$DB_PATH" ]; then
        cp "$DB_PATH" "${DB_PATH}.backup.$(date +%Y%m%d_%H%M%S)"
    fi
    
    # Restore database
    if [[ "$backup_file" == *.gz ]]; then
        gunzip -c "$backup_file" > "$DB_PATH"
    else
        cp "$backup_file" "$DB_PATH"
    fi
    
    success "Database restored successfully"
}

# Verify backup
verify_backup() {
    local backup_file="$1"
    
    if [ -z "$backup_file" ]; then
        error "Backup file not specified"
        exit 1
    fi
    
    log "Verifying backup: $backup_file"
    
    if [[ "$backup_file" == *.gz ]]; then
        if gzip -t "$backup_file"; then
            success "Backup file is valid"
        else
            error "Backup file is corrupted"
            exit 1
        fi
    else
        if [ -f "$backup_file" ]; then
            success "Backup file exists and is readable"
        else
            error "Backup file not found or not readable"
            exit 1
        fi
    fi
}

# Schedule backup
schedule_backup() {
    log "Setting up backup schedule..."
    
    # Add to crontab (daily at 2 AM)
    (crontab -l 2>/dev/null; echo "0 2 * * * $(pwd)/scripts/backup.sh full") | crontab -
    
    success "Backup scheduled for daily at 2 AM"
}

# Full backup
full_backup() {
    log "Starting full backup..."
    
    create_backup_dir
    
    # Create database backup
    db_backup=$(backup_database)
    
    # Create application backup
    app_backup=$(backup_application)
    
    # Upload to S3
    upload_to_s3 "$db_backup"
    upload_to_s3 "$app_backup"
    
    # Cleanup old backups
    cleanup_backups
    
    success "Full backup completed"
}

# Main function
main() {
    case "${1:-full}" in
        "database")
            create_backup_dir
            backup_database
            ;;
        "application")
            create_backup_dir
            backup_application
            ;;
        "full")
            full_backup
            ;;
        "list")
            list_backups
            ;;
        "restore")
            restore_database "$2"
            ;;
        "verify")
            verify_backup "$2"
            ;;
        "cleanup")
            cleanup_backups
            ;;
        "schedule")
            schedule_backup
            ;;
        *)
            echo "Usage: $0 [database|application|full|list|restore|verify|cleanup|schedule]"
            echo ""
            echo "Commands:"
            echo "  database    - Backup database only"
            echo "  application - Backup application files only"
            echo "  full        - Full backup (database + application)"
            echo "  list        - List existing backups"
            echo "  restore     - Restore database from backup"
            echo "  verify      - Verify backup file integrity"
            echo "  cleanup     - Remove old backups"
            echo "  schedule    - Schedule automatic backups"
            exit 1
            ;;
    esac
}

main "$@"
