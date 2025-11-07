#!/bin/bash

# SCloud Deployment Script for EC2
# This script sets up the application on a fresh EC2 instance

set -e  # Exit on error

echo "🚀 Starting SCloud deployment..."

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
APP_DIR="/home/ubuntu/scloud-app"
BACKEND_DIR="$APP_DIR/backend"
FRONTEND_BUILD_DIR="$APP_DIR/build"

echo -e "${YELLOW}Step 1: Updating system packages...${NC}"
sudo apt update && sudo apt upgrade -y

echo -e "${YELLOW}Step 2: Installing Node.js 20.x...${NC}"
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

echo -e "${YELLOW}Step 3: Installing additional tools...${NC}"
sudo apt install -y git nginx

echo -e "${YELLOW}Step 4: Installing PM2 globally...${NC}"
sudo npm install -g pm2

echo -e "${YELLOW}Step 5: Cloning repository...${NC}"
if [ -d "$APP_DIR" ]; then
    echo "Directory exists, pulling latest changes..."
    cd "$APP_DIR"
    git pull origin main
else
    cd ~
    echo "Enter your GitHub repository URL:"
    read REPO_URL
    git clone "$REPO_URL" scloud-app
    cd scloud-app
fi

echo -e "${YELLOW}Step 6: Setting up backend...${NC}"
cd "$BACKEND_DIR"
npm install

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "Creating .env file from example..."
    cp .env.example .env
    echo -e "${GREEN}✓ Created .env file${NC}"
    echo -e "${YELLOW}⚠️  IMPORTANT: Edit $BACKEND_DIR/.env with your AWS credentials!${NC}"
    echo "Press Enter when you're ready to continue..."
    read
fi

echo -e "${YELLOW}Step 7: Building frontend...${NC}"
cd "$APP_DIR"
npm install
npm run build

echo -e "${YELLOW}Step 8: Configuring Nginx...${NC}"
sudo bash -c 'cat > /etc/nginx/sites-available/scloud << EOF
server {
    listen 80;
    server_name _;

    # Frontend
    location / {
        root /home/ubuntu/scloud-app/build;
        index index.html;
        try_files \$uri \$uri/ /index.html;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
EOF'

# Enable site
sudo ln -sf /etc/nginx/sites-available/scloud /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# Test and restart Nginx
sudo nginx -t
sudo systemctl restart nginx
sudo systemctl enable nginx

echo -e "${YELLOW}Step 9: Starting backend with PM2...${NC}"
cd "$BACKEND_DIR"
pm2 delete scloud-backend 2>/dev/null || true
pm2 start server.js --name scloud-backend
pm2 save
pm2 startup | tail -n 1 | sudo bash || true

echo -e "${GREEN}✓ Deployment complete!${NC}"
echo ""
echo "==================================="
echo "📋 Next Steps:"
echo "==================================="
echo "1. Edit backend .env file: nano $BACKEND_DIR/.env"
echo "2. Add your AWS credentials and configuration"
echo "3. Restart backend: pm2 restart scloud-backend"
echo "4. Check backend logs: pm2 logs scloud-backend"
echo "5. Check Nginx status: sudo systemctl status nginx"
echo ""
echo "🌐 Your application should be running at: http://$(curl -s ifconfig.me)"
echo "==================================="
