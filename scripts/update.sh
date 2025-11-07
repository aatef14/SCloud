#!/bin/bash

# Quick update script for SCloud application
# Use this after making changes to your code

set -e

echo "🔄 Updating SCloud application..."

APP_DIR="/home/ubuntu/scloud-app"
BACKEND_DIR="$APP_DIR/backend"

# Pull latest changes
cd "$APP_DIR"
git pull origin main

# Update backend
echo "📦 Updating backend..."
cd "$BACKEND_DIR"
npm install
pm2 restart scloud-backend

# Update frontend
echo "🎨 Rebuilding frontend..."
cd "$APP_DIR"
npm install
npm run build

# Reload Nginx
echo "🔄 Reloading Nginx..."
sudo systemctl reload nginx

echo "✅ Update complete!"
pm2 status
