#!/bin/bash

# Make all scripts executable
chmod +x scripts/*.sh

echo "✅ All scripts are now executable!"
echo ""
echo "Available scripts:"
echo "  ./scripts/deploy.sh      - Full deployment to EC2"
echo "  ./scripts/update.sh      - Quick update after code changes"
echo "  ./scripts/setup-ssl.sh   - Setup SSL certificate"
echo "  ./scripts/backup.sh      - Backup DynamoDB data"
