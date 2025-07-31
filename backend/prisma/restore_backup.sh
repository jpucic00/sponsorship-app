#!/bin/bash

# Turso Database Backup Restore Script
# Usage: ./restore_backup.sh [backup_file] [target_database_name]
# Example: ./restore_backup.sh database-backups/backup_2025-07-30_23-14-15.sql.gz my-restored-db

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_info() { echo -e "${BLUE}ℹ️  $1${NC}"; }
print_success() { echo -e "${GREEN}✅ $1${NC}"; }
print_warning() { echo -e "${YELLOW}⚠️  $1${NC}"; }
print_error() { echo -e "${RED}❌ $1${NC}"; }

# Function to show usage
show_usage() {
    echo "Usage: $0 [backup_file] [target_database_name] [options]"
    echo ""
    echo "Arguments:"
    echo "  backup_file           Path to the backup file (.sql or .sql.gz)"
    echo "  target_database_name  Name for the database (optional)"
    echo ""
    echo "Options:"
    echo "  --list-backups       List all available backup files"
    echo "  --show-metadata      Show metadata for a backup file"
    echo "  --local-only         Create local SQLite file only (no Turso)"
    echo "  --overwrite          Replace existing database (destructive)"
    echo "  --merge              Merge data into existing database"
    echo "  --new-db            Create new database with auto-generated name"
    echo "  --help              Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 --list-backups"
    echo "  $0 database-backups/backup_2025-07-30_23-14-15.sql.gz sponsorship-db --overwrite"
    echo "  $0 database-backups/backup_2025-07-30_23-14-15.sql.gz sponsorship-db --merge"
    echo "  $0 database-backups/backup_2025-07-30_23-14-15.sql.gz --new-db"
    echo "  $0 database-backups/backup_2025-07-30_23-14-15.sql.gz --local-only"
}

# Function to list available backups
list_backups() {
    print_info "Available backup files:"
    echo ""
    
    if [ ! -d "database-backups" ]; then
        print_error "No database-backups directory found"
        exit 1
    fi
    
    # Find all backup files
    backup_files=$(find database-backups -name "backup_*.sql*" | sort -r)
    
    if [ -z "$backup_files" ]; then
        print_warning "No backup files found in database-backups/"
        exit 1
    fi
    
    printf "%-40s %-20s %-15s\n" "Backup File" "Timestamp" "Size"
    printf "%-40s %-20s %-15s\n" "----------------------------------------" "--------------------" "---------------"
    
    for file in $backup_files; do
        filename=$(basename "$file")
        # Extract timestamp from filename
        timestamp=$(echo "$filename" | grep -o 'backup_[0-9-_]*' | sed 's/backup_//')
        size=$(du -h "$file" | cut -f1)
        printf "%-40s %-20s %-15s\n" "$filename" "$timestamp" "$size"
        
        # Show metadata if available
        metadata_file="database-backups/${filename%.*.*}_metadata.json"
        if [ -f "$metadata_file" ]; then
            source_db=$(grep '"source_database"' "$metadata_file" | cut -d'"' -f4)
            echo "    └─ Source: $source_db"
        fi
        echo ""
    done
}

# Function to show metadata for a backup
show_metadata() {
    local backup_file="$1"
    
    # Get metadata file path
    filename=$(basename "$backup_file")
    metadata_file="database-backups/${filename%.*.*}_metadata.json"
    
    if [ ! -f "$metadata_file" ]; then
        print_warning "No metadata file found for this backup"
        return
    fi
    
    print_info "Backup Metadata:"
    echo ""
    cat "$metadata_file" | jq . 2>/dev/null || {
        print_warning "jq not installed, showing raw metadata:"
        cat "$metadata_file"
    }
}

# Function to decompress file if needed
prepare_sql_file() {
    local backup_file="$1"
    local temp_file="$2"
    
    if [[ "$backup_file" == *.gz ]]; then
        print_info "Decompressing backup file..."
        gunzip -c "$backup_file" > "$temp_file"
    else
        print_info "Copying SQL file..."
        cp "$backup_file" "$temp_file"
    fi
}

# Function to create local SQLite database
create_local_database() {
    local sql_file="$1"
    local db_name="$2"
    local local_db_file="${db_name}.db"
    
    print_info "Creating local SQLite database: $local_db_file"
    
    # Remove existing file if it exists
    if [ -f "$local_db_file" ]; then
        print_warning "Local database $local_db_file already exists, removing..."
        rm "$local_db_file"
    fi
    
    # Create database from SQL dump
    sqlite3 "$local_db_file" < "$sql_file"
    
    print_success "Local SQLite database created: $local_db_file"
    
    # Show basic info about the restored database
    print_info "Database info:"
    echo "  File: $local_db_file"
    echo "  Size: $(du -h "$local_db_file" | cut -f1)"
    
    # Show tables
    tables=$(sqlite3 "$local_db_file" "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%';" | wc -l)
    echo "  Tables: $tables"
    
    print_info "To query the database: sqlite3 $local_db_file"
}

