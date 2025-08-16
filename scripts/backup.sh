#!/bin/bash

# Configuration
BACKUP_DIR="/opt/7erfa/backups"
MONGODB_CONTAINER="7erfa_mongodb_1"
REDIS_CONTAINER="7erfa_redis_1"
S3_BUCKET="s3://7erfa-backups"
RETENTION_DAYS=30

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

# Get current timestamp
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

# Backup MongoDB
echo "Starting MongoDB backup..."
docker exec $MONGODB_CONTAINER mongodump \
    --username $MONGODB_USER \
    --password $MONGODB_PASS \
    --authenticationDatabase admin \
    --archive > "$BACKUP_DIR/mongodb_$TIMESTAMP.archive"

# Backup Redis
echo "Starting Redis backup..."
docker exec $REDIS_CONTAINER redis-cli -a $REDIS_PASSWORD SAVE
docker cp $REDIS_CONTAINER:/data/dump.rdb "$BACKUP_DIR/redis_$TIMESTAMP.rdb"

# Compress backups
echo "Compressing backups..."
tar -czf "$BACKUP_DIR/backup_$TIMESTAMP.tar.gz" \
    "$BACKUP_DIR/mongodb_$TIMESTAMP.archive" \
    "$BACKUP_DIR/redis_$TIMESTAMP.rdb"

# Upload to S3
echo "Uploading to S3..."
aws s3 cp "$BACKUP_DIR/backup_$TIMESTAMP.tar.gz" "$S3_BUCKET/"

# Clean up local files older than retention period
echo "Cleaning up old backups..."
find "$BACKUP_DIR" -type f -mtime +$RETENTION_DAYS -delete

echo "Backup completed successfully!"
