#!/bin/bash

# Backup script for SCloud application
# Backs up the database metadata and creates a snapshot

set -e

BACKUP_DIR="/root/backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

mkdir -p "$BACKUP_DIR"

echo "💾 Creating backup at $TIMESTAMP..."

# Export DynamoDB tables (requires AWS CLI)
if command -v aws &> /dev/null; then
    echo "Backing up DynamoDB tables..."
    
    # Users table
    aws dynamodb scan \
        --table-name scloud-users \
        --output json \
        > "$BACKUP_DIR/users_$TIMESTAMP.json"
    
    # Files table
    aws dynamodb scan \
        --table-name scloud-files \
        --output json \
        > "$BACKUP_DIR/files_$TIMESTAMP.json"
    
    echo "✅ Backup complete!"
    echo "Files saved to: $BACKUP_DIR"
else
    echo "⚠️  AWS CLI not installed. Install with: sudo dnf install awscli"
fi