# Function to create a new Turso database
create_new_turso_database() {
    local sql_file="$1"
    local db_name="$2"
    
    print_info "Creating new Turso database: $db_name"
    
    # Check if turso CLI is available
    if ! command -v turso &> /dev/null; then
        print_error "Turso CLI not found. Install it first:"
        echo "  curl -sSfL https://get.tur.so/install.sh | bash"
        exit 1
    fi
    
    # Check if user is logged in
    if ! turso auth token &> /dev/null; then
        print_error "Not logged in to Turso. Run: turso auth login"
        exit 1
    fi
    
    # Create temporary local database first
    local temp_db="temp_restore_$.db"
    print_info "Creating temporary local database..."
    sqlite3 "$temp_db" < "$sql_file"
    
    # Set WAL mode as required by Turso
    print_info "Setting WAL mode (required by Turso)..."
    sqlite3 "$temp_db" "PRAGMA journal_mode = WAL;"
    
    # Verify WAL mode is set
    wal_mode=$(sqlite3 "$temp_db" "PRAGMA journal_mode;")
    if [ "$wal_mode" != "wal" ]; then
        print_error "Failed to set WAL mode. Current mode: $wal_mode"
        rm "$temp_db"
        exit 1
    fi
    
    print_success "WAL mode enabled successfully"
    
    # Create Turso database from the local file
    print_info "Uploading to Turso..."
    if turso db create "$db_name" --from-file "$temp_db"; then
        print_success "Turso database created: $db_name"
    else
        print_error "Failed to create Turso database"
        rm "$temp_db"
        exit 1
    fi
    
    # Clean up temporary file
    rm "$temp_db"
    
    # Show connection info
    print_info "Connection details:"
    turso db show "$db_name"
    
    print_info "To connect: turso db shell $db_name"
}

# Function to create Turso database
create_turso_database() {
    local sql_file="$1"
    local db_name="$2"
    
    print_info "Creating Turso database: $db_name"
    
    # Check if turso CLI is available
    if ! command -v turso &> /dev/null; then
        print_error "Turso CLI not found. Install it first:"
        echo "  curl -sSfL https://get.tur.so/install.sh | bash"
        exit 1
    fi
    
    # Check if user is logged in
    if ! turso auth token &> /dev/null; then
        print_error "Not logged in to Turso. Run: turso auth login"
        exit 1
    fi
    
    # Create temporary local database first
    local temp_db="temp_restore_$.db"
    print_info "Creating temporary local database..."
    sqlite3 "$temp_db" < "$sql_file"
    
    # Set WAL mode as required by Turso
    print_info "Setting WAL mode (required by Turso)..."
    sqlite3 "$temp_db" "PRAGMA journal_mode = WAL;"
    
    # Verify WAL mode is set
    wal_mode=$(sqlite3 "$temp_db" "PRAGMA journal_mode;")
    if [ "$wal_mode" != "wal" ]; then
        print_error "Failed to set WAL mode. Current mode: $wal_mode"
        rm "$temp_db"
        exit 1
    fi
    
    print_success "WAL mode enabled successfully"
    
    # Create Turso database from the local file
    print_info "Uploading to Turso..."
    if turso db create "$db_name" --from-file "$temp_db"; then
        print_success "Turso database created: $db_name"
    else
        print_error "Failed to create Turso database"
        rm "$temp_db"
        exit 1
    fi
    
    # Clean up temporary file
    rm "$temp_db"
    
    # Show connection info
    print_info "Connection details:"
    turso db show "$db_name"
    
    print_info "To connect: turso db shell $db_name"
}

