#!/bin/bash

# Install SSL certificate using Let's Encrypt
# Usage: ./setup-ssl.sh yourdomain.com

set -e

if [ -z "$1" ]; then
    echo "Usage: ./setup-ssl.sh yourdomain.com"
    exit 1
fi

DOMAIN=$1

echo "🔐 Setting up SSL certificate for $DOMAIN..."

# Install Certbot
echo "📦 Installing Certbot..."
sudo apt update
sudo apt install -y certbot python3-certbot-nginx

# Get certificate
echo "📜 Obtaining SSL certificate..."
sudo certbot --nginx -d "$DOMAIN" -d "www.$DOMAIN"

# Test auto-renewal
echo "🧪 Testing certificate auto-renewal..."
sudo certbot renew --dry-run

echo "✅ SSL certificate installed successfully!"
echo "Your site is now accessible at: https://$DOMAIN"