# Main function
main() {
    local backup_file=""
    local target_db=""
    local local_only=false
    local mode="new"  # "new", "overwrite", "merge"
    local auto_name=false
    
    # Parse arguments
    while [[ $# -gt 0 ]]; do
        case $1 in
            --list-backups)
                list_backups
                exit 0
                ;;
            --show-metadata)
                if [ -z "$2" ]; then
                    print_error "Please provide a backup file to show metadata for"
                    exit 1
                fi
                show_metadata "$2"
                exit 0
                ;;
            --local-only)
                local_only=true
                shift
                ;;
            --overwrite)
                mode="overwrite"
                shift
                ;;
            --merge)
                mode="merge"
                shift
                ;;
            --new-db)
                auto_name=true
                shift
                ;;
            --help)
                show_usage
                exit 0
                ;;
            -*)
                print_error "Unknown option: $1"
                show_usage
                exit 1
                ;;
            *)
                if [ -z "$backup_file" ]; then
                    backup_file="$1"
                elif [ -z "$target_db" ]; then
                    target_db="$1"
                else
                    print_error "Too many arguments"
                    show_usage
                    exit 1
                fi
                shift
                ;;
        esac
    done
    
    # If no arguments provided, show available backups
    if [ -z "$backup_file" ]; then
        print_info "No backup file specified. Here are available backups:"
        echo ""
        list_backups
        echo ""
        print_info "Use: $0 [backup_file] [target_database_name] [options]"
        exit 0
    fi
    
    # Validate backup file exists
    if [ ! -f "$backup_file" ]; then
        print_error "Backup file not found: $backup_file"
        echo ""
        print_info "Available backups:"
        list_backups
        exit 1
    fi
    
    # Generate target database name if not provided or if auto_name is true
    if [ -z "$target_db" ] || [ "$auto_name" = true ]; then
        filename=$(basename "$backup_file")
        timestamp=$(echo "$filename" | grep -o 'backup_[0-9-_]*' | sed 's/backup_//')
        if [ "$auto_name" = true ]; then
            target_db="restored-$timestamp"
        else
            target_db="restored-$timestamp"
        fi
        print_info "Using auto-generated database name: $target_db"
    fi
    
    # Show metadata if available
    show_metadata "$backup_file"
    echo ""
    
    # Confirm the restore operation
    if [ "$mode" = "overwrite" ]; then
        print_warning "This will DESTROY and recreate database: $target_db"
    elif [ "$mode" = "merge" ]; then
        print_warning "This will MERGE data into existing database: $target_db"
    else
        print_warning "This will create a new database: $target_db"
    fi
    
    if [ "$local_only" = true ]; then
        print_info "Local SQLite file will be created: ${target_db}.db"
    else
        print_info "Turso database operation: $target_db (mode: $mode)"
    fi
    
    read -p "Continue? (y/N): " confirm
    if [[ ! "$confirm" =~ ^[Yy]$ ]]; then
        print_info "Operation cancelled"
        exit 0
    fi
    
    # Prepare SQL file
    local temp_sql_file="temp_restore_$.sql"
    prepare_sql_file "$backup_file" "$temp_sql_file"
    
    # Create database
    if [ "$local_only" = true ]; then
        create_local_database "$temp_sql_file" "$target_db"
    else
        if [ "$mode" = "new" ] || [ "$mode" = "overwrite" ]; then
            # Check if database exists for new mode
            if [ "$mode" = "new" ]; then
                if turso db list | grep -q "^$target_db "; then
                    print_error "Database $target_db already exists. Use --overwrite or --merge, or choose a different name"
                    rm "$temp_sql_file"
                    exit 1
                fi
            fi
            
            # Handle overwrite mode
            if [ "$mode" = "overwrite" ]; then
                if turso db list | grep -q "^$target_db "; then
                    print_warning "This will DESTROY the existing database: $target_db"
                    read -p "Are you absolutely sure? Type 'DELETE' to confirm: " confirm
                    if [ "$confirm" != "DELETE" ]; then
                        print_info "Operation cancelled"
                        rm "$temp_sql_file"
                        exit 0
                    fi
                    
                    print_info "Destroying existing database..."
                    turso db destroy "$target_db" --yes
                fi
            fi
            
            create_new_turso_database "$temp_sql_file" "$target_db"
        elif [ "$mode" = "merge" ]; then
            if ! turso db list | grep -q "^$target_db "; then
                print_error "Database $target_db does not exist. Use --new-db to create it"
                rm "$temp_sql_file"
                exit 1
            fi
            merge_into_turso_database "$temp_sql_file" "$target_db"
        fi
    fi
    
    # Clean up
    rm "$temp_sql_file"
    
    print_success "Database restore completed successfully!"
}

# Check for required tools
check_dependencies() {
    local missing_deps=()
    
    if ! command -v sqlite3 &> /dev/null; then
        missing_deps+=("sqlite3")
    fi
    
    if [ ${#missing_deps[@]} -gt 0 ]; then
        print_error "Missing required dependencies:"
        for dep in "${missing_deps[@]}"; do
            echo "  - $dep"
        done
        echo ""
        print_info "Install missing dependencies and try again"
        exit 1
    fi
}

# Run dependency check and main function
check_dependencies
main "$@"